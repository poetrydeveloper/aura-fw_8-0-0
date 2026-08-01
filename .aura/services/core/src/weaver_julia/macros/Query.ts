// .aura/services/core/src/weaver_julia/macros/Query.ts

/**
 * Модуль трансляции квантового макроса Query v49.0.0
 * Генерирует строковые аргументы для рантайма Flamework-Matter ECS.
 * Исключает ошибки TS2558 и TS2693, гарантируя извлечение типов деструктуризации.
 */
export function translateQuery(
    trimmedLine: string,
    logStitch: (code: string, msg: string) => void
): string {
    const startArray = trimmedLine.indexOf("[");
    const endArray = trimmedLine.indexOf("]");
    let comps: string[] = [];
    
    if (startArray !== -1 && endArray !== -1) {
        comps = trimmedLine.substring(startArray + 1, endArray).replace(/["'\s]/g, "").split(",").filter(s => s.length > 0);
    }
    
    if (comps.length === 0) return "        // Empty Query ignored";

    const strictTypesList = comps.join(', ');
    const iterators = comps.map((c: string) => {
        const base = c.replace('Component', '');
        return base.charAt(0).toLowerCase() + base.slice(1);
    }).join(', ');
    
    // Переводим компоненты в строки для рантайма Matter: ctx.world.query("WeaponStateComponent", "ArchetypeComponent")
    const quotedCompsList = comps.map(c => `"${c}"`).join(', ');
    
    let tsLines: string[] = [];

    // 🔥 СТРОГИЙ КАНOН v49.0: Передаем строки в аргументы, а итератор приводим к интерфейсу Map
    // Никаких generic-скобок <...> внутри вызова query(), что полностью легально для вашей версии типов!
    tsLines.push(`        for (const [entityId, [${iterators}]] of ctx.world.query(${quotedCompsList}) as unknown as Map<number, [${strictTypesList}]>) {`);

    logStitch("[STITCH-QUERY]", `Успешно развернут плоский цикл Query для компонентов: [${strictTypesList}]`);
    
    return tsLines.join('\n');
}
