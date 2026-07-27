/**
 * ⚡ ДЕТЕРМИНИРОВАННЫЙ КОМПИЛЯТОР ТИПОВ ДЛЯ JULIA-СЛОВАРЕЙ v18.0
 * Модуль отвечает ТОЛЬКО за генерацию src/shared/components.types.ts.
 */
export function compileJuliaComponentTypes(rawJuliaCode: string): string {
    let resultTs = `// --- AURA COMPONENTS PASSPORT TYPES v18.0 (JULIA CONTOUR) ---\n\n`;
    
    try {
        const lines = rawJuliaCode.split(/\r?\n/);
        let insideDict = false;
        
        for (let line of lines) {
            let trimmed = line.trim();
            
            if (trimmed.startsWith("components = Dict(")) {
                insideDict = true;
                continue;
            }
            if (insideDict && trimmed.startsWith(")")) {
                insideDict = false;
                break;
            }
            
            if (insideDict) {
                // Ищем строку вида: "ArchetypeComponent" => Dict("id" => "string", ...)
                const match = trimmed.match(/"(.*?)"\s*=>\s*Dict\((.*?)\)/);
                if (match) {
                    const compName = match[1];
                    const fieldsRaw = match[2];
                    
                    resultTs += `export interface ${compName} {\n`;
                    
                    // Бьем поля компонента по запятым
                    const fields = fieldsRaw.split(",");
                    fields.forEach(f => {
                        const pair = f.split("=>");
                        if (pair.length === 2) {
                            const fName = pair[0].replace(/["'\s]/g, "");
                            const fType = pair[1].replace(/["'\s]/g, "");
                            resultTs += `    ${fName}: ${fType};\n`;
                        }
                    });
                    
                    resultTs += `}\n\n`;
                }
            }
        }
    } catch (e: any) {
        resultTs += `// ❌ Ошибка парсинга Julia-словаря: ${e.message}\n`;
    }
    
    return resultTs;
}
