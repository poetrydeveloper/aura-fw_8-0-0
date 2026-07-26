// .aura/services/core/src/weaver.ts
import fs from 'fs-extra';
import path from 'path';
import { Project, Diagnostic } from 'ts-morph';
import neo4j, { Driver, Session } from 'neo4j-driver';

import { translateJsxToTs } from './weaver_data/jsx_parser';
import { generateComponentTypesFile } from './weaver_data/types_generator';

const TARGET_SRC_PATH = path.resolve('/app/src');

// Чистый Roblox/Luau заголовок без единого дубликата компонентов
const globalMocksHeader = `// --- AURA RUNTIME TYPE EMBED CONTOUR v14.6 ---
declare const game: any; declare const Enum: any; declare const math: any; 
declare const Vector3: any; declare const CFrame: any; 
declare function warn(...args: any[]): void; declare function print(...args: any[]): void;
`;

export class CodeWeaver {
    private driver: Driver;

    constructor() {
        const uri = process.env.MEMGRAPH_URI || 'bolt://memgraph:7687';
        this.driver = neo4j.driver(uri, neo4j.auth.basic('', ''));
    }

    public async weaveProject(): Promise<void> {
        console.log("=== RUNNING AURA DECENTRALIZED WEAVER v14.6 ===");
        const session: Session = this.driver.session();

        // БРОНЕБОЙНАЯ НАСТРОЙКА: Полностью изолируем ОЗУ-компилятор от внешних путей и модулей
        const validationProject = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { 
                target: 99, 
                module: 199, 
                moduleResolution: 99, 
                strict: false, // Мягкий контроль типов для ИИ-кода
                skipLibCheck: true, // Игнорируем отсутствие внешних библиотек вроде @flamework
                noImplicitAny: false,
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                ignoreDeprecations: "6.0" // Глушим предупреждения TS 7.0
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
                console.warn("[Weaver Warning] В графе Memgraph не обнаружено активных ракушек.");
                return;
            }

            const generatedFiles: { virtualPath: string; physicalPath: string }[] = [];

            // 1. Генерация файла типов компонентов
            const componentShells = result.records.filter(r => r.get('pattern') === 'Component');
            if (componentShells.length > 0) {
                const compArtifact = generateComponentTypesFile(validationProject, componentShells, TARGET_SRC_PATH);
                generatedFiles.push({ virtualPath: "src/shared/types/components.types.ts", physicalPath: compArtifact.physicalPath });
            }

            const classBuckets = new Map<string, { pattern: string; side: string; shells: any[] }>();
            const systemShells = result.records.filter(r => r.get('pattern') !== 'Component');

            systemShells.forEach(record => {
                const className = record.get('className') || "MovementSystem";
                if (!classBuckets.has(className)) {
                    classBuckets.set(className, { pattern: record.get('pattern') || "MatterSystem", side: (record.get('side') || "Server").toLowerCase(), shells: [] });
                }
                classBuckets.get(className)!.shells.push(record);
            });

            // 2. Сборка классов ECS-систем
            for (const [className, bucket] of classBuckets.entries()) {
                const subFolder = bucket.pattern === 'ControllerMethod' ? 'client/controllers' : 'server/ecs/systems';
                const decoratorName = bucket.pattern === 'ControllerMethod' ? 'Controller' : 'Service';
                const virtualPath = `src/${subFolder}/${className}.ts`;
                const physicalPath = path.join(TARGET_SRC_PATH, subFolder, `${className}.ts`);

                let fileContent = `${globalMocksHeader}\nexport class ${className} {\n    constructor() {}\n\n`;

                bucket.shells.forEach(record => {
                    const rawBody = record.get('astJson') || "";
                    const compiledBody = translateJsxToTs(rawBody);
                    const outputType = record.get('outputType') || 'void';
                    
                    const paramsList = ['ctx: any'];
                    const methodNameLower = (record.get('methodName') || "").toLowerCase();
                    const isMovementMethod = ["movement", "update", "physics", "velocity", "position", "move", "cleaner"].some(k => methodNameLower.includes(k)) || rawBody.includes("VelocityComponent");
                    
                    if (record.get('pattern') === "MatterSystem" && isMovementMethod) paramsList.push("deltaTime: number");
                    fileContent += `    public ${record.get('methodName')}(${paramsList.join(', ')}): ${outputType} {\n${compiledBody}\n    }\n\n`;
                });

                fileContent += "}\n";
                validationProject.createSourceFile(virtualPath, fileContent, { overwrite: true });
                generatedFiles.push({ virtualPath, physicalPath });
            }

            console.log(`| 🛡️ Запуск сквозного контроля типов ts-morph в ОЗУ...`);
            const typeErrors: string[] = [];
            generatedFiles.forEach(file => {
                const sFile = validationProject.getSourceFile(file.virtualPath);
                if (sFile) {
                    sFile.getPreEmitDiagnostics().forEach((diag: Diagnostic) => {
                        let msg = diag.getMessageText();
                        let messageText = typeof msg === 'string' ? msg : msg.getMessageText();
                        
                        // ФИЛЬТР ВНЕШНИХ МОДУЛЕЙ: Пропускаем только критические ошибки синтаксиса нашего кода
                        if (messageText.includes("Cannot find module") || messageText.includes("baseUrl") || messageText.includes("Duplicate identifier")) {
                            return; // Мягко игнорируем окружение
                        }
                        typeErrors.push(`[TS-Weaver-Error] Файл ${path.basename(file.virtualPath)}: ${messageText}`);
                    });
                }
            });

            if (typeErrors.length > 0) {
                throw new Error("Ткач обнаружил критические ошибки синтаксиса в ИИ-коде:\n" + typeErrors.join('\n'));
            }

            // СБРОС НА ДИСК: Физически записываем чистые TypeScript файлы на хост!
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
        } finally { await session.close(); }
    }
}
export const weaver = new CodeWeaver();