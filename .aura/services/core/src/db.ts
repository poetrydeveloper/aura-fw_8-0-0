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
    rojo_target: string; // <=== ДОБАВЛЕНО В ИНТЕРФЕЙС ПАКЕТА ДНК
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
     * Создает аппаратно защищенное ограничение уникальности по суррогатному ключу uid
     * НАДЕЖНЫЙ ЦИКЛ ОЖИДАНИЯ ХОЛОДНОГО СТАРТА СУБД (Защита от ECONNREFUSED)
     */
    public async initConstraints(): Promise<void> {
        let connected = false;
        let retries = 5;

        while (!connected && retries > 0) {
            const session = this.driver.session();
            try {
                // Сносим старые плоские индексы, если они вызывали заторы
                await session.run(`DROP CONSTRAINT ON (s:Shell) ASSERT s.id IS UNIQUE;`).catch(() => {});

                // Навешиваем абсолютную защиту на уникальный конкатенированный ключ версии!
                await session.run(`CREATE CONSTRAINT ON (s:Shell) ASSERT s.uid IS UNIQUE;`);
                console.log('[Memgraph DB] Аппаратная защита уникальности версий (s.uid) успешно активирована.');
                connected = true;
            } catch (error: any) {
                if (error.message.includes('already exists') || error.message.includes('Exists')) {
                    console.log('[Memgraph DB] Ограничения уникальности uid уже были созданы ранее.');
                    connected = true;
                    break;
                }
                
                retries--;
                console.warn(`[Memgraph DB] Ожидание прогрева графа... Осталось попыток: ${retries}`);
                if (retries === 0) {
                    console.error('[Memgraph DB Error] Фатальный сбой: Memgraph не ответил за отведенное время.');
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            } finally {
                await session.close();
            }
        }
    }

    /**
     * Атомарная транзакция: Создание мутации ракушки, AST-кода и перенос ребер графа (Memgraph Native)
     */
    public async syncShellWithMutation(payload: SyncShellFields): Promise<void> {
        const session: Session = this.driver.session();
        try {
            await session.executeWrite(async (tx) => {
                const cypherQuery = `
                    // Ищем старого активного предка по уникальному ID ракушки
                    OPTIONAL MATCH (oldS:Shell {id: $shellId, status: "active"})
                    
                    // Вычисляем следующую версию в графе
                    WITH oldS, COALESCE(oldS.version, 0) + 1 AS nextVersion
                    
                    // СОЗДАЕМ ИММУТАБЕЛЬНУЮ НОДУ ЧЕРЕЗ CREATE С КОН КАТЕНИРОВАННЫМ КЛЮЧОМ UID
                    CREATE (newS:Shell {
                        id: $shellId, 
                        version: nextVersion,
                        uid: $shellId + "_" + toString(nextVersion), // <=== НАШ АППАРАТНЫЙ ЩИТ УНИКАЛЬНОСТИ
                        status: "active",
                        ast_json: $astJson, 
                        subject: $subject, 
                        verb: $verb, 
                        object: $object,
                        class_name: $className, 
                        flamework_pattern: $flameworkPattern,
                        method_name: $methodName, 
                        execution_side: $executionSide,
                        rojo_target: $rojoTarget, // <=== УЗЕЛ ТЕПЕРЬ ХРАНИТ РЕКОМЕНДОВАННУЮ АДРЕСАЦИЮ В ГРАФЕ
                        output_type: $outputType, 
                        synced_at: timestamp()
                    })
                    
                    WITH oldS, newS
                    // Эволюционная связь мутации (Ветвление через Memgraph-списки)
                    FOREACH (_ IN [x IN [oldS] WHERE x IS NOT NULL] | 
                        CREATE (oldS)-[:MUTATED_TO {timestamp: timestamp()}]->(newS)
                    )
                    
                    WITH oldS, newS
                    // Перенос входящих ребер порядка [:NEXT]
                    OPTIONAL MATCH (sender)-[rIn:NEXT]->(oldS)
                    FOREACH (_ IN [x IN [rIn] WHERE x IS NOT NULL] | 
                        CREATE (sender)-[:NEXT]->(newS) 
                        DELETE rIn
                    )
                    
                    WITH oldS, newS
                    // Перенос исходящих ребер порядка [:NEXT]
                    OPTIONAL MATCH (oldS)-[rOut:NEXT]->(receiver)
                    FOREACH (_ IN [x IN [rOut] WHERE x IS NOT NULL] | 
                        CREATE (newS)-[:NEXT]->(receiver) 
                        DELETE rOut
                    )
                    
                    WITH oldS, newS
                    // Перенос связей привязки к физическому файлу проекта [:PART_OF]
                    OPTIONAL MATCH (oldS)-[rPart:PART_OF]->(f:File)
                    FOREACH (_ IN [x IN [rPart] WHERE x IS NOT NULL] | 
                        CREATE (newS)-[:PART_OF {order: rPart.order}]->(f) 
                        DELETE rPart
                    )
                    
                    WITH oldS
                    // Депрекация старого предка в архивный карантин
                    FOREACH (_ IN [x IN [oldS] WHERE x IS NOT NULL] | 
                        SET oldS.status = "deprecated", oldS.deprecated_at = timestamp()
                    )
                `;
                await tx.run(cypherQuery, {
                    shellId: payload.shell_id, subject: payload.subject, verb: payload.verb, object: payload.object,
                    astJson: payload.ast_json, className: payload.class_name, flameworkPattern: payload.flamework_pattern,
                    methodName: payload.method_name, executionSide: payload.execution_side, 
                    rojoTarget: payload.rojo_target, // <=== ИНЖЕКТ ПЕРЕМЕННОЙ В ТРАНЗАКЦИЮ СУБД
                    outputType: payload.output_type
                });
            });
            console.log(`[Memgraph DB] Ракушка "${payload.shell_id}" транзакционно синхронизирована.`);
        } catch (error: any) {
            console.error(`[Memgraph DB Error] Сбой мутации "${payload.shell_id}":`, error.message);
            throw error;
        } finally { await session.close(); }
    }

    /**
     * Закрытие драйвера СУБД при выключении контейнера
     */
    public async close(): Promise<void> {
        await this.driver.close();
    }
}

export const db = new MemgraphDatabase();