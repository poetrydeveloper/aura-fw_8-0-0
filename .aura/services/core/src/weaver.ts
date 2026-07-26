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
        console.log("=== RUNNING AURA FAST-TRACK STR-WEAVER v15.9 ===");
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

            const componentShells = result.records.filter(r => r.get('pattern') === 'Component');
            if (componentShells.length > 0) {
                const customTarget = componentShells[0]?.get('rojoTarget');
                const targetRelPath = customTarget || "src/shared/components.types.ts";
                generateComponentTypesFile(validationProject, componentShells, TARGET_SRC_PATH);
                generatedFiles.push({ virtualPath: "src/shared/components.types.ts", physicalPath: path.resolve('/app', targetRelPath) });
                componentShells.forEach(r => { if (r.get('id')) mapProjectData[r.get('id')] = [targetRelPath]; });
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

            for (const [className, bucket] of classBuckets.entries()) {
                const rawRojoTarget = bucket.shells[0]?.get('rojoTarget');
                let targetRelPath = rawRojoTarget || `src/${bucket.pattern === 'ControllerMethod' ? 'client/controllers' : 'server/systems'}/${className}.ts`;

                const virtualPath = `src/virtual_${className}.ts`;
                const physicalPath = path.resolve('/app', targetRelPath);
                if (!mapProjectData[targetRelPath]) mapProjectData[targetRelPath] = [];

                // СБОРКА СТРОКОВОГО КАРКАСА КЛАССА
                let fileContent = `${globalMocksHeader}\nexport class ${className} {\n    constructor() {}\n\n`;

                bucket.shells.forEach(record => {
                    const compiledBody = translateJsxToTs(record.get('astJson') || "");
                    const paramsList = ['ctx: any'];
                    if (bucket.pattern === "MatterSystem") paramsList.push("deltaTime: number");

                    // АППАРАТНАЯ СБОРКА: Подставляем мясо логики и ЖЕСТКО запечатываем закрывающую скобку метода }\n
                    fileContent += `    public ${record.get('methodName')}(${paramsList.join(', ')}): ${record.get('outputType') || 'void'} {\n${compiledBody}\n    }\n\n`;
                    if (record.get('id')) mapProjectData[targetRelPath].push(record.get('id'));
                });

                fileContent += "}\n"; // ЖЕСТКО запечатываем закрывающую скобку самого класса
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

            await fs.ensureDir(MAP_PROJECT_DIR);
            await fs.writeJson(path.join(MAP_PROJECT_DIR, 'map_project.json'), mapProjectData, { spaces: 4 });
            console.log("=== ЦИКЛ СБОРКИ СЕТИ AURA_7 УСПЕШНО ЗАВЕРШЕН ===");
        } catch (error: any) {
            console.error("❌ КРИТИЧЕСКИЙ СБОЙ КОДОГЕНЕРАЦИИ ТКАЧА:", error.message);
            throw error;
        } finally { await session.close(); }
    }
}
export const weaver = new CodeWeaver();
