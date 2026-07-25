// .aura/services/core/src/weaver.ts
import fs from 'fs-extra';
import path from 'path';
import { Project, Diagnostic } from 'ts-morph';
import neo4j, { Driver, Session } from 'neo4j-driver';

const TARGET_SRC_PATH = path.resolve('/app/src');

const globalMocksHeader = `// --- AURA RUNTIME TYPE EMBED CONTOUR v14.6 ---
import { SharedTypes } from "shared/types/components.types";

declare const game: any; declare const Enum: any; declare const math: any; 
declare const Vector3: any; declare const CFrame: any; 
declare function warn(...args: any[]): void; declare function print(...args: any[]): void;

declare const ArchetypeComponent: unique symbol; declare const VelocityComponent: unique symbol;
declare const CFrameComponent: unique symbol; declare const WeaponStateComponent: unique symbol;
declare const HealthComponent: unique symbol; declare const ExplosionTriggerComponent: unique symbol;

declare function ArchetypeComponent(p: any): any; declare function VelocityComponent(p: any): any;
declare function CFrameComponent(p: any): any; declare function WeaponStateComponent(p: any): any;
declare function HealthComponent(p: any): any; declare function ExplosionTriggerComponent(p: any): any;
`;

export class CodeWeaver {
    private driver: Driver;

    constructor() {
        const uri = process.env.MEMGRAPH_URI || 'bolt://memgraph:7687';
        this.driver = neo4j.driver(uri, neo4j.auth.basic('', ''));
    }

