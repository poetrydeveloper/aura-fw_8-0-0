// .aura/services/core/src/weaver_julia/julia_parser.ts
import fs from 'fs-extra';
import path from 'path';

// Импортируем нашу обойму изолированных квантовых макросов v44.0
import { translateQuery } from './macros/Query';
import { translateGuardForOf } from './macros/Guard_for_of';
import { translateGuardIf } from './macros/Guard_if';
import { translateGuardElseif } from './macros/Guard_elseif';
import { translateGuardElse } from './macros/Guard_else';
import { translateMutate } from './macros/Mutate';
import { translateCalculate } from './macros/Calculate';
import { translateSafety } from './macros/Safety';

const LOG_FILE_PATH = path.resolve('/app/.aura/services/core/dist/nitka.log');

export async function initStitchLog(): Promise<void> {
    await fs.ensureDir(path.dirname(LOG_FILE_PATH));
    await fs.writeFile(LOG_FILE_PATH, `=== СТАРТ МОДУЛЬНОГО КВАНТОВОГО ДИСПЕТЧЕРА v44.0 (MICROKERNEL) ===\n`, 'utf8');
}

/**
 * ⚡ МОДУЛЬНЫЙ ДВУХПРОХОДНОЙ КВАНТОВЫЙ КОМПИЛЯТОР v44.0.0
 * Инкапсулирует логику трансляции в изолированных файлах папки macros/.
 * За скобки отвечает строго одно место. Полный отказ от continue/return.
 */
export function translateJuliaToTs(juliaCode: string, className: string, methodName: string): string {
    if (!juliaCode || !juliaCode.trim()) return "";
    
    const lines = juliaCode.split(/\r?\n/);
    let tsLines: string[] = [];
    let memoryLogs: string[] = []; 
    let insideRender = false;
    
    // Хэш-карта квантовой матрицы контента
    const contentMatrix = new Map<string, string[]>();

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

    // =========================================================================
    // 🛰️ ПАСС №1: ИЗОЛИРОВАННОЕ СКАНИРОВАНИЕ И ИНДЕКСАЦИЯ МАТРИЦЫ КОНТЕНТА
    // =========================================================================
    let currentSlotId: string | null = null;
    let insideScanScope = false;
    const skeletonLines: string[] = [];

    for (let line of lines) {
        let trimmed = line.trim();
        
        if (!insideScanScope) {
            skeletonLines.push(line);
            if (trimmed.startsWith("render = function") || trimmed.startsWith("render(ctx)") || trimmed.includes("render = (ctx) ->") || trimmed.includes("render = ctx ->")) {
                insideScanScope = true;
            }
            continue;
        }

        // Фиксация старта именованной капсулы контента
        if (trimmed.includes("#START_CONTENT_")) {
            const match = trimmed.match(/#START_CONTENT_([0-9]+_[0-9]+)#/);
            if (match && match[1]) {
                currentSlotId = match[1]; // Берем чистую строковую группу ID
                contentMatrix.set(currentSlotId, []);
                logStitchSync("[MATRIX-SCAN-START]", `Зарегистрирован квантовый слот контента: ${currentSlotId}`);
            }
            continue;
        }

        // Фиксация закрытия капсулы контента
        if (trimmed.includes("#END_CONTENT_")) {
            currentSlotId = null;
            continue;
        }

        // Строки контента изолированно копим в хэш-карту, полностью стирая из скелета
        if (currentSlotId) {
            contentMatrix.get(currentSlotId)!.push(line);
        } else {
            skeletonLines.push(line);
        }
    }

    // Лямбда-функция для рекурсивного развертывания начинки слотов внутри макросов
    const translateRecursive = (subJuliaCode: string): string => {
        return translateJuliaToTs(subJuliaCode, className, methodName);
    };

    // =========================================================================
    // 🛸 ПАСС №2: МОДУЛЬНАЯ ДИСПЕТЧЕРИЗАЦИЯ МАКРОСОВ
    // =========================================================================
    for (let line of skeletonLines) {
        let trimmed = line.trim();

        // AURA_END — это просто стоп-кран стрима. Никаких призрачных автоскобок!
        if (trimmed.includes("AURA_END")) {
            logStitchSync("[STITCH-TERMINATION]", "Достигнут маркер финала # AURA_END. Потоковое чтение остановлено.");
            break;
        }

        if (trimmed.startsWith("#") || !trimmed) {
            if (!trimmed) tsLines.push("");
            continue;
        }
        
        if (!insideRender) {
            if (trimmed.startsWith("render = function") || trimmed.startsWith("render(ctx)") || trimmed.includes("render = (ctx) ->") || trimmed.includes("render = ctx ->")) {
                insideRender = true;
                
                // 🔥 ГЛАВНЫЙ АРХИТЕКТУРНЫЙ ФИКС v48.0: Метод ОБЯЗАН открывать свою фигурную скобку {
                tsLines.push(" {"); 
                
                logStitchSync("[STITCH-BLOCK-INIT]", "Успешный вход в изолированный стрим render. Скобка { открыта.");
            }
            continue;
        }

        // 1. Цикл Query
        if (trimmed.startsWith("Query(components")) {
            tsLines.push(translateQuery(trimmed, logStitchSync));
            continue;
        }

        // 2. Цикл Guard_for_of
        if (trimmed.startsWith("Guard_for_of(")) {
            tsLines.push(translateGuardForOf(trimmed, getParamValue, contentMatrix, translateRecursive, logStitchSync));
            continue;
        }

        // 3. Условие Guard_if
        if (trimmed.startsWith("Guard_if(")) {
            tsLines.push(translateGuardIf(trimmed, getParamValue, contentMatrix, translateRecursive, logStitchSync));
            continue;
        }

        // 4. Условие Guard_elseif
        if (trimmed.startsWith("Guard_elseif(")) {
            tsLines.push(translateGuardElseif(trimmed, getParamValue, contentMatrix, translateRecursive, logStitchSync));
            continue;
        }

        // 5. Условие Guard_else
        if (trimmed.startsWith("Guard_else(")) {
            tsLines.push(translateGuardElse(trimmed, getParamValue, contentMatrix, translateRecursive, logStitchSync));
            continue;
        }

        // 6. Утилита Safety
        if (trimmed.startsWith("Safety(limit")) {
            tsLines.push(translateSafety(trimmed, logStitchSync));
            continue;
        }

        // 7. Утилита Calculate
        if (trimmed.startsWith("Calculate(var")) {
            tsLines.push(translateCalculate(trimmed, getParamValue, logStitchSync));
            continue;
        }

        // 8. Утилита Mutate
        if (trimmed.startsWith("Mutate(")) {
            tsLines.push(translateMutate(trimmed, logStitchSync));
            continue;
        }
        
        // 9. Условия легаси Luau if
        if (trimmed.startsWith("if ") && !trimmed.endsWith("{") && !trimmed.includes("then")) {
            tsLines.push(`            if (${trimmed.substring(3).trim()}) {`);
            logStitchSync("[STITCH-IF-LUAU]", "Luau-условие преобразовано в блок TS.");
            continue;
        }
        
        // 10. Чистый бесконтекстный зеркальный автомат end
        if (trimmed === "end" || trimmed.startsWith("end")) {
            tsLines.push("        }");
            logStitchSync("[STITCH-END-COLLAPSE]", "Схлопывание блока Julia end ➔ }");
            continue;
        }
        
        tsLines.push(`        ${line.trim()}`);
    }
    
    fs.appendFile(LOG_FILE_PATH, memoryLogs.join(''), 'utf8').catch(() => {});
    
    return tsLines.join('\n');
}
