// .aura/services/core/src/weaver_julia/julia_parser.ts
import fs from 'fs-extra';
import path from 'path';

const LOG_FILE_PATH = path.resolve('/app/.aura/services/core/dist/nitka.log');

export async function initStitchLog(): Promise<void> {
    await fs.ensureDir(path.dirname(LOG_FILE_PATH));
    await fs.writeFile(LOG_FILE_PATH, `=== СТАРТ УМНОГО ТОКЕНАЙЗЕРА СЕТИ v40.0 (EXPLICIT TERMINATION) ===\n`, 'utf8');
}

/**
 * ⚡ ДЕТЕРМИНИРОВАННЫЙ БЕСКОНТЕКСТНЫЙ КОМПИЛЯТОР JULIA ➔ TYPESCRIPT v40.0.0
 * Работает по зеркальному принципу: do = {, end = }.
 * Останавливает чтение строго по явному токену финала контракта # AURA_END.
 */
export function translateJuliaToTs(juliaCode: string, className: string, methodName: string): string {
    if (!juliaCode || !juliaCode.trim()) return "";
    
    const lines = juliaCode.split(/\r?\n/);
    let tsLines: string[] = [];
    let memoryLogs: string[] = []; 
    let insideRender = false;

    const logStitchSync = (code: string, msg: string) => {
        memoryLogs.push(`[CLASS: ${className}] [METHOD: ${methodName}] ${code} -> ${msg}\n`);
    };

    const getParamValue = (lineText: string, paramKey: string): string => {
        const keyIdx = lineText.indexOf(paramKey);
        if (keyIdx === -1) return "";
        const startQuoteIdx = lineText.indexOf('"', keyIdx);
        const startSingleQuoteIdx = lineText.indexOf("'", keyIdx);
        let startIdx = -1; let endQuoteChar = '"';
        if (startQuoteIdx !== -1 && (startSingleQuoteIdx === -1 || startQuoteIdx < startSingleQuoteIdx)) {
            startIdx = startQuoteIdx; endQuoteChar = '"';
        } else if (startSingleQuoteIdx !== -1) {
            startIdx = startSingleQuoteIdx; endQuoteChar = "'";
        }
        if (startIdx === -1) return "";
        const endIdx = lineText.indexOf(endQuoteChar, startIdx + 1);
        return endIdx === -1 ? "" : lineText.substring(startIdx + 1, endIdx).trim();
    };
    
    for (let line of lines) {
        let trimmed = line.trim();
        
        // 🔥 НАШ НОВЫЙ ВЫСШИЙ СЕМАНТИЧЕСКИЙ КАНOН: Explicit Termination Token
        // Если Ткач натыкается на этот маркер — сборка метода немедленно прекращается!
        if (trimmed.includes("AURA_END")) {
            logStitchSync("[STITCH-TERMINATION]", "Обнаружен детерминированный токен финала # AURA_END. Стрим успешно закрыт.");
            break;
        }

        if (trimmed.startsWith("#") || !trimmed) {
            if (!trimmed) tsLines.push("");
            continue;
        }
        
        // ЭШЕЛОН ИЗОЛЯЦИИ: Включаем транслятор строго внутри тела функции render
        if (!insideRender) {
            if (trimmed.startsWith("render = function") || trimmed.startsWith("render(ctx)") || trimmed.includes("render = (ctx) ->") || trimmed.includes("render = ctx ->")) {
                insideRender = true;
                logStitchSync("[STITCH-BLOCK-INIT]", "Вход в изолированный стрим render.");
            }
            continue;
        }

        // 1. ТРАНСЛЯЦИЯ МАКРOСА Query
        if (trimmed.startsWith("Query(components")) {
            const startArray = trimmed.indexOf("[");
            const endArray = trimmed.indexOf("]");
            let comps: string[] = [];
            if (startArray !== -1 && endArray !== -1) {
                comps = trimmed.substring(startArray + 1, endArray).replace(/["'\s]/g, "").split(",").filter(s => s.length > 0);
            }
            
            const iterators = comps.map((c: string) => {
                const base = c.replace('Component', '');
                return base.charAt(0).toLowerCase() + base.slice(1);
            }).join(', ');
            
            const strictTypesList = comps.join(', ');
            tsLines.push(`        for (const [entityId, [${iterators}]] of ctx.world.query(${(comps.map(() => '({} as unknown)')).join(', ')}) as unknown as Map<number, [${strictTypesList}]>) {`);
            continue;
        }
                // 2. ТРАНСЛЯЦИЯ МАКРOСА NestedQuery
        if (trimmed.startsWith("NestedQuery(target")) {
            const targetName = getParamValue(trimmed, "target");
            tsLines.push(`        for (const [targetEntityId, [rawTargetArchetype, rawTargetCFrame, rawTargetVelocity]] of ctx.world.query(({} as unknown), ({} as unknown), ({} as unknown)) as unknown as Map<number, unknown[]>) {`);
            tsLines.push(`            const targetArchetype = rawTargetArchetype as unknown as ArchetypeComponent;`);
            tsLines.push(`            const targetCFrame = rawTargetCFrame as unknown as CFrameComponent;`);
            tsLines.push(`            const targetVelocity = rawTargetVelocity as unknown as VelocityComponent;`);
            tsLines.push(`            if (targetArchetype.type === "${targetName || "PLAYER"}") {`);
            logStitchSync("[STITCH-NESTED]", `Развернут строго типизированный цикл NestedQuery без any.`);
            continue;
        }

        // 3. БЛОЧНЫЙ МАКРОС Guard (if-блок)
        if (trimmed.startsWith("Guard(condition")) {
            const condStr = getParamValue(trimmed, "condition");
            tsLines.push(`            if (${condStr || "true"}) {`);
            logStitchSync("[STITCH-GUARD-BLOCK]", `Развернут логический блок Guard: if (${condStr}) {`);
            continue;
        }

        // 4. Макрос Safety
        if (trimmed.startsWith("Safety(limit")) {
            const limMatch = trimmed.match(/\d+/);
            const limStr = limMatch ? limMatch : "5000";
            tsLines.push(`            if (typeof (globalThis as any).safetyCounter === "undefined") { (globalThis as any).safetyCounter = 0; }`);
            tsLines.push(`            if (++(globalThis as any).safetyCounter > ${limStr}) { (globalThis as any).safetyCounter = 0; warn("Aura Safety Triggered"); break; }`);
            logStitchSync("[STITCH-SAFETY]", `Внедрена защита Safety. Лимит: ${limStr}`);
            continue;
        }

        // 5. Макрос Calculate
        if (trimmed.startsWith("Calculate(var")) {
            const vNameStr = getParamValue(trimmed, "var");
            const exprStr = getParamValue(trimmed, "expr");
            tsLines.push(`            const ${vNameStr || "temp"} = ${exprStr || "0"};`);
            logStitchSync("[STITCH-CALCULATE]", `Расчет переменной Calculate: const ${vNameStr} = ${exprStr}`);
            continue;
        }

        // 6. МОДЕРНИЗИРОВАННЫЙ ТОКЕНАЙЗЕР МАКРOСА Mutate
        if (trimmed.startsWith("Mutate(")) {
            const dictStart = trimmed.indexOf("Dict(");
            let cleanValues = "";
            let targetId = 'entityId'; 
            
            if (dictStart !== -1) {
                let startPos = dictStart + 5; let parenCount = 1; let endPos = startPos;
                for (let i = startPos; i < trimmed.length; i++) {
                    if (trimmed[i] === '(') parenCount++;
                    if (trimmed[i] === ')') { parenCount--; if (parenCount === 0) { endPos = i; break; } }
                }
                const rawValues = trimmed.substring(startPos, endPos).trim();
                
                const entries = rawValues.split(",");
                const processedFields = entries.map(entry => {
                    if (!entry.includes("=>")) return "";
                    const parts = entry.split("=>");
                    const k = parts[0]; // Наш ювелирный фикс ключа
                    const v = parts.slice(1).join("=>");
                    
                    const cleanKey = k.replace(/["'\s]/g, ""); 
                    let cleanVal = v.trim();
                    
                    if (cleanKey === "targetEntityId") {
                        targetId = cleanVal.replace(/["']/g, ""); 
                        return ""; 
                    }
                    
                    return `"${cleanKey}": ${cleanVal}`;
                }).filter(s => s.length > 0);
                
                cleanValues = processedFields.join(", ");
            }
           
            const finalMutateStitch = `            ctx.world.insert(${targetId}, ({ ${cleanValues} } as unknown as Record<string, unknown>));`;
            tsLines.push(finalMutateStitch);
            logStitchSync("[STITCH-MUTATE]", `Мутация Mutate детерминировано собрана.`);
            continue;
        }
        
        // 7. Условия Luau if
        if (trimmed.startsWith("if ") && !trimmed.endsWith("{") && !trimmed.includes("then")) {
            tsLines.push(`            if (${trimmed.substring(3).trim()}) {`);
            logStitchSync("[STITCH-IF-LUAU]", "Luau-условие преобразовано в блок TS.");
            continue;
        }
        
        // =========================================================================
        // 8. ЧИСТЫЙ ЗЕРКАЛЬНЫЙ АВТОМАТ end (ПОЛНЫЙ ДЕТЕРМИНИЗМ v40.0.0)
        // =========================================================================
        if (trimmed === "end" || trimmed.startsWith("end")) {
            // Любой end слепо и без оглядки превращается в }
            tsLines.push("        }");
            logStitchSync("[STITCH-END-COLLAPSE]", "Схлопывание блока Julia end ➔ }");
            continue;
        }
        
        tsLines.push(`        ${line.trim()}`);
    }
    
    fs.appendFile(LOG_FILE_PATH, memoryLogs.join(''), 'utf8').catch(() => {});
    
    return tsLines.join('\n');
}
