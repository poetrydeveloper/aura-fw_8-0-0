import fs from 'fs-extra';
import path from 'path';
import { Project } from 'ts-morph';
import neo4j, { Driver, Session } from 'neo4j-driver';

// Импортируем наши изолированные модули Julia, Постпроцессор Роболокса и заплатку TS
import { translateJuliaToTs, initStitchLog } from './weaver_julia/julia_parser';
import { applyRobloxStrictFixes } from './weaver_julia/roblox_post_processor';
import { globalMocksHeader } from './weaver_julia/ts_post_processor'; // <=== ИМПОРТ ИЗ НОВОГО МОДУЛЯ ТИПОВ TS
import { compileJuliaComponentTypes } from './weaver_julia/types_compiler';

const MAP_PROJECT_DIR = path.resolve('/app/.aura/services/core/dist');

export class CodeWeaver {
    private driver: Driver;
    constructor() { this.driver = neo4j.driver(process.env.MEMGRAPH_URI || 'bolt://memgraph:7687', neo4j.auth.basic('', '')); }

    public async weaveProject(): Promise<void> {
        console.log("=== RUNNING AURA ATOMIC STREAM WEAVER v35.0 (CLEAN MATRIX) ===");
        const session: Session = this.driver.session();
        const validationProject = new Project({ useInMemoryFileSystem: true });
        const mapProjectData: Record<string, string[]> = {};

        try {
            await initStitchLog();

            const result = await session.run(`MATCH (s:Shell {status: "active"}) RETURN s.id AS id, s.ast_json AS astJson, s.class_name AS className, s.method_name AS methodName, s.flamework_pattern AS pattern, s.output_type AS outputType, s.rojo_target AS rojoTarget`);
            if (result.records.length === 0) return;
            const generatedFiles: { virtualPath: string; physicalPath: string }[] = [];

            // 1. Паспорт компонентов
            const componentShells = result.records.filter(r => r.get('pattern') === 'Component');
            if (componentShells.length > 0) {
                const targetRelPath = componentShells[0].get('rojoTarget') || "src/shared/components.types.ts";
                validationProject.createSourceFile("src/shared/components.types.ts", compileJuliaComponentTypes(componentShells[0].get('astJson') || ""), { overwrite: true });
                generatedFiles.push({ virtualPath: "src/shared/components.types.ts", physicalPath: path.resolve('/app', targetRelPath) });
                componentShells.forEach(r => { if (r.get('id')) { mapProjectData[targetRelPath] = mapProjectData[targetRelPath] || []; mapProjectData[targetRelPath].push(r.get('id')); } });
            }

            // 2. Системы логики
            const classBuckets = new Map<string, { pattern: string; shells: any[] }>();
            result.records.filter(r => r.get('pattern') !== 'Component').forEach(r => {
                const cName = r.get('className') || "MovementSystem";
                if (!classBuckets.has(cName)) classBuckets.set(cName, { pattern: r.get('pattern') || "MatterSystem", shells: [] });
                classBuckets.get(cName)!.shells.push(r);
            });

            for (const [className, bucket] of classBuckets.entries()) {
                const targetRelPath = bucket.shells[0].get('rojoTarget') || `src/server/systems/${className}.ts`;
                const virtualPath = `src/virtual_${className}.ts`;
                let fileContent = `${globalMocksHeader}\nexport class ${className} {\n    constructor() {}\n\n`;

                for (const record of bucket.shells) {
                    const mName = record.get('methodName') || "update";
                    const params = bucket.pattern === "MatterSystem" ? ['ctx: AuraContext', 'deltaTime: number'] : ['ctx: AuraContext'];
                    
                    const rawBody = translateJuliaToTs(record.get('astJson') || "", className, mName);
                    const fixedBody = applyRobloxStrictFixes(rawBody);
                    
                    fileContent += `    public ${mName}(${params.join(', ')}): ${record.get('outputType') || 'void'} {\n${fixedBody}\n    }\n\n`;
                    if (record.get('id')) { mapProjectData[targetRelPath] = mapProjectData[targetRelPath] || []; mapProjectData[targetRelPath].push(record.get('id')); }
                }

                fileContent += "}\n";
                validationProject.createSourceFile(virtualPath, fileContent, { overwrite: true });
                generatedFiles.push({ virtualPath, physicalPath: path.resolve('/app', targetRelPath) });
            }

            for (const file of generatedFiles) {
                const sFile = validationProject.getSourceFile(file.virtualPath);
                if (sFile) { sFile.formatText(); await fs.ensureDir(path.dirname(file.physicalPath)); await fs.writeFile(file.physicalPath, sFile.getText(), 'utf8'); }
            }
            await fs.ensureDir(MAP_PROJECT_DIR);
            await fs.writeJson(path.join(MAP_PROJECT_DIR, 'map_project.json'), mapProjectData, { spaces: 4 });
            console.log("=== ЦИКЛ СБОРКИ СЕТИ AURA УСПЕШНО ЗАВЕРШЕН ===");
        } catch (error: any) { console.error("❌ СБОЙ ТКАЧА:", error.message); throw error; } finally { await session.close(); }
    }
}
export const weaver = new CodeWeaver();
