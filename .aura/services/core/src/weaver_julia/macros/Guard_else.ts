// .aura/services/core/src/weaver_julia/macros/Guard_else.ts

/**
 * Модуль трансляции квантового макроса Guard_else v44.0.0
 * Закрывает предыдущий блок и открывает финальное ветвление else. 
 * Полное доверие зеркальному автомату 'end'.
 */
export function translateGuardElse(
    trimmedLine: string, 
    getParamValue: (line: string, key: string) => string,
    contentMatrix: Map<string, string[]>,
    translateRecursive: (juliaCode: string) => string,
    logStitch: (code: string, msg: string) => void
): string {
    const slotId = getParamValue(trimmedLine, "slot");

    let tsLines: string[] = [];

    // 🔥 СТЫКОВОЧНЫЙ КАНOН: Закрываем предыдущую ветку и открываем финальный else
    tsLines.push(`            } else {`);

    // Если для этого слота был собран изолированный контент на Пассе №1 — рекурсивно разворачиваем его структуру
    if (slotId && contentMatrix.has(slotId)) {
        const rawSlotBody = contentMatrix.get(slotId)!.join('\n');
        const compiledSlotBody = translateRecursive(rawSlotBody);
        tsLines.push(compiledSlotBody);
    } else {
        logStitch("[MATRIX-WARN]", `Предупреждение: Слот Guard_else ${slotId} объявлен, но контент-капсула пуста или отсутствует.`);
    }

    // Никакого хардкода авто-закрытий скобок. Схлопывание произойдет строго по факту обнаружения 'end'.
    logStitch("[STITCH-GUARD-ELSE]", `Успешная инжекция квантовой матрицы контента в слот Guard_else: ${slotId}`);
    
    return tsLines.join('\n');
}
