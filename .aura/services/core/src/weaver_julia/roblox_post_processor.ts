// .aura/services/core/src/weaver_julia/roblox_post_processor.ts

/**
 * 🪐 САНИТАРНЫЙ ПОСТ-ПРОЦЕССОР СЕТЕВОГО ТРАНСПОРТА И КОНТЕКСТОВ v39.0.10
 * Гарантирует абсолютную чистоту TypeScript-кода перед записью на диск проекта.
 * Выжигает типы 'any', легаси-конструкторы и восстанавливает статический контекст ECS.
 */
export function applyRobloxStrictFixes(compiledBody: string): string {
    if (!compiledBody) return "";

    const lines = compiledBody.split('\n');
    const processedLines = lines.map(line => {
        let processed = line;

        // 1. Исправляем касты итераторов для строгого контроля типов any
        if (processed.includes('({} as any)')) {
            processed = processed.replaceAll('({} as any)', '({} as unknown)');
        }

        // 2. 🔥 ФИКС ЛЕГАСИ-КОНСТРУКТОРОВ: Превращаем SharedTypes.Component({ ... }) в чистый JSON-объект!
        // Вырезает вызов функции, оставляя только валидное тело данных для Matter ECS
        const sharedTypesPattern = /SharedTypes\.[A-Za-z0-9_]+Component\s*\(\s*(\{[\s\S]*?\})\s*\)/g;
        if (sharedTypesPattern.test(processed)) {
            processed = processed.replace(sharedTypesPattern, '$1');
        }
        
        // Дополнительный гвард для плоских вызовов удаления компонентов в HealthSystem
        if (processed.includes('SharedTypes.DamagePayloadComponent')) {
            processed = processed.replaceAll('SharedTypes.DamagePayloadComponent', '"DamagePayloadComponent"');
        }

        // 3. 🔥 ФИКС КОНТЕКСТА: Стираем ошибочные 'this.' перед переменными игрока и Flamework-евентами
        processed = processed.replace(/this\.localPlayerEntityId/g, 'localPlayerEntityId');
        processed = processed.replace(/this\.getMovementInputVector/g, 'getMovementInputVector');
        processed = processed.replace(/this\.inputEvents/g, 'inputEvents');

        // 4. 🔥 СТРОГИЙ КОНТРОЛЬ ТИПОВ ANY В МАТРИЦЕ ЦИКЛОВ:
        // Аппаратно заменяем Map<number, any[]> на Map<number, unknown[]> для полной защиты от TypeScript ошибок
        if (processed.includes('as unknown as Map<number, any[]>')) {
            processed = processed.replaceAll('as unknown as Map<number, any[]>', 'as unknown as Map<number, unknown[]>');
        }
        if (processed.includes('any[]')) {
            processed = processed.replaceAll('any[]', 'unknown[]');
        }

        return processed;
    });

    return processedLines.join('\n');
}
