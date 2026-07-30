import * as fs from 'fs';
import * as path from 'path';

/**
 * 🪐 АВТОНОМНЫЙ ВНЕШНИЙ УЗЕЛ ОБРАБОТКИ КОНСТАНТ v38.9 (БЕЗОПАСНАЯ СБОРКА)
 * Извлекает строковые токены контента игры напрямую из тела ракушки Julia.
 * 100% обратная совместимость сигнатур. Защищен от синтаксических сбоев при наличии комментариев (#).
 */
export function weaveGameConstants(meta: any, rawBodyOrJson: string, projectRoot: string): boolean {
    if (!meta || meta.flameworkPattern !== "GlobalConstants") return false;

    console.log(`🪐 [Aura Registry Edge] Сборка реестра игры: ${meta.className || 'UnknownRegistry'}`);

    let identifiers: string[] = [];
    let factions: string[] = [];

    // Безопасный парсер текстовых массивов Джулии через регулярные выражения
    const parseTextArray = (targetKey: string, source: string): string[] => {
        // ЗАЩИТНЫЙ ЭШЕЛОН: Перед парсингом очищаем исходный текст от комментариев Джулии (#),
        // чтобы текст комментариев случайно не приклеился к именам констант и не сломал TS.
        const cleanSource = source.split(/\r?\n/)
            .map(line => line.split('#')[0]) // Отрезаем всё, что идет после знака # на каждой строке
            .join('\n');

        const regex = new RegExp(`${targetKey}\\s*=\\s*\\[([\\s\\S]*?)\\]`);
        const match = cleanSource.match(regex);
        if (!match) return [];
        
        return match[1]
            .split(',')
            .map(x => x.replace(/["'\\\s\[\]]/g, '')) // Выжигаем кавычки, пробелы и скобки
            .filter(x => x.length > 0 && /^[a-zA-Z0-9_]+$/.test(x)); // Пропускаем только валидные имена переменных
    };

    // Проверяем: если на входе JSON (из AST графа), читаем поля, иначе парсим как текст
    if (rawBodyOrJson.trim().startsWith('{')) {
        try {
            const ast = JSON.parse(rawBodyOrJson);
            if (ast && ast.render && ast.render.Registry) {
                const reg = ast.render.Registry;
                if (Array.isArray(reg.Identifiers)) {
                    identifiers = reg.Identifiers
                        .map((x: any) => String(x).replace(/["'\s]/g, ''))
                        .filter((x: string) => x.length > 0 && /^[a-zA-Z0-9_]+$/.test(x));
                }
                if (Array.isArray(reg.Factions)) {
                    factions = reg.Factions
                        .map((x: any) => String(x).replace(/["'\s]/g, ''))
                        .filter((x: string) => x.length > 0 && /^[a-zA-Z0-9_]+$/.test(x));
                }
            } else {
                // Если структура JSON иная, откатываемся на текстовый парсинг внутри JSON-строки
                identifiers = parseTextArray("Identifiers", rawBodyOrJson);
                factions = parseTextArray("Factions", rawBodyOrJson);
            }
        } catch (e) {
            // Если JSON сломался, откатываемся на парсинг текста внутри JSON-строки
            identifiers = parseTextArray("Identifiers", rawBodyOrJson);
            factions = parseTextArray("Factions", rawBodyOrJson);
        }
    } else {
        // Чистый фолбэк для парсинга сырого текста файла Julia
        identifiers = parseTextArray("Identifiers", rawBodyOrJson);
        factions = parseTextArray("Factions", rawBodyOrJson);
    }

    // Формируем чистейший TypeScript-код экспорта констант
    let tsContent = `// --- AURA GENERATED CONSTANTS (HYBRID RADAR v38.9) ---\n`;
    tsContent += `// Сгенерировано автоматически из ракушки. Не править руками!\n\n`;
    
    // Сохраняем исходный каноничный строковый экспорт для 100% совместимости со старыми модулями
    identifiers.forEach(id => { tsContent += `export const ${id} = "${id}";\n`; });
    factions.forEach(fac => { tsContent += `export const ${fac} = "${fac}";\n`; });

    const targetDir = path.join(projectRoot, 'src', 'shared');
    const targetFile = path.join(targetDir, 'constants.ts');

    try {
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        fs.writeFileSync(targetFile, tsContent, 'utf8');
        
        console.log(`💚 [Aura Registry Edge] Спецификация контента успешно вышита: src/shared/constants.ts`);
        console.log(`📦 Всего добавлено констант в игру: ${identifiers.length + factions.length} шт.`);
        return true;
    } catch (fsErr: any) {
        console.error(`| ❌ ОШИБКА ЗАПИСИ КОНСТАНТ на диск в ${targetFile}:`, fsErr.message);
        return false;
    }
}
