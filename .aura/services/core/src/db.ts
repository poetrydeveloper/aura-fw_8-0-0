// .aura/services/core/src/db.ts
import neo4j, { Driver, Session } from 'neo4j-driver';

interface SyncShellFields {
    shell_id: string;
    subject: string;
    verb: string;
    object: string;
    ast_json: string;
    class_name: string;
    flamework_pattern: string;
    method_name: string;
    execution_side: string;
    output_type: string;
}

class MemgraphDatabase {
    private driver: Driver;

    constructor() {
        const uri = process.env.MEMGRAPH_URI || 'bolt://memgraph:7687';
        this.driver = neo4j.driver(uri, neo4j.auth.basic('', ''));
        console.log('[Memgraph DB] Драйвер успешно инициализирован.');
    }

    /**
     * Создает уникальные индексы в Memgraph при старте системы (Защита от дубликатов)
     */
    public async initConstraints(): Promise<void> {
        const session: Session = this.driver.session();
        try {
            // Нативный, железобетонный синтаксис ограничений уникальности Memgraph v3+
            await session.run(`
                CREATE CONSTRAINT ON (s:Shell) ASSERT s.id IS UNIQUE;
            `);
            console.log('[Memgraph DB] Семантические ограничения уникальности успешно применены.');
        } catch (error: any) {
            if (!error.message.includes('already exists') && !error.message.includes('Exists')) {
                console.error('[Memgraph DB Error] Ошибка создания индексов:', error.message);
            }
        } finally {
            await session.close();
        }
    }
/**
     * Атомарная транзакция: Создание мутации ракушки, AST-кода и перенос ребер графа
     */
    public async syncShellWithMutation(payload: SyncShellFields): Promise<void> {
        const session: Session = this.driver.session();
        
        try {
            await session.executeWrite(async (tx) => {
                const cypherQuery = `
                    // Ищем старого активного предка (если он есть) по уникальному ID ракушки
                    OPTIONAL MATCH (oldS:Shell {id: $shellId, status: "active"})
                    
                    // Создаем новую ноду ракушки с инкрементом версии и инжекцией метаданных
                    CREATE (newS:Shell {
                        id: $shellId,
                        version: COALESCE(oldS.version, 0) + 1,
                        status: "active",
                        ast_json: $astJson,
                        subject: $subject,
                        verb: $verb,
                        object: $object,
                        class_name: $className,
                        flamework_pattern: $flameworkPattern,
                        method_name: $methodName,
                        execution_side: $executionSide,
                        output_type: $outputType,
                        synced_at: timestamp()
                    })
                    
                    // Если предок существовал, прокладываем эволюционное ребро мутации
                    FOREACH (_ IN CASE WHEN oldS IS NOT NULL THEN ELSE [] END |
                        CREATE (oldS)-[:MUTATED_TO {timestamp: timestamp()}]->(newS)
                    )
                    
                    WITH oldS, newS
                    // Переносим входящие связи логического порядка [:NEXT] на новую ноду
                    OPTIONAL MATCH (sender)-[rIn:NEXT]->(oldS)
                    FOREACH (_ IN CASE WHEN rIn IS NOT NULL THEN ELSE [] END |
                        CREATE (sender)-[:NEXT]->(newS)
                        DELETE rIn
                    )
                    
                    WITH oldS, newS
                    // Переносим исходящие связи логического порядка [:NEXT] на новую ноду
                    OPTIONAL MATCH (oldS)-[rOut:NEXT]->(receiver)
                    FOREACH (_ IN CASE WHEN rOut IS NOT NULL THEN ELSE [] END |
                        CREATE (newS)-[:NEXT]->(receiver)
                        DELETE rOut
                    )
                    
                    WITH oldS, newS
                    // Переносим связи привязки к физическому файлу проекта [:PART_OF]
                    OPTIONAL MATCH (oldS)-[rPart:PART_OF]->(f:File)
                    FOREACH (_ IN CASE WHEN rPart IS NOT NULL THEN ELSE [] END |
                        CREATE (newS)-[:PART_OF {order: rPart.order}]->(f)
                        DELETE rPart
                    )
                    
                    // Переводим старого предка в архивный карантин депрекации
                    FOREACH (_ IN CASE WHEN oldS IS NOT NULL THEN ELSE [] END |
                        SET oldS.status = "deprecated", oldS.deprecated_at = timestamp()
                    )
                `;

                await tx.run(cypherQuery, {
                    shellId: payload.shell_id,
                    subject: payload.subject,
                    verb: payload.verb,
                    object: payload.object,
                    astJson: payload.ast_json,
                    className: payload.class_name,
                    flameworkPattern: payload.flamework_pattern,
                    methodName: payload.method_name,
                    executionSide: payload.execution_side,
                    outputType: payload.output_type
                });
            });

            console.log(`[Memgraph DB] Ракушка "${payload.shell_id}" транзакционно синхронизирована в графе.`);
        } catch (error: any) {
            console.error(`[Memgraph DB Error] Сбой мутации для ракушки "${payload.shell_id}":`, error.message);
            throw error;
        } finally {
            await session.close();
        }
    }

    /**
     * Закрытие драйвера СУБД при выключении контейнера
     */
    public async close(): Promise<void> {
        await this.driver.close();
    }
}

export const db = new MemgraphDatabase();