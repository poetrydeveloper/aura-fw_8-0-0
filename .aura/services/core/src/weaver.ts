import fs from 'fs-extra';
import path from 'path';
import { Project } from 'ts-morph';
import neo4j, { Driver, Session } from 'neo4j-driver';

// Импортируем наши изолированные модули Julia
import { translateJuliaToTs } from './weaver_julia/julia_parser';
import { compileJuliaComponentTypes } from './weaver_julia/types_compiler';

const TARGET_SRC_PATH = path.resolve('/app/src');
const MAP_PROJECT_DIR = path.resolve('/app/.aura/services/core/dist');

const globalMocksHeader = `// --- AURA RUNTIME TYPE EMBED CONTOUR v18.0 (JULIA MATRIX) ---
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
        console.log("=== RUNNING AURA MODULAR JULIA WEAVER v18.0 ===");
        const session: Session = this.driver.session();
        const validationProject = new Project({ useInMemoryFileSystem: true });
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
            if (result.records.length === 0) return;

            const generatedFiles: { virtualPath: string; physicalPath: string }[] = [];

            // 1. Делегируем сборку дата-паспорта компонентов изолированному модулю
            const componentShells = result.records.filter(r => r.get('pattern') === 'Component');
            if (componentShells.length > 0) {
                const firstRecord = componentShells[0];
                const targetRelPath = firstRecord.get('rojoTarget') || "src/shared/components.types.ts";
                const absPhysicalPath = path.resolve('/app', targetRelPath);

                const finalTypesContent = compileJuliaComponentTypes(firstRecord.get('astJson') || "");
                validationProject.createSourceFile("src/shared/components.types.ts", finalTypesContent, { overwrite: true });
                generatedFiles.push({ virtualPath: "src/shared/components.types.ts", physicalPath: absPhysicalPath });
                
                if (!mapProjectData[targetRelPath]) mapProjectData[targetRelPath] = [];
                componentShells.forEach(r => { if (r.get('id')) mapProjectData[targetRelPath].push(r.get('id')); });
            }

            // 2. Группировка СИСТЕМ ЛOГИКИ (Исключаем компоненты)
            const classBuckets = new Map<string, { pattern: string; shells: any[] }>();
            result.records.filter(r => r.get('pattern') !== 'Component').forEach(record => {
                const className = record.get('className') || "MovementSystem";
                if (!classBuckets.has(className)) {
                    classBuckets.set(className, { pattern: record.get('pattern') || "MatterSystem", shells: [] });
                }
                classBuckets.get(className)!.shells.push(record);
            });

            // Сборка классов систем через жесткий строковый каркас класса
            for (const [className, bucket] of classBuckets.entries()) {
                const targetRelPath = bucket.shells[0].get('rojoTarget') || `src/server/systems/${className}.ts`;
                const virtualPath = `src/virtual_${className}.ts`;
                const physicalPath = path.resolve('/app', targetRelPath);
                if (!mapProjectData[targetRelPath]) mapProjectData[targetRelPath] = [];

                let fileContent = `${globalMocksHeader}\nexport class ${className} {\n    constructor() {}\n\n`;

                bucket.shells.forEach(record => {
                    const paramsList = ['ctx: any'];
                    if (bucket.pattern === "MatterSystem") paramsList.push("deltaTime: number");

                    // Делегируем сборку внутренностей метода изолированному модулю julia_parser
                    const compiledBody = translateJuliaToTs(record.get('astJson') || "");
                    
                    fileContent += `    public ${record.get('methodName')}(${paramsList.join(', ')}): ${record.get('outputType') || 'void'} {\n${compiledBody}\n    }\n\n`;
                    if (record.get('id')) mapProjectData[targetRelPath].push(record.get('id'));
                });

                fileContent += "}\n";
                validationProject.createSourceFile(virtualPath, fileContent, { overwrite: true });
                generatedFiles.push({ virtualPath, physicalPath });
            }

            // Запись скомпилированных файлов на жесткий диск хоста
            for (const file of generatedFiles) {
                const sFile = validationProject.getSourceFile(file.virtualPath);
                if (sFile) {
                    sFile.formatText();
                    await fs.ensureDir(path.dirname(file.physicalPath));
                    await fs.writeFile(file.physicalPath, sFile.getText(), 'utf8');
                }
            }

            await fs.ensureDir(MAP_PROJECT_DIR);
            await fs.writeJson(path.join(MAP_PROJECT_DIR, 'map_project.json'), mapProjectData, { spaces: 4 });
            console.log("=== ЦИКЛ СБОРКИ СЕТИ AURA_18 УСПЕШНО ЗАВЕРШЕН ===");
        } catch (error: any) {
            console.error("❌ КРИТИЧЕСКИЙ СБОЙ КОДОГЕНЕРАЦИИ ТКАЧА:", error.message);
            throw error;
        } finally { await session.close(); }
    }
}
export const weaver = new CodeWeaver();
