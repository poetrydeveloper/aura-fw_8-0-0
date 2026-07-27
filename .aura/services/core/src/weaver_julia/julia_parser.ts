import fs from 'fs-extra';
import path from 'path';

const LOG_FILE_PATH = path.resolve('/app/nitka.log');

export async function initStitchLog(): Promise<void> {
    await fs.writeFile(LOG_FILE_PATH, `=== СТАРТ ТОКЕНАЙЗЕРА СЕТИ v31.0 ===\n`, 'utf8');
}

/**
 * ⚡ ДЕТЕРМИНИРОВАННЫЙ ПОСИМВОЛЬНЫЙ ТОКЕНАЙЗЕР JULIA ➔ TYPESCRIPT v31.0
 * Полностью отказывается от опасных слепых замен и удалений символов.
 * Вырезает мясо Dict() по строгому балансу скобок и собирает TS строку из чистых токенов.
 */
export function translateJuliaToTs(juliaCode: string, className: string, methodName: string): string {
    if (!juliaCode || !juliaCode.trim()) return "";
    
    const lines = juliaCode.split(/\r?\n/);
    let tsLines: string[] = [];
    let insideRender = false;
    let braceBalance = 0;

    const logStitchSync = (code: string, msg: string) => {
        const line = `[CLASS: ${className}] [METHOD: ${methodName}] ${code} [BALANCE: ${braceBalance}] -> ${msg}\n`;
        fs.appendFileSync(LOG_FILE_PATH, line, 'utf8');
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
        if (trimmed.startsWith("#")) continue;
        
        if (!insideRender) {
            if (trimmed.startsWith("render = function") || trimmed.startsWith("render(ctx)")) {
                insideRender = true;
                logStitchSync("[STITCH-201]", "Вход в функцию render. Семантическая нить активна.");
            }
            continue;
        }
        
        if (trimmed === ")" || trimmed === " )" || trimmed.startsWith(")")) {
            logStitchSync("[STITCH-888]", "Обнаружен конец декларации AuraShell. Стрим остановлен.");
            break;
        }
        if (!trimmed) { tsLines.push(""); continue; }
        
        // 1. Макрос Query
        if (trimmed.startsWith("Query(components")) {
            const startArray = trimmed.indexOf("[");
            const endArray = trimmed.indexOf("]");
            let comps: string[] = [];
            if (startArray !== -1 && endArray !== -1) {
                comps = trimmed.substring(startArray + 1, endArray).replace(/["'\s]/g, "").split(",").filter(s => s.length > 0);
            }
            const iterators = comps.map((c: string) => c.replace('Component', '').charAt(0).toLowerCase() + c.replace('Component', '').slice(1)).join(', ');
            
            tsLines.push(`        for (const [entityId, [${iterators}]] of ctx.world.query(${(comps.map(() => '({} as any)')).join(', ')})) {`);
            braceBalance++;
            logStitchSync("[STITCH-301]", `Открыт цикл Query (Баланс++). Компоненты: [${comps.join(", ")}]`);
            continue;
        }
        
        // 2. Макрос NestedQuery
        if (trimmed.startsWith("NestedQuery(target")) {
            const targetName = getParamValue(trimmed, "target");
            tsLines.push(`        for (const [targetEntityId, [targetArchetype, targetCFrame]] of ctx.world.query(({} as any), ({} as any))) { if (targetArchetype.id !== "${targetName || "GALAXY_PLAYER"}") continue;`);
            braceBalance++;
            logStitchSync("[STITCH-302]", `Открыт вложенный цикл NestedQuery (Баланс++). Цель: ${targetName}`);
            continue;
        }
        
        // 3. Макрос Guard
        if (trimmed.startsWith("Guard(condition")) {
            const condStr = getParamValue(trimmed, "condition");
            tsLines.push(`            if (!(${condStr || "false"})) { continue; }`);
            logStitchSync("[STITCH-400]", `Внедрен гвард Guard. Аппаратная инверсия: !(${condStr})`);
            continue;
        }

        // 4. Макрос Safety
        if (trimmed.startsWith("Safety(limit")) {
            const limStr = trimmed.replace(/[^\d]/g, "");
            tsLines.push(`            let safetyCounter = 0; if (++safetyCounter > ${limStr || "5000"}) { warn("Aura Safety Triggered"); break; }`);
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
        
        // 6. СНАЙПЕРСКИЙ ТОКЕНАЙЗЕР МАКРOСА Mutate (БЕЗ ГАЛЛЮЦИНАЦИЙ И СЛЕПЫХ УДАЛЕНИЙ)
        if (trimmed.startsWith("Mutate(")) {
            // Извлекаем целевой ID из параметров макроса
            const target = getParamValue(trimmed, "targetEntity");
            const targetId = target ? target : 'entityId';
            
            const dictStart = trimmed.indexOf("Dict(");
            let cleanValues = "";
            
            if (dictStart !== -1) {
                let startPos = dictStart + 5;
                let parenCount = 1;
                let endPos = startPos;
                
                // Посимвольно вычисляем СТРОГИЕ границы внутреннего словаря Dict
                for (let i = startPos; i < trimmed.length; i++) {
                    if (trimmed[i] === '(') parenCount++;
                    if (trimmed[i] === ')') {
                        parenCount--;
                        if (parenCount === 0) {
                            endPos = i;
                            break; // Нашли парное закрытие словаря! Немедленный откат от остального хвоста строки
                        }
                    }
                }
                
                // Вырезаем СТЕРИЛЬНОЕ мясо словаря (внутренние кавычки формул в абсолютной безопасности!)
                const rawValues = trimmed.substring(startPos, endPos).trim();
                
                // Заменяем исключительно стрелочки Джулии на двоеточия TS
                cleanValues = rawValues.replace(/=>/g, ":").trim();
            }
            
            // ДЕКЛАРАТИВНАЯ СБОРКА ИЗ БЕЗОПАСНЫХ ТОКЕНОВ
            const finalMutateStitch = `            ctx.world.insert(${targetId}, ({ ${cleanValues} }));`;
            tsLines.push(finalMutateStitch);
            
            logStitchSync("[STITCH-600]", `Мутация Mutate детерминировано собрана из токенов: ${finalMutateStitch.trim()}`);
            continue;
        }
        
        // 7. Условия Luau if
        if (trimmed.startsWith("if ") && !trimmed.endsWith("{") && !trimmed.includes("then")) {
            tsLines.push(`            if (${trimmed.substring(3).trim()}) {`);
            braceBalance++;
            logStitchSync("[STITCH-310]", "Luau-условие преобразовано в блок TS (Баланс++).");
            continue;
        }
        
        // 8. Маркер закрытия блоков Julia
        if (trimmed === "end") {
            tsLines.push("        }");
            braceBalance--;
            logStitchSync("[STITCH-700]", "Встречен маркер end. Закрыта скобка } (Баланс--)");
            
            if (braceBalance === 0) {
                logStitchSync("[STITCH-701]", "Математический баланс равен 0. Все ECS блоки успешно закрыты.");
                break;
            }
            continue;
        }
        
        tsLines.push(`        ${line.trim()}`);
    }
    
    return tsLines.join('\n');
}
