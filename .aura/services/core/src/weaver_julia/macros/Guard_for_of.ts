// .aura/services/core/src/weaver_julia/macros/Guard_for_of.ts

/**
 * Модуль трансляции квантового макроса Guard_for_of v49.0.0
 * Генерирует строковую адресацию вложенного цикла для рантайма Flamework-Matter ECS.
 */
export function translateGuardForOf(
    trimmedLine: string, 
    getParamValue: (line: string, key: string) => string,
    contentMatrix: Map<string, string[]>,
    translateRecursive: (juliaCode: string) => string,
    logStitch: (code: string, msg: string) => void
): string {
    const targetName = getParamValue(trimmedLine, "target") || "ENEMY_INTERCEPTOR";
    const slotId = getParamValue(trimmedLine, "slot");

    let tsLines: string[] = [];
    const components = ['"ArchetypeComponent"', '"CFrameComponent"', '"VelocityComponent"'];
    const iterators = ['rawTargetArchetype', 'rawTargetCFrame', 'rawTargetVelocity'];

    // Передаем строки-имена в круглые скобки, а результат приводим через unknown к массиву
    tsLines.push(`        for (const [targetEntityId, [${iterators.join(', ')}]] of ctx.world.query(${components.join(', ')}) as unknown as Map<number, unknown[]>) {`);
    tsLines.push(`            const targetArchetype = rawTargetArchetype as unknown as ArchetypeComponent;`);
    tsLines.push(`            const targetCFrame = rawTargetCFrame as unknown as CFrameComponent;`);
    tsLines.push(`            const targetVelocity = rawTargetVelocity as unknown as VelocityComponent;`);
    tsLines.push(`            const isAuraTargetValid = targetArchetype.type === "${targetName}";`);

    if (slotId && contentMatrix.has(slotId)) {
        const rawSlotBody = contentMatrix.get(slotId)!.join('\n');
        const compiledSlotBody = translateRecursive(rawSlotBody);
        tsLines.push(compiledSlotBody);
    } else {
        logStitch("[MATRIX-WARN]", `Предупреждение: Слот цикла ${slotId} пуст или отсутствует.`);
    }

    logStitch("[STITCH-GUARD-FOR-OF]", `Успешно развернут плоский цикл Guard_for_of для слота: ${slotId}`);
    
    return tsLines.join('\n');
}
