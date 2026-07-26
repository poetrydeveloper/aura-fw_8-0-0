import fs from 'fs-extra';
import path from 'path';
import { Project } from 'ts-morph';
import neo4j, { Driver, Session } from 'neo4j-driver';
import { translateJsxToTs } from './weaver_data/jsx_parser';

const TARGET_SRC_PATH = path.resolve('/app/src');
const MAP_PROJECT_DIR = path.resolve('/app/.aura/services/core/dist');

const globalMocksHeader = `// --- AURA RUNTIME TYPE EMBED CONTOUR v14.6 ---
declare const game: any; declare const Enum: any; declare const math: any; 
declare const Vector3: any; declare const CFrame: any; 
declare function warn(...args: any[]): void; declare function print(...args: any[]): void;
`;

/**
 * ДЕТЕРМИНИРОВАННЫЙ СБОРЩИК ТИПОВ КОМПОНЕНТОВ ИЗ СЫРОГО ГРАФА v17.1
 * Принимает сырой текст объекта конфигурации из базы данных и пошагово
 * собирает из него канонические TypeScript интерфейсы для Flamework/Rojo.
 */
function compileComponentTypes(rawAstJson: string): string {
    let resultTs = `// --- AURA COMPONENTS PASSPORT TYPES v17.1 ---\n\n`;
    
    try {
        // Хирургически изолируем блок components из текстовой строки, превращая её в исполняемый JS
        const cleanObjText = rawAstJson.replace(/render\s*\(.*?\)\s*\{[\s\S]*?\}/g, "");
        const evalWrapper = new Function(`return ${cleanObjText};`);
        const configData = evalWrapper();
        
        const componentsObj = configData.components || {};
        
        // Поэтапно генерируем интерфейсы «вглубь»
        for (const [compName, fields] of Object.entries(componentsObj)) {
            resultTs += `export interface ${compName} {\n`;
            if (fields && typeof fields === 'object') {
                for (const [fieldName, fieldType] of Object.entries(fields)) {
                    resultTs += `    ${fieldName}: ${fieldType};\n`;
                }
            }
            resultTs += `}\n\n`;
        }
    } catch (e: any) {
        resultTs += `// ❌ Ошибка детерминированного парсинга объектов БД: ${e.message}\n`;
        resultTs += `// Фолбэк на сырой слепок данных:\n/*\n${rawAstJson}\n*/`;
    }
    
    return resultTs;
}

export class CodeWeaver {
    private driver: Driver;

    constructor() {
        const uri = process.env.MEMGRAPH_URI || 'bolt://memgraph:7687';
        this.driver = neo4j.driver(uri, neo4j.auth.basic('', ''));
    }

    public async weaveProject(): Promise<void> {
        console.log("=== RUNNING AURA AST-DETERMINISTIC WEAVER v17.1 ===");
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

            // БЛОК 1. Декларативная пошаговая сборка типов компонентов (shared/)
            const componentShells = result.records.filter(r => r.get('pattern') === 'Component');
            if (componentShells.length > 0) {
                const firstRecord = componentShells[0];
                const customTarget = firstRecord.get('rojoTarget');
                const targetRelPath = customTarget || "src/shared/components.types.ts";
                const absPhysicalPath = path.resolve('/app', targetRelPath);

                const rawComponentBody = firstRecord.get('astJson') || "";
                
                // Вызываем наш новый пошаговый текстовый компилятор типов!
                const finalTypesContent = compileComponentTypes(rawComponentBody);
                
                validationProject.createSourceFile("src/shared/components.types.ts", finalTypesContent, { overwrite: true });
                generatedFiles.push({ virtualPath: "src/shared/components.types.ts", physicalPath: absPhysicalPath });
                
                if (!mapProjectData[targetRelPath]) mapProjectData[targetRelPath] = [];
                componentShells.forEach(r => {
                    const shellId = r.get('id');
                    if (shellId) mapProjectData[targetRelPath].push(shellId);
                });
            }

            // БЛОК 2. Группировка СИСТЕМ ЛОГИКИ (Исключаем компоненты на 100%)
            const classBuckets = new Map<string, { pattern: string; side: string; shells: any[] }>();
            const systemShells = result.records.filter(r => r.get('pattern') !== 'Component');

            systemShells.forEach(record => {
                const className = record.get('className') || "MovementSystem";
                if (!classBuckets.has(className)) {
                    classBuckets.set(className, { pattern: record.get('pattern') || "MatterSystem", side: (record.get('side') || "Server").toLowerCase(), shells: [] });
                }
                classBuckets.get(className)!.shells.push(record);
            });

            // Сборка классов систем
            for (const [className, bucket] of classBuckets.entries()) {
                const firstShell = bucket.shells[0];
                const rawRojoTarget = firstShell ? firstShell.get('rojoTarget') : null;
                let targetRelPath = rawRojoTarget || `src/${bucket.pattern === 'ControllerMethod' ? 'client/controllers' : 'server/systems'}/${className}.ts`;

                const virtualPath = `src/virtual_${className}.ts`;
                const physicalPath = path.resolve('/app', targetRelPath);
                if (!mapProjectData[targetRelPath]) mapProjectData[targetRelPath] = [];

                let fileContent = `${globalMocksHeader}\nexport class ${className} {\n    constructor() {}\n\n`;

                bucket.shells.forEach(record => {
                    const compiledBody = translateJsxToTs(record.get('astJson') || "");
                    const paramsList = ['ctx: any'];
                    if (bucket.pattern === "MatterSystem") paramsList.push("deltaTime: number");

                    fileContent += `    public ${record.get('methodName')}(${paramsList.join(', ')}): ${record.get('outputType') || 'void'} {\n${compiledBody}\n    }\n\n`;
                    const shellId = record.get('id');
                    if (shellId) mapProjectData[targetRelPath].push(shellId);
                });

                fileContent += "}\n";
                validationProject.createSourceFile(virtualPath, fileContent, { overwrite: true });
                generatedFiles.push({ virtualPath, physicalPath });
            }

            // Запись готовых файлов на хост Windows
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
