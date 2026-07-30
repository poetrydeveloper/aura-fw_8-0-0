// .aura/services/core/src/weaver_julia/roblox_post_processor.ts
export function applyRobloxStrictFixes(compiledBody: string): string {
    if (!compiledBody) return "";

    const lines = compiledBody.split('\n');
    const processedLines = lines.map(line => {
        let processed = line;

        // 🔥 ГЛАВНЫЙ ФИКС БЛОКА 2: Удалена калечащая автозамена Luau операторов сравнения!
        // Это полностью ликвидирует появление битого синтаксиса !=== во всех системах.

        // Исправляем касты итераторов для строгого контроля типов any
        if (processed.includes('({} as any)')) {
            processed = processed.replaceAll('({} as any)', '({} as unknown)');
        }

        return processed;
    });

    return processedLines.join('\n');
}
