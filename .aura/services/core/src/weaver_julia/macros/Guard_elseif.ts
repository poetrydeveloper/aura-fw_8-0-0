// .aura/services/core/src/weaver_julia/macros/Guard_elseif.ts

/**
 * Модуль трансляции квантового макроса Guard_elseif v44.0.0
 * Закрывает предыдущий блок и открывает ветвление else if. 
 * Полное доверие зеркальному автомату 'end'.
 */
export function translateGuardElseif(
    trimmedLine: string, 
    getParamValue: (line: string, key: string) => string,
    contentMatrix: Map<string, string[]>,
    translateRecursive: (juliaCode: string) => string,
    logStitch: (code: string, msg: string) => void
): string {
    const condStr = getParamValue(trimmedLine, "condition");
    const slotId = getParamValue(trimmedLine, "slot");

    let tsLines: string[] = [];

    // 🔥 СТЫКОВОЧНЫЙ КАНOН: Закрываем предыдущую ветку и открываем новую else if
    tsLines.push(`            } else if (${condStr || "true"}) {`);

    // Если для этого слота был собран изолированный контент на Пассе №1 — рекурсивно разворачиваем его структуру
    if (slotId && contentMatrix.has(slotId)) {
        const rawSlotBody = contentMatrix.get(slotId)!.join('\n');
        const compiledSlotBody = translateRecursive(rawSlotBody);
        tsLines.push(compiledSlotBody);
    } else {
        logStitch("[MATRIX-WARN]", `Предупреждение: Слот Guard_elseif ${slotId} объявлен, но контент-капсула пуста или отсутствует.`);
    }

    // Никакого хардкода авто-закрытий скобок. Схлопывание произойдет строго по факту обнаружения 'end'.
    logStitch("[STITCH-GUARD-ELSEIF]", `Успешная инжекция квантовой матрицы контента в слот Guard_elseif: ${slotId}`);
    
    return tsLines.join('\n');
}
