import fs from 'fs-extra';
import path from 'path';
import { Project } from 'ts-morph';
import neo4j, { Driver, Session } from 'neo4j-driver';

import { translateJsxToTs } from './weaver_data/jsx_parser';
import { generateComponentTypesFile } from './weaver_data/types_generator';

const TARGET_SRC_PATH = path.resolve('/app/src');
const MAP_PROJECT_DIR = path.resolve('/app/.aura/services/core/dist');

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
        console.log("=== RUNNING AURA INVERTED-MAP WEAVER v15.1 ===");
        const session: Session = this.driver.session();
        const validationProject = new Project({ useInMemoryFileSystem: true });
        
        // Каноническое дерево «наоборот»: [Путь к файлу] -> [Массив ID ракушек]
        const mapProjectData: Record<string, string[]> = {};

        try {
            const cypherQuery = `
                MATCH (s:Shell {status: "active"})
                RETURN s.id AS id, s.ast_json AS astJson, s.class_name AS className,
                       s.method_name AS methodName, s.execution_side AS side,
                       s.flamework_pattern AS pattern, s.output_type AS outputType,
                       s.rojo_target AS rojoTarget
            `;
            const result = await session.run(cypherQuery);
            if (result.records.length === 0) {
                console.warn("[Weaver Warning] В графе Memgraph не обнаружено активных ракушек.");
                return;
            }

            const generatedFiles: { virtualPath: string; physicalPath: string }[] = [];

            // 1. Генерация слоя типов компонентов
            const componentShells = result.records.filter(r => r.get('pattern') === 'Component');
            if (componentShells.length > 0) {
                // ИСПРАВЛЕНО: Безопасное чтение свойства из первой ноды массива [0]
                const customTarget = componentShells[0].get('rojoTarget');
                const targetRelPath = customTarget || "src/shared/components.types.ts";
                
                const compArtifact = generateComponentTypesFile(validationProject, componentShells, TARGET_SRC_PATH);
                const absPhysicalPath = path.resolve('/app', targetRelPath);
                
                generatedFiles.push({ virtualPath: "src/shared/components.types.ts", physicalPath: absPhysicalPath });
                
                // Наполняем дерево «наоборот» для компонентов
                if (!mapProjectData[targetRelPath]) mapProjectData[targetRelPath] = [];
                componentShells.forEach(r => {
                    const shellId = r.get('id');
                    if (shellId) mapProjectData[targetRelPath].push(shellId);
                });
            }

            // Группируем ракушки логики по именам классов
            const classBuckets = new Map<string, { pattern: string; side: string; shells: any[] }>();
            const systemShells = result.records.filter(r => r.get('pattern') !== 'Component');

            systemShells.forEach(record => {
                const className = record.get('className') || "MovementSystem";
                if (!classBuckets.has(className)) {
                    classBuckets.set(className, { pattern: record.get('pattern') || "MatterSystem", side: (record.get('side') || "Server").toLowerCase(), shells: [] });
                }
                classBuckets.get(className)!.shells.push(record);
            });

            // 2. Сборка классов ECS-систем по правилам ИИ-адресации
            for (const [className, bucket] of classBuckets.entries()) {
                // ИСПРАВЛЕНО: Безопасное чтение свойства из первой ноды массива бакета [0]
                const rawRojoTarget = bucket.shells[0].get('rojoTarget');
                
                let targetRelPath = rawRojoTarget;
                if (!targetRelPath) {
                    const subFolder = bucket.pattern === 'ControllerMethod' ? 'client/controllers' : 'server/systems';
                    targetRelPath = `src/${subFolder}/${className}.ts`;
                }

                const virtualPath = `src/virtual_${className}.ts`;
                const physicalPath = path.resolve('/app', targetRelPath);

                let fileContent = `${globalMocksHeader}\nexport class ${className} {\n    constructor() {}\n\n`;

                if (!mapProjectData[targetRelPath]) mapProjectData[targetRelPath] = [];

                bucket.shells.forEach(record => {
                    const rawBody = record.get('astJson') || "";
                    const compiledBody = translateJsxToTs(rawBody);
                    const outputType = record.get('outputType') || 'void';
                    
                    const paramsList = ['ctx: any'];
                    if (bucket.pattern === "MatterSystem") {
                        paramsList.push("deltaTime: number");
                    }

                    fileContent += `    public ${record.get('methodName')}(${paramsList.join(', ')}): ${outputType} {\n${compiledBody}\n    }\n\n`;
                    
                    // Наполняем дерево «наоборот» для систем логики
                    const shellId = record.get('id');
                    if (shellId) mapProjectData[targetRelPath].push(shellId);
                });

                fileContent += "}\n";
                validationProject.createSourceFile(virtualPath, fileContent, { overwrite: true });
                generatedFiles.push({ virtualPath, physicalPath });
            }

            for (const file of generatedFiles) {
                const sFile = validationProject.getSourceFile(file.virtualPath);
                if (sFile) {
                    sFile.formatText();
                    await fs.ensureDir(path.dirname(file.physicalPath));
                    await fs.writeFile(file.physicalPath, sFile.getText(), 'utf8');
                }
            }

            // Атомарно записываем инвертированное Rojo JSON-дерево
            await fs.ensureDir(MAP_PROJECT_DIR);
            const mapProjectFilePath = path.join(MAP_PROJECT_DIR, 'map_project.json');
            await fs.writeJson(mapProjectFilePath, mapProjectData, { spaces: 4 });
            
            console.log("=== ЦИКЛ СБОРКИ СЕТИ AURA_7 И MAP_PROJECT УСПЕШНО ЗАВЕРШЕН ===");
        } catch (error: any) {
            console.error("❌ КРИТИЧЕСКИЙ СБОЙ КОДОГЕНЕРАЦИИ ТКАЧА:", error.message);
            throw error;
        } finally { await session.close(); }
    }
}
export const weaver = new CodeWeaver();