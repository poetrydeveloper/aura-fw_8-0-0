// .aura/services/core/src/weaver_julia/macros/Calculate.ts

/**
 * Модуль трансляции макроса Calculate v44.0.0
 * Генерирует детерминированное объявление локальных констант в TypeScript.
 */
export function translateCalculate(
    trimmedLine: string,
    getParamValue: (line: string, key: string) => string,
    logStitch: (code: string, msg: string) => void
): string {
    const vNameStr = getParamValue(trimmedLine, "var");
    const exprStr = getParamValue(trimmedLine, "expr");
    
    logStitch("[STITCH-CALCULATE]", `Расчет переменной Calculate: const ${vNameStr} = ${exprStr}`);
    
    return `            const ${vNameStr || "temp"} = ${exprStr || "0"};`;
}
