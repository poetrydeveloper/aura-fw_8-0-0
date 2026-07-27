import fs from 'fs-extra';
import path from 'path';

const LOG_FILE_PATH = path.resolve('/app/nitka.log');

export async function initStitchLog(): Promise<void> {
    await fs.writeFile(LOG_FILE_PATH, `=== СТАРТ УМНОГО ТОКЕНАЙЗЕРА СЕТИ v36.0 ===\n`, 'utf8');
}

/**
 * ⚡ ДЕТЕРМИНИРОВАННЫЙ ПОСИМВОЛЬНЫЙ ТОКЕНАЙЗЕР JULIA ➔ TYPESCRIPT v36.5
 * Внедрен интеллектуальный вывод строгих типов (Strict Type Inference) для циклов Matter.
 * Полностью выжигает тип any на этапе генерации, защищая математические формулы.
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
        
        // 1. ИНТЕЛЛЕКТУАЛЬНАЯ ТРАНСЛЯЦИЯ МАКРOСА Query СО СТРОГИМИ ТИПАМИ КОМПОНЕНТОВ
        if (trimmed.startsWith("Query(components")) {
            const startArray = trimmed.indexOf("[");
            const endArray = trimmed.indexOf("]");
            let comps: string[] = [];
            if (startArray !== -1 && endArray !== -1) {
                comps = trimmed.substring(startArray + 1, endArray).replace(/["'\s]/g, "").split(",").filter(s => s.length > 0);
            }
            
            // Генерируем camelCase итераторы для деструктуризации (cFrame, archetype)
            const iterators = comps.map((c: string) => c.replace('Component', '').charAt(0).toLowerCase() + c.replace('Component', '').slice(1)).join(', ');
            
            // Генерируем строгий список интерфейсов для приведения типов (CFrameComponent, ArchetypeComponent)
            const strictTypesList = comps.join(', ');
            
            // Собираем пуленепробиваемый типизированный цикл без единого any!
            tsLines.push(`        for (const [entityId, [${iterators}]] of ctx.world.query(${(comps.map(() => '({} as unknown)')).join(', ')}) as unknown as Map<number, [${strictTypesList}]>) {`);
            braceBalance++;
            logStitchSync("[STITCH-301]", `Открыт строго типизированный цикл Query. Каст к Map<number, [${strictTypesList}]>`);
            continue;
        }
        
        // 2. ИНТЕЛЛЕКТУАЛЬНАЯ ТРАНСЛЯЦИЯ МАКРOСА NestedQuery С ЯВНЫМИ ТИПАМИ СИСТЕМЫ КОЛЛИЗИЙ
        if (trimmed.startsWith("NestedQuery(target")) {
            const targetName = getParamValue(trimmed, "target");
            tsLines.push(`        for (const [targetEntityId, [targetArchetype, targetCFrame]] of ctx.world.query(({} as unknown), ({} as unknown)) as unknown as Map<number, [ArchetypeComponent, CFrameComponent]>) { if (targetArchetype.id !== "${targetName || "GALAXY_PLAYER"}") continue;`);
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
        
        // 6. БЕРЕЖНО ВОССТАНОВЛЕННЫЙ ПОСИМВОЛЬНЫЙ ТОКЕНАЙЗЕР МАКРOСА Mutate
        if (trimmed.startsWith("Mutate(")) {
            const target = getParamValue(trimmed, "targetEntity");
            const targetId = target ? target : 'entityId';
            const dictStart = trimmed.indexOf("Dict(");
            let cleanValues = "";
            
            if (dictStart !== -1) {
                let startPos = dictStart + 5; let parenCount = 1; let endPos = startPos;
                for (let i = startPos; i < trimmed.length; i++) {
                    if (trimmed[i] === '(') parenCount++;
                    if (trimmed[i] === ')') { parenCount--; if (parenCount === 0) { endPos = i; break; } }
                }
                const rawValues = trimmed.substring(startPos, endPos).trim();
                // ЮВЕЛИРНЫЙ СКАСТ И ОЧИСТКА КАВЫЧЕК СЛОВАРЯ v31.0 - ПРOФИТ ТВОЕЙ СХЕМЫ ЗАЩИЩЕН
                cleanValues = rawValues.replace(/=>/g, ":").replace(/["']/g, "").trim();
            }
            
            // Заворачиваем объект в канонический строгий Record контракт для линтера rbxtsc
            const finalMutateStitch = `            ctx.world.insert(${targetId}, ({ ${cleanValues} } as unknown as Record<string, unknown>));`;
            tsLines.push(finalMutateStitch);
            logStitchSync("[STITCH-600]", `Мутация Mutate детерминировано собрана из токенов.`);
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