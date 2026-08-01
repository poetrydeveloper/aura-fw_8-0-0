// .aura/services/core/src/weaver_julia/macros/Mutate.ts

/**
 * Модуль трансляции макроса Mutate v45.0.0
 * Детерминировано собирает мутации компонентов Matter ECS со строгой частичной типизацией Partial.
 */
export function translateMutate(
    trimmedLine: string,
    logStitch: (code: string, msg: string) => void
): string {
    const dictStart = trimmedLine.indexOf("Dict(");
    let cleanValues = "";
    let targetId = 'entityId'; 
    
    if (dictStart !== -1) {
        let startPos = dictStart + 5; 
        let parenCount = 1; 
        let endPos = startPos;
        
        for (let i = startPos; i < trimmedLine.length; i++) {
            if (trimmedLine[i] === '(') parenCount++;
            if (trimmedLine[i] === ')') { 
                parenCount--; 
                if (parenCount === 0) { 
                    endPos = i; 
                    break; 
                } 
            }
        }
        
        const rawValues = trimmedLine.substring(startPos, endPos).trim();
        const entries = rawValues.split(",");
        
        const processedFields = entries.map(entry => {
            if (!entry.includes("=>")) return "";
            const parts = entry.split("=>");
            
            // 🔥 СТРОГИЙ КАНOН: Извлекаем первый элемент массива (индекс 0) как чистую строку!
            const k = parts[0]; 
            const v = parts.slice(1).join("=>");
            
            // Теперь k - это гарантированная string, и метод .replace больше НЕ подчеркивается!
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
   
    // 🔥 СТРОГИЙ КАНOН: Используем Partial<Record<string, unknown>> вместо as unknown as any
    const finalMutateStitch = `            ctx.world.insert(${targetId}, ({ ${cleanValues} } as Partial<Record<string, unknown>>));`;
    
    logStitch("[STITCH-MUTATE]", `Мутация Mutate детерминировано собрана для entityId: ${targetId}`);
    
    return finalMutateStitch;
}