    /**
     * Преобразование JSX-кассет логики Memgraph в чистый TypeScript
     */
    private translateJsxToTs(jsxCode: string): string {
        if (!jsxCode) return "";
        let result = jsxCode;

        result = result.replace(/<Query\s+components=\{\s*\[([\s\S]*?)\]\s*\}\s*>/g, (match, p1) => {
            const comps = p1.split(',').map((s: string) => s.replace(/["'\s]/g, ""));
            const iterators = comps.map((c: string) => c.replace('Component', '').toLowerCase()).join(', ');
            return `for (const [entityId, [${iterators}]] of ctx.world.query(${comps.map((c: string) => `SharedTypes.${c}`).join(', ')})) {`;
        });

        result = result.replace(/<\/Query>/g, '}');
        result = result.replace(/<Safety\s+limit=\{\s*(\d+)\s*\}\s*\/>/g, 'let safetyCounter = 0; if (++safetyCounter > $1) { warn("Safety trigger activated"); break; }');
        result = result.replace(/<Guard\s+condition=\{?["']([^"']+)["']\}?\s*\/>/g, 'if ($1) { continue; }');
        result = result.replace(/<Calculate\s+var=["']([^"']+)["']\s+expr=\{?["']([^"']+)["']\}?\s*\/>/g, 'const $1 = $2;');
        
        result = result.replace(/<Mutate\s+component=["']([^"']+)["']\s+values=\{\{\s*([\s\S]*?)\s*\}\}\s*(?:targetEntity=\{?["']([^"']+)["']\}?)?\s*\/>/g, (match, comp, values, target) => {
            const targetId = target || 'entityId';
            const cleanValues = values.replace(/["']/g, "");
            return `ctx.world.insert(${targetId}, SharedTypes.${comp}({ ${cleanValues} }));`;
        });
        
        result = result.replace(/<NestedQuery\s+target=["']([^"']+)["']\s*>/g, 'for (const [targetEntityId, [targetArchetype, targetCFrame]] of ctx.world.query(SharedTypes.ArchetypeComponent, SharedTypes.CFrameComponent)) { if (targetArchetype.id !== "$1") continue;');
        result = result.replace(/<\/NestedQuery>/g, '}');

        return result;
    }
    /**
     * Основной цикл сквозной сборки проекта из графа Memgraph СУБД
     */
    public async weaveProject(): Promise<void> {
        console.log("=== RUNNING AURA DECENTRALIZED WEAVER v14.6 ===");
        const session: Session = this.driver.session();

        const validationProject = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { 
                target: 99, module: 199, moduleResolution: 99,
                strict: true, noImplicitAny: true,
                experimentalDecorators: true, emitDecoratorMetadata: true,
                skipLibCheck: true, baseUrl: "src",
                paths: { "*": ["*", "shared/*", "shared/types/*"] }
            }
        });

        try {
            const cypherQuery = `
                MATCH (s:Shell {status: "active"})
                RETURN s.id AS id, s.ast_json AS astJson, s.class_name AS className,
                       s.method_name AS methodName, s.execution_side AS side,
                       s.flamework_pattern AS pattern, s.output_type AS outputType
            `;
            const result = await session.run(cypherQuery);

            if (result.records.length === 0) {
                console.warn("[Weaver Warning] В графе Memgraph не обнаружено активных ракушек для сборки.");
                return;
            }

            const generatedFiles: { virtualPath: string; physicalPath: string }[] = [];

            // Автоматическая сборка слоя типов компонентов (ДНК weaver_types.ts)
            const componentShells = result.records.filter(r => r.get('pattern') === 'Component');
            if (componentShells.length > 0) {
                const compArtifact = this.generateComponentTypesFile(validationProject, componentShells);
                generatedFiles.push({ 
                    virtualPath: "src/shared/types/components.types.ts", 
                    physicalPath: compArtifact.physicalPath 
                });
            }

            // Группируем ракушки систем Matter ECS по файлам в Map-бакеты
            const classBuckets = new Map<string, { pattern: string; side: string; shells: any[] }>();
            const systemShells = result.records.filter(r => r.get('pattern') !== 'Component');

            systemShells.forEach(record => {
                const className = record.get('className') || "MovementSystem";
                if (!classBuckets.has(className)) {
                    classBuckets.set(className, { 
                        pattern: record.get('pattern') || "MatterSystem", 
                        side: (record.get('side') || "Server").toLowerCase(), 
                        shells: [] 
                    });
                }
                classBuckets.get(className)!.shells.push(record);
            });

            // Цикл генерации содержимого файлов
            for (const [className, bucket] of classBuckets.entries()) {
                const subFolder = bucket.pattern === 'ControllerMethod' ? 'client/controllers' : 'server/ecs/systems';
                const decoratorName = bucket.pattern === 'ControllerMethod' ? 'Controller' : 'Service';

                const virtualPath = `src/${subFolder}/${className}.ts`;
                const physicalPath = path.join(TARGET_SRC_PATH, subFolder, `${className}.ts`);

                let fileContent = `${globalMocksHeader}import { ${decoratorName} } from '@flamework/core';\n\n@${decoratorName}()\nexport class ${className} {\n    constructor() {}\n\n`;

                bucket.shells.forEach(record => {
                    const rawBody = record.get('astJson') || "";
                    const compiledBody = this.translateJsxToTs(rawBody);
                    const outputType = record.get('outputType') || 'void';
                    
                    const paramsList = ['ctx: SharedTypes.AuraContext'];
                    const methodNameLower = (record.get('methodName') || "").toLowerCase();
                    
                    const movementKeywords = ["movement", "update", "physics", "velocity", "position", "move", "cleaner", "collision"];
                    const isMovementMethod = movementKeywords.some(keyword => methodNameLower.includes(keyword)) || rawBody.includes("VelocityComponent");
                    
                    if (record.get('pattern') === "MatterSystem" && isMovementMethod) {
                        paramsList.push("deltaTime: number");
                    }

                    fileContent += `    public ${record.get('methodName')}(${paramsList.join(', ')}): ${outputType} {\n${compiledBody}\n    }\n\n`;
                });

                fileContent += "}\n";
                validationProject.createSourceFile(virtualPath, fileContent, { overwrite: true });
                generatedFiles.push({ virtualPath, physicalPath });
            }

            // 3. Сквозной контроль типов ts-morph в ОЗУ контейнера
            console.log(`| 🛡️ Запуск сквозного контроля типов ts-morph в ОЗУ...`);
            const typeErrors: string[] = [];

            generatedFiles.forEach(file => {
                const sFile = validationProject.getSourceFile(file.virtualPath);
                if (sFile) {
                    sFile.getPreEmitDiagnostics().forEach((diag: Diagnostic) => {
                        let msg = diag.getMessageText();
                        let messageText = typeof msg === 'string' ? msg : msg.getMessageText();
                        typeErrors.push(`[TS-Weaver-Error] Файл ${path.basename(file.virtualPath)} (Строка ${diag.getLineNumber()}): ${messageText}`);
                    });
                }
            });

            if (typeErrors.length > 0) { 
                throw new Error("СБОРКА АННУЛИРОВАНА: Ткач обнаружил ошибки типизации ИИ-кода в ОЗУ:\n" + typeErrors.join('\n')); 
            }

            // 4. ТРАНЗАКЦИОННАЯ ЗАПИСЬ НА ДИСК ХОСТА (Только при 0 ошибок)
            for (const file of generatedFiles) {
                const sFile = validationProject.getSourceFile(file.virtualPath);
                if (sFile) {
                    sFile.formatText();
                    await fs.ensureDir(path.dirname(file.physicalPath));
                    await fs.writeFile(file.physicalPath, sFile.getText(), 'utf8');
                }
            }

            console.log("=== ЦИКЛ СБОРКИ СЕТИ AURA_7 УСПЕШНО ЗАВЕРШЕН ===\n");

        } catch (error: any) {
            console.error("❌ КРИТИЧЕСКИЙ СБОЙ КОДОГЕНЕРАЦИИ ТКАЧА:", error.message);
            throw error;
        } finally {
            await session.close();
        }
    }

    /**
     * 🧵 ДНК МОДУЛЯ WEAVER_TYPES: Генерация реестра компонентов в ОЗУ (Инкапсулировано внутри класса)
     */
    private generateComponentTypesFile(validationProject: any, componentRecords: any[]): any {
        let content = `// Auto-generated by Aura Weaver v14.6
export namespace SharedTypes {
  export interface AuraContext {
    world: any; deltaTime: number; tick: number; isLocalPlayer: boolean;
    getPlatformInputVector(): any; getBaseSpeed(archetype: string): number;
  }
}
`;
        componentRecords.forEach(record => {
            const name = record.get('className');
            let fieldsObj: Record<string, string> = {};
            try { fieldsObj = JSON.parse(record.get('astJson') || "{}"); } catch(e) {}

            let interfaceContent = `  export interface ${name} {\n`;
            Object.entries(fieldsObj).forEach(([fieldName, fieldType]) => {
                interfaceContent += `    ${fieldName}: ${fieldType};\n`;
            });
            interfaceContent += `  }\n\n`;
            content += interfaceContent;
        });

        content += `\n  export type ComponentMap = {\n    ${componentRecords.map(r => `'${r.get('className')}': ${r.get('className')};`).join('\n    ')}\n  };\n}\n`;

        const virtualPath = "src/shared/types/components.types.ts";
        const physicalPath = path.join(TARGET_SRC_PATH, "shared/types/components.types.ts");
        
        return { 
            virtualFile: validationProject.createSourceFile(virtualPath, content, { overwrite: true }), 
            physicalPath 
        };
    }
}

export const weaver = new CodeWeaver();
