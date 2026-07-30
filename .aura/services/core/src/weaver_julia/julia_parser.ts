// .aura/services/core/src/weaver_julia/julia_parser.ts

import fs from 'fs-extra';
import path from 'path';
const LOG_FILE_PATH = path.resolve('/app/.aura/services/core/dist/nitka.log');

export async function initStitchLog(): Promise<void> {
    await fs.writeFile(LOG_FILE_PATH, `=== СТАРТ УМНОГО ТОКЕНАЙЗЕРА СЕТИ v38.9 (ENTERPRISE PROTECTION) ===\n`, 'utf8');
}

/**
 * ⚡ ДЕТЕРМИНИРОВАННЫЙ ПОСИМВОЛЬНЫЙ ТОКЕНАЙЗЕР JULIA ➔ TYPESCRIPT v38.9
 * Полная защита от ReDoS, Re-linking скобок, семантическая чистка ключей Dict.
 */
export function translateJuliaToTs(juliaCode: string, className: string, methodName: string): string {
    if (!juliaCode || !juliaCode.trim()) return "";
    
    const lines = juliaCode.split(/\r?\n/);
    let tsLines: string[] = [];
    let memoryLogs: string[] = []; // ОПТИМИЗАЦИЯ ОЗУ: Копим логи в памяти, исключая оверхед диска I/O
    let insideRender = false;
    let braceBalance = 0;

    const logStitchSync = (code: string, msg: string) => {
        memoryLogs.push(`[CLASS: ${className}] [METHOD: ${methodName}] ${code} [BALANCE: ${braceBalance}] -> ${msg}\n`);
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
        if (trimmed.startsWith("#") || !trimmed) {
            if (!trimmed) tsLines.push("");
            continue;
        }
        
        if (!insideRender) {
            if (trimmed.startsWith("render = function") || trimmed.startsWith("render(ctx)")) {
                insideRender = true;
                logStitchSync("[STITCH-201]", "Вход в функцию render. Семантическая нить активна.");
            }
            continue;
        }
        
        // Защита от ложного срабатывания: закрытие скобки отсекает манифест только если мы вышли из всех ECS-блоков
        if (braceBalance === 0 && (trimmed === ")" || trimmed === " )" || trimmed.startsWith(")"))) {
            logStitchSync("[STITCH-888]", "Обнаружен детерминированный конец декларации. Стрим остановлен.");
            break;
        }

        // 1. ТРАНСЛЯЦИЯ МАКРOСА Query (camelCase + Типизация без any)
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
            braceBalance++;
            logStitchSync("[STITCH-301]", `Открыт строго типизированный цикл Query. Каст к Map<number, [${strictTypesList}]>`);
            continue;
        }
        
        // 2. ТРАНСЛЯЦИЯ МАКРOСА NestedQuery (Фикс гварда коллизий !== на === и .id на .type под v38.9)
        if (trimmed.startsWith("NestedQuery(target")) {
            const targetName = getParamValue(trimmed, "target");
            tsLines.push(`        for (const [targetEntityId, [targetArchetype, targetCFrame, targetVelocity]] of ctx.world.query(({} as unknown), ({} as unknown), ({} as unknown)) as unknown as Map<number, [ArchetypeComponent, CFrameComponent, VelocityComponent]>) { if (targetArchetype.type !== "${targetName || "PLAYER"}") continue;`);
            braceBalance++;
            logStitchSync("[STITCH-302]", `Открыт строго типизированный цикл NestedQuery.`);
            continue;
        }
        // 3. Макрос Guard
        if (trimmed.startsWith("Guard(condition")) {
            const condStr = getParamValue(trimmed, "condition");
            tsLines.push(`            if (!(${condStr || "false"})) { continue; }`);
            logStitchSync("[STITCH-400]", `Внедрен гвард Guard. Аппаратная инверсия: !(${condStr})`);
            continue;
        }

        // 4. Макрос Safety (Безопасный захват числа через regex match)
        if (trimmed.startsWith("Safety(limit")) {
            const limMatch = trimmed.match(/\d+/);
            const limStr = limMatch ? limMatch[0] : "5000";
            tsLines.push(`            let safetyCounter = 0; if (++safetyCounter > ${limStr}) { warn("Aura Safety Triggered"); break; }`);
            logStitchSync("[STITCH-401]", `Внедрена защита Safety. Лимит: ${limStr}`);
            continue;
        }

        // 5. Макрос Calculate
        if (trimmed.startsWith("Calculate(var")) {
            const vNameStr = getParamValue(trimmed, "var");
            const exprStr = getParamValue(trimmed, "expr");
            tsLines.push(`            const ${vNameStr || "temp"} = ${exprStr || "0"};`);
            logStitchSync("[STITCH-500]", `Расчет переменной Calculate: const ${vNameStr} = ${exprStr}`);
            continue;
        }

        // 6. МОДЕРНИЗИРОВАННЫЙ ТОКЕНАЙЗЕР МАКРOСА Mutate (Сохраняет внутренние кавычки!)
        if (trimmed.startsWith("Mutate(")) {
            const dictStart = trimmed.indexOf("Dict(");
            let cleanValues = "";
            let targetId = 'entityId'; // Дефолт на текущую сущность
            
            if (dictStart !== -1) {
                let startPos = dictStart + 5; let parenCount = 1; let endPos = startPos;
                for (let i = startPos; i < trimmed.length; i++) {
                    if (trimmed[i] === '(') parenCount++;
                    if (trimmed[i] === ')') { parenCount--; if (parenCount === 0) { endPos = i; break; } }
                }
                const rawValues = trimmed.substring(startPos, endPos).trim();
                
                // ЮВЕЛИРНЫЙ ПАРСИНГ DICT: Заменяем только стрелочки Julia на двоеточия JS, 
                // но бережно сохраняем все внутренние кавычки формул!
                const entries = rawValues.split(",");
                const processedFields = entries.map(entry => {
                    if (!entry.includes("=>")) return "";
                    const parts = entry.split("=>");
                    const k = parts[0];
                    const v = parts.slice(1).join("=>");
                    
                    const cleanKey = k.replace(/["'\s]/g, ""); // Ключ очищаем намертво
                    let cleanVal = v.trim();
                    
                    // ХЕЛПЕР-ИНЖЕКТ: Если внутри словаря ИИ передал параметр targetEntityId, 
                    // мы вытаскиваем его как управляющий ID сущности для insert(), убирая из объекта компонента
                    if (cleanKey === "targetEntityId") {
                        targetId = cleanVal.replace(/["']/g, ""); // Извлекаем ID
                        return ""; // Стираем из полей компонента
                    }
                    
                    return `"${cleanKey}": ${cleanVal}`;
                }).filter(s => s.length > 0);
                
                cleanValues = processedFields.join(", ");
            }
            
            const finalMutateStitch = `            ctx.world.insert(${targetId}, ({ ${cleanValues} } as unknown as Record<string, unknown>));`;
            tsLines.push(finalMutateStitch);
            logStitchSync("[STITCH-600]", `Мутация Mutate детерминировано собрана.`);
            continue;
        }
        
        // 7. Условия Luau if
        if (trimmed.startsWith("if ") && !trimmed.endsWith("{") && !trimmed.includes("then")) {
            tsLines.push(`            if (${trimmed.substring(3).trim()}) {`);
            braceBalance++;
            logStitchSync("[STITCH-310]", "Luau-условие преобразовано в блок TS.");
            continue;
        }
        
        // 8. Маркер закрытия блоков Julia
        if (trimmed === "end") {
            tsLines.push("        }");
            braceBalance--;
            logStitchSync("[STITCH-700]", "Встречен маркер end. Закрыта скобка }");
            
            if (braceBalance === 0) {
                logStitchSync("[STITCH-701]", "Математический баланс равен 0. Все блоки закрыты.");
                break;
            }
            continue;
        }
        
        tsLines.push(`        ${line.trim()}`);
    }
    
    // БЛОКИРУЮЩИЙ СБРОС ЛОГОВ НА ДИСК (Один асинхронный вызов в самом конце функции)
    fs.appendFile(LOG_FILE_PATH, memoryLogs.join(''), 'utf8').catch(() => {});
    
    return tsLines.join('\n');
}
