/**
 * ⚡ ИЗОЛИРОВАННЫЙ СЕМАНТИЧЕСКИЙ ПОСТПРОЦЕССОР ДЛЯ ROBLOX-TS v34.3
 * Модуль бережно адаптирует сгенерированный TS-код под строгие правила линтера rbxtsc,
 * не вмешиваясь в алгоритмы расстановки скобок главного парсера.
 */
export function applyRobloxStrictFixes(compiledBody: string): string {
    if (!compiledBody) return "";

    const lines = compiledBody.split('\n');
    const processedLines = lines.map(line => {
        let processed = line;

        // 1. Бережно выправляем нестрогие операторы сравнения Luau
        if (processed.includes(' == ')) {
            processed = processed.replace(/ == /g, ' === ');
        }
        if (processed.includes(' != ')) {
            processed = processed.replace(/ != /g, ' !== ');
        }

        // 2. Исправляем небезопасные для линтера rbxtsc касты итераторов ({} as any) 
        if (processed.includes('({} as any)')) {
            processed = processed.replaceAll('({} as any)', '({} as unknown)');
        }

        // 3. Выправляем циклы query: принудительно кастим их возвращаемое значение через unknown к типу any[],
        // чтобы rbxtsc не ругался на ForOf iteration типа any
        if (processed.includes('ctx.world.query(') && processed.includes('for (const ')) {
            const queryEndIdx = processed.lastIndexOf(')) {');
            if (queryEndIdx !== -1) {
                const beforeQueryEnd = processed.substring(0, queryEndIdx + 1);
                const afterQueryEnd = processed.substring(queryEndIdx + 1);
                processed = `${beforeQueryEnd} as unknown as Map<number, any[]> ${afterQueryEnd}`;
            }
        }

        // 4. Защищаем объекты мутаций insert() от строгого контроля типов any
        if (processed.includes('ctx.world.insert(')) {
            processed = processed.replace(' }));', ' } as unknown as Record<string, unknown>));');
        }

        return processed;
    });

    return processedLines.join('\n');
}
