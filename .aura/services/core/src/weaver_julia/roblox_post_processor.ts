/**
 * ⚡ МОДЕРНИЗИРОВАННЫЙ СЕМАНТИЧЕСКИЙ ПОСТПРОЦЕССОР ДЛЯ ROBLOX-TS v38.9
 * Безопасная адаптация под rbxtsc с защитой от ReDoS и поломки операторов (===).
 */
export function applyRobloxStrictFixes(compiledBody: string): string {
    if (!compiledBody) return "";

    const lines = compiledBody.split('\n');
    const processedLines = lines.map(line => {
        let processed = line;

        // 1. 🔥 ФИКС: Безопасное выправление операторов Luau.
        // Используем негативный просмотр вперед/назад, чтобы исключить замену внутри '===' или '!=='
        // Заменяет '==' только если вокруг нет других знаков '='
        processed = processed.replace(/(?<!=)==(?!=)/g, '===');
        processed = processed.replace(/(?<!=)!=(?!=)/g, '!==');

        // 2. Исправляем касты итераторов для строгого контроля типов
        if (processed.includes('({} as any)')) {
            processed = processed.replaceAll('({} as any)', '({} as unknown)');
        }

        // 3. 🔥 ФИКС: Безопасный кастинг циклов Matter ECS query через гибкий RegExp.
        // Больше не привязан к жесткому вхождению lastIndexOf(')) {'). Поддерживает любые пробелы.
        const queryPattern = /(ctx\.world\.query\(.*?\))\s*(?=\{)/g;
        if (queryPattern.test(processed)) {
            processed = processed.replace(queryPattern, '$1 as unknown as Map<number, any[]>');
        }

        // 4. 🔥 ФИКС: Гибкая защита объектов мутаций insert() от строго линтера
        // Регулярное выражение ловит '}))' вне зависимости от наличия пробелов, точек с запятой или переносов
        const insertPattern = /\s*\}\s*\)\s*\)\s*;?/g;
        if (processed.includes('ctx.world.insert(') && insertPattern.test(processed)) {
            // Мягко инжектируем каст типов к Record прямо перед закрытием скобок
            processed = processed.replace(/(\s*\}\s*)\)\s*\)\s*;?$/, ' } as unknown as Record<string, unknown>));');
        }

        return processed;
    });

    return processedLines.join('\n');
}
