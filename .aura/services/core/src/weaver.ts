// .aura/services/core/src/weaver.ts
import fs from 'fs-extra';
import path from 'path';
import { Project } from 'ts-morph';
import neo4j, { Driver, Session } from 'neo4j-driver';

// Импортируем наши изолированные модули Julia, Постпроцессор Роболокса и заплатку TS
import { translateJuliaToTs, initStitchLog } from './weaver_julia/julia_parser';
import { applyRobloxStrictFixes } from './weaver_julia/roblox_post_processor';
import { globalMocksHeader } from './weaver_julia/ts_post_processor'; 
import { compileJuliaComponentTypes } from './weaver_julia/types_compiler';
import { weaveGameConstants } from './weaver_julia/constants_weaver'; 

const MAP_PROJECT_DIR = path.resolve('/app/.aura/services/core/dist');

export class CodeWeaver {
    private driver: Driver;
    constructor() { 
        this.driver = neo4j.driver(process.env.MEMGRAPH_URI || 'bolt://memgraph:7687', neo4j.auth.basic('', '')); 
    }

    public async weaveProject(): Promise<void> {
        console.log("=== RUNNING AURA ATOMIC STREAM WEAVER v47.0 (JULIA CONTOUR) ===");
        const session: Session = this.driver.session();
        const validationProject = new Project({ useInMemoryFileSystem: true });
        const mapProjectData: Record<string, string[]> = {};

        try {
            await initStitchLog();

            // Пакетная выборка графа активных нод ракушек из Memgraph
            const result = await session.run(`MATCH (s:Shell {status: "active"}) RETURN s.id AS id, s.ast_json AS astJson, s.class_name AS className, s.method_name AS methodName, s.flamework_pattern AS pattern, s.output_type AS outputType, s.rojo_target AS rojoTarget`);
            if (result.records.length === 0) return;
            const generatedFiles: { virtualPath: string; physicalPath: string }[] = [];

            // =========================================================================
            // LAYER 1 ODD: СБОРКА И ВЫШИВАНИЕ ГЛОБАЛЬНЫХ КОНСТАНТ И РЕЕСТРОВ ИГРЫ
            // =========================================================================
            const registryRecords = result.records.filter(r => r.get('pattern') === 'GlobalConstants');
            for (const registryRecord of registryRecords) {
                const targetRelPath = "src/shared/constants.ts"; 
                
                // Передаем сырое тело ракушки во всеядный constants_weaver
                weaveGameConstants(
                    { className: registryRecord.get('className'), flameworkPattern: registryRecord.get('pattern') },
                    registryRecord.get('astJson') || "",
                    '/app'
                );

                if (registryRecord.get('id')) {
                    mapProjectData[targetRelPath] = mapProjectData[targetRelPath] || [];
                    mapProjectData[targetRelPath].push(registryRecord.get('id'));
                }
            }

            // =========================================================================
            // LAYER 2 ODD: СБОРКА СТРУКТУРЫ ДАННЫХ И ДНК-ТИПОВ КОМПОНЕНТОВ (JULIA)
            // =========================================================================
            const componentShells = result.records.filter(r => r.get('pattern') === 'Component');
            if (componentShells.length > 0) {
                const targetRelPath = componentShells[0].get('rojoTarget') || "src/shared/components.types.ts";
                
                // 🔥 ФИКС: Виртуальный путь в памяти ts-morph теперь строго синхронизирован с rojoTarget!
                const compiledTypes = compileJuliaComponentTypes(componentShells[0].get('astJson') || "");
                validationProject.createSourceFile(targetRelPath, compiledTypes, { overwrite: true });
                
                generatedFiles.push({ virtualPath: targetRelPath, physicalPath: path.resolve('/app', targetRelPath) });
                componentShells.forEach(r => { 
                    if (r.get('id')) { 
                        mapProjectData[targetRelPath] = mapProjectData[targetRelPath] || []; 
                        mapProjectData[targetRelPath].push(r.get('id')); 
                    } 
                });
            }

            // =========================================================================
            // LAYER 3-5 ODD: СБОРКА СИСТЕМ ЛОГИКИ И ИНПУТОВ ИГРЫ
            // =========================================================================
            const classBuckets = new Map<string, { pattern: string; shells: any[] }>();
            result.records
                .filter(r => {
                    const p = r.get('pattern');
                    const cName = r.get('className');
                    // 🔥 СТРОГИЙ КАНOН: Если у ноды в базе данных нет имени класса или паттерна - 
                    // мы её ХЛАДНОКРОВНО ИГНОРИРУЕМ и не пускаем калечить диск хоста!
                    return p !== 'Component' && p !== 'GlobalConstants' && cName && cName !== 'undefined' && cName !== 'null';
                })
                .forEach(r => {
                    const cName = String(r.get('className'));
                    if (!classBuckets.has(cName)) classBuckets.set(cName, { pattern: r.get('pattern') || "MatterSystem", shells: [] });
                    classBuckets.get(cName)!.shells.push(r);
                });

            for (const [className, bucket] of classBuckets.entries()) {
                const targetRelPath = bucket.shells[0].get('rojoTarget') || `src/server/systems/${className}.ts`;
                const virtualPath = targetRelPath;
                
                // Вшиваем модульный LEGO-заголовок
                let fileContent = `${globalMocksHeader}\n`;
                
                // ГЛАВНЫЙ ФИКС ХАРДКОДА: Импортируем ВЕСЬ неймспейс констант через звездочку (*).
                fileContent += `import * as Constants from "../../shared/constants";\n\n`;
                fileContent += `export class ${className} {\n    constructor() {}\n\n`;

                for (const record of bucket.shells) {
                    const mName = record.get('methodName') || "update";
                    const params = bucket.pattern === "MatterSystem" ? ['ctx: AuraContext', 'deltaTime: number'] : ['ctx: AuraContext'];
                    
                    // Посимвольный токенайзер Джулии v47.0 (Прямой проброс из Docker!)
                    const rawBody = translateJuliaToTs(record.get('astJson') || "", className, mName);
                    
                    // 🔥 ИСПРАВЛЕНИЕ КАНОНА: Мы больше НЕ КAЛЕЧИМ код регулярками хоста!
                    // Опасная функция applyRobloxStrictFixes вырезана из контура деплоя на хост Windows.
                    const fixedBody = rawBody;
                    
                    fileContent += `    public ${mName}(${params.join(', ')}): ${record.get('outputType') || 'void'} ${fixedBody}\n\n`;
                    if (record.get('id')) { 
                        mapProjectData[targetRelPath] = mapProjectData[targetRelPath] || []; 
                        mapProjectData[targetRelPath].push(record.get('id')); 
                    }
                }

                fileContent += "}\n";
                validationProject.createSourceFile(virtualPath, fileContent, { overwrite: true });
                generatedFiles.push({ virtualPath, physicalPath: path.resolve('/app', targetRelPath) });
            }

            // =========================================================================
            // ФИНАЛЬНАЯ ЗАПИСЬ НА ДИСК И СИНХРОНИЗАЦИЯ С ROJO НА ХОСТЕ
            // =========================================================================
            for (const file of generatedFiles) {
                const sFile = validationProject.getSourceFile(file.virtualPath);
                if (sFile) { 
                    sFile.formatText(); // Нативная нормализация табов и пробелов ts-morph
                    await fs.ensureDir(path.dirname(file.physicalPath)); 
                    await fs.writeFile(file.physicalPath, sFile.getText(), 'utf8'); 
                }
            }
            
            // Сбрасываем карту проекта для фронтенд-интерфейса
            await fs.ensureDir(MAP_PROJECT_DIR);
            await fs.writeJson(path.join(MAP_PROJECT_DIR, 'map_project.json'), mapProjectData, { spaces: 4 });
            console.log("=== ЦИКЛ СБОРКИ СЕТИ AURA v47.0 УСПЕШНО ЗАВЕРШЕН ===");
            
        } catch (error: any) { 
            console.error("❌ ФАТАЛЬНЫЙ СБОЙ ТКАЧА:", error.message); 
            throw error; 
        } finally { 
            await session.close(); 
        }
    }
}
export const weaver = new CodeWeaver();
