/**
 * ⚡ ДЕТЕРМИНИРОВАННЫЙ ЛИНЕЙНЫЙ ТРАНСЛЯТОР JULIA ➔ TYPESCRIPT v18.0
 * Модуль отвечает ТОЛЬКО за перевод внутренностей ECS-методов.
 */
export function translateJuliaToTs(juliaCode: string): string {
    if (!juliaCode || !juliaCode.trim()) return "";
    
    const lines = juliaCode.split(/\r?\n/);
    let tsLines: string[] = [];
    
    for (let line of lines) {
        let trimmed = line.trim();
        
        // Пропускаем комментарии Julia и пустые строки
        if (trimmed.startsWith("#") || !trimmed) {
            if (!trimmed) tsLines.push("");
            continue;
        }
        
        // 1. Маппинг корневого макроса Query
        if (trimmed.startsWith("Query(components")) {
            const compsMatch = trimmed.match(/components\s*=\s*\[(.*?)\]/);
            const compsRaw = compsMatch ? compsMatch[1] : "";
            const comps = compsRaw.replace(/["'\s]/g, "").split(",").filter(s => s.length > 0);
            
            const iterators = comps.map(c => {
                const base = c.replace('Component', '');
                return base.charAt(0).toLowerCase() + base.slice(1);
            }).join(', ');
            
            tsLines.push(`        for (const [entityId, [${iterators}]] of ctx.world.query(${(comps.map(() => '({} as any)')).join(', ')})) {`);
            continue;
        }
        
        // 2. Маппинг вложенного макроса NestedQuery
        if (trimmed.startsWith("NestedQuery(target")) {
            const targetMatch = trimmed.match(/target\s*=\s*["'](.*?)["']/);
            const targetName = targetMatch ? targetMatch[1] : "GALAXY_PLAYER";
            tsLines.push(`        for (const [targetEntityId, [targetArchetype, targetCFrame]] of ctx.world.query(({} as any), ({} as any))) { if (targetArchetype.id !== "${targetName}") continue;`);
            continue;
        }
        
        // 3. Маппинг Гвардов, Сейфти и Вычислений
        if (trimmed.startsWith("Guard(condition")) {
            const cond = trimmed.match(/condition\s*=\s*["'](.*?)["']/);
            tsLines.push(`        if (${cond ? cond[1] : "false"}) { continue; }`);
            continue;
        }
        if (trimmed.startsWith("Safety(limit")) {
            const lim = trimmed.match(/limit\s*=\s*(\d+)/);
            tsLines.push(`        let safetyCounter = 0; if (++safetyCounter > ${lim ? lim[1] : "5000"}) { warn("Aura Safety Triggered"); break; }`);
            continue;
        }
        if (trimmed.startsWith("Calculate(var")) {
            const vName = trimmed.match(/var\s*=\s*["'](.*?)["']/);
            const expr = trimmed.match(/expr\s*=\s*["'](.*?)["']/);
            tsLines.push(`        const ${vName ? vName[1] : "temp"} = ${expr ? expr[1] : "0"};`);
            continue;
        }
        
        // 4. Маппинг Мутаций ( Dict трансляция в TS-объект )
        if (trimmed.startsWith("Mutate(")) {
            const target = trimmed.match(/targetEntity\s*=\s*["'](.*?)["']/);
            const targetId = target ? target[1] : 'entityId';
            
            const dictMatch = trimmed.match(/values\s*=\s*Dict\((.*?)\)/);
            let rawValues = dictMatch ? dictMatch[1] : "";
            let cleanValues = rawValues.replace(/["']/g, "").replace(/=>/g, ":").trim();
            
            tsLines.push(`        ctx.world.insert(${targetId}, ({ ${cleanValues} }));`);
            continue;
        }
        
        // 5. Железный маркер закрытия блоков Julia
        if (trimmed === "end") {
            tsLines.push("        }");
            continue;
        }
        
        // Вставки Luau-кода ИИ переносит один-в-один
        tsLines.push(`        ${line.trim()}`);
    }
    
    return tsLines.join('\n');
}