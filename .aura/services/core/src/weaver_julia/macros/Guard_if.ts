// .aura/services/core/src/weaver_julia/macros/Guard_if.ts

/**
 * Модуль трансляции квантового макроса Guard_if v44.0.0
 * Только открывает блок условия. Полное доверие зеркальному автомату 'end'.
 */
export function translateGuardIf(
    trimmedLine: string, 
    getParamValue: (line: string, key: string) => string,
    contentMatrix: Map<string, string[]>,
    translateRecursive: (juliaCode: string) => string,
    logStitch: (code: string, msg: string) => void
): string {
    const condStr = getParamValue(trimmedLine, "condition");
    const slotId = getParamValue(trimmedLine, "slot");

    let tsLines: string[] = [];

    // Открываем блок ветвления TypeScript
    tsLines.push(`            if (${condStr || "true"}) {`);

    // Если для этого слота был собран изолированный контент на Пассе №1 — рекурсивно разворачиваем его начиненную структуру
    if (slotId && contentMatrix.has(slotId)) {
        const rawSlotBody = contentMatrix.get(slotId)!.join('\n');
        const compiledSlotBody = translateRecursive(rawSlotBody);
        tsLines.push(compiledSlotBody);
    } else {
        logStitch("[MATRIX-WARN]", `Предупреждение: Слот Guard_if ${slotId} объявлен, но контент-капсула пуста или отсутствует.`);
    }

    // 🔥 ХАРДКОД ЗАКРЫВАЮЩИХ СКОБОК ВЫЖЖЕН!
    // Каждая } напишется строго по факту обнаружения родного слова 'end' в ракушке.
    logStitch("[STITCH-GUARD-IF]", `Успешная инжекция квантовой матрицы контента в слот Guard_if: ${slotId}`);
    
    return tsLines.join('\n');
}