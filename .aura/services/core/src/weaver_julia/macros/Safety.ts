// .aura/services/core/src/weaver_julia/macros/Safety.ts

/**
 * Модуль трансляции макроса Safety v45.0.0
 * Внедряет защиту выполнения ECS-систем от зацикливания со строгой типизацией глобального контекста.
 */
export function translateSafety(
    trimmedLine: string,
    logStitch: (code: string, msg: string) => void
): string {
    const limMatch = trimmedLine.match(/\d+/);
    const limStr = limMatch ? limMatch : "5000";
    
    let tsLines: string[] = [];
    // 🔥 СТРОГИЙ КАНOН: Никаких as any. Приводим глобальный рантайм к строгому словарю чисел Record<string, number>
    tsLines.push(`            const auraGlobalRegistry = globalThis as unknown as Record<string, number>;`);
    tsLines.push(`            if (auraGlobalRegistry["safetyCounter"] === undefined) { auraGlobalRegistry["safetyCounter"] = 0; }`);
    tsLines.push(`            if (++auraGlobalRegistry["safetyCounter"] > ${limStr}) { auraGlobalRegistry["safetyCounter"] = 0; warn("Aura Safety Triggered"); break; }`);
    
    logStitch("[STITCH-SAFETY]", `Внедрена защита Safety. Лимит: ${limStr}`);
    
    return tsLines.join('\n');
}
