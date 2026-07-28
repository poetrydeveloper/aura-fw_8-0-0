import fs from 'fs-extra';
import path from 'path';
import { Project } from 'ts-morph';
import neo4j, { Driver, Session } from 'neo4j-driver';

// Импортируем наши изолированные модули Julia, Постпроцессор Роболокса и заплатку TS
import { translateJuliaToTs, initStitchLog } from './weaver_julia/julia_parser';
import { applyRobloxStrictFixes } from './weaver_julia/roblox_post_processor';
import { globalMocksHeader } from './weaver_julia/ts_post_processor'; 
import { compileJuliaComponentTypes } from './weaver_julia/types_compiler';
import { weaveGameConstants } from './weaver_julia/constants_weaver'; // <=== ПОДКЛЮЧЕНИЕ ВНЕШНЕГО МОДУЛЯ v44.0

const MAP_PROJECT_DIR = path.resolve('/app/.aura/services/core/dist');

export class CodeWeaver {
    private driver: Driver;
    constructor() { this.driver = neo4j.driver(process.env.MEMGRAPH_URI || 'bolt://memgraph:7687', neo4j.auth.basic('', '')); }

    public async weaveProject(): Promise<void> {
        console.log("=== RUNNING AURA ATOMIC STREAM WEAVER v44.0 (DATA-DRIVEN) ===");
        const session: Session = this.driver.session();
        const validationProject = new Project({ useInMemoryFileSystem: true });
        const mapProjectData: Record<string, string[]> = {};

        try {
            await initStitchLog();

            const result = await session.run(`MATCH (s:Shell {status: "active"}) RETURN s.id AS id, s.ast_json AS astJson, s.class_name AS className, s.method_name AS methodName, s.flamework_pattern AS pattern, s.output_type AS outputType, s.rojo_target AS rojoTarget`);
            if (result.records.length === 0) return;
            const generatedFiles: { virtualPath: string; physicalPath: string }[] = [];

            // 🪐 ЭКСПЕРИМЕНТАЛЬНЫЙ ПЕРЕХВАТ: Запуск внешнего изолированного узла констант
            const registryRecord = result.records.find(r => r.get('pattern') === 'GlobalConstants');
            if (registryRecord) {
                const targetRelPath = "src/shared/constants.ts"; // <=== ЯВНЫЙ ПУТЬ К НАШЕМУ ФАЙЛУ КОНСТАНТ
                
                weaveGameConstants(
                    { className: registryRecord.get('className'), flameworkPattern: registryRecord.get('pattern') },
                    registryRecord.get('astJson') || "",
                    '/app'
                );

                // 🔥 СНАЙПЕРСКИЙ ФИКС: Регистрируем ракушку констант в карте проекта для фронтенда!
                if (registryRecord.get('id')) {
                    mapProjectData[targetRelPath] = mapProjectData[targetRelPath] || [];
                    mapProjectData[targetRelPath].push(registryRecord.get('id'));
                }
            }

            // 1. Паспорт компонентов
            const componentShells = result.records.filter(r => r.get('pattern') === 'Component');
            if (componentShells.length > 0) {
                const targetRelPath = componentShells[0].get('rojoTarget') || "src/shared/components.types.ts";
                validationProject.createSourceFile("src/shared/components.types.ts", compileJuliaComponentTypes(componentShells[0].get('astJson') || ""), { overwrite: true });
                generatedFiles.push({ virtualPath: "src/shared/components.types.ts", physicalPath: path.resolve('/app', targetRelPath) });
                componentShells.forEach(r => { if (r.get('id')) { mapProjectData[targetRelPath] = mapProjectData[targetRelPath] || []; mapProjectData[targetRelPath].push(r.get('id')); } });
            }
            // 2. Системы логики (Исключаем GlobalConstants из перебора классов)
            const classBuckets = new Map<string, { pattern: string; shells: any[] }>();
            result.records
                .filter(r => r.get('pattern') !== 'Component' && r.get('pattern') !== 'GlobalConstants')
                .forEach(r => {
                    const cName = r.get('className') || "MovementSystem";
                    if (!classBuckets.has(cName)) classBuckets.set(cName, { pattern: r.get('pattern') || "MatterSystem", shells: [] });
                    classBuckets.get(cName)!.shells.push(r);
                });

            for (const [className, bucket] of classBuckets.entries()) {
                const targetRelPath = bucket.shells[0].get('rojoTarget') || `src/server/systems/${className}.ts`;
                const virtualPath = `src/virtual_${className}.ts`;
                
                // Вшиваем строгий импорт сгенерированной ДНК констант в шапку каждой системы
                let fileContent = `${globalMocksHeader}\n`;
                fileContent += `import { ENEMY_INTERCEPTOR, GALAXY_PLAYER, PLASMA_BOLT, ALIENS, HUMANS, NEUTRAL } from "../../shared/constants";\n\n`;
                fileContent += `export class ${className} {\n    constructor() {}\n\n`;

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