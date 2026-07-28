import * as fs from 'fs';
import * as path from 'path';

/**
 * 🪐 АВТОНОМНЫЙ ВНЕШНИЙ УЗЕЛ ОБРАБОТКИ КОНСТАНТ v44.3 (ВСЕЯДНЫЙ РЕГЕКС-ПАРСЕР)
 * Извлекает строковые токены контента игры напрямую из тела ракушки Julia,
 * полностью защищен от коллизий JSON AST, и вышивает constants.ts на хосте Windows.
 */
export function weaveGameConstants(meta: any, rawBodyOrJson: string, projectRoot: string): boolean {
    if (meta.flameworkPattern !== "GlobalConstants") return false;

    console.log(`🪐 [Aura Registry Edge] Сборка реестра игры: ${meta.className}`);

    let identifiers: string[] = [];
    let factions: string[] = [];

    // Безопасный парсер текстовых массивов Джулии через регулярные выражения
    const parseTextArray = (targetKey: string, source: string): string[] => {
        const regex = new RegExp(`${targetKey}\\s*=\\s*\\[([\\s\\S]*?)\\]`);
        const match = source.match(regex);
        if (!match) return [];
        return match[1]
            .split(',')
            .map(x => x.replace(/["'\\\s\[\]]/g, '')) // Выжигаем кавычки, пробелы и скобки
            .filter(Boolean);
    };

    // Проверяем: если на входе JSON, пытаемся прочитать поля, иначе парсим как текст
    if (rawBodyOrJson.trim().startsWith('{')) {
        try {
            const ast = JSON.parse(rawBodyOrJson);
            if (ast && ast.render && ast.render.Registry) {
                const reg = ast.render.Registry;
                if (Array.isArray(reg.Identifiers)) identifiers = reg.Identifiers.map((x: any) => String(x).replace(/["'\s]/g, ''));
                if (Array.isArray(reg.Factions)) factions = reg.Factions.map((x: any) => String(x).replace(/["'\s]/g, ''));
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
    let tsContent = `// --- AURA GENERATED CONSTANTS (HYBRID RADAR v44.3) ---\n// Сгенерировано автоматически из ракушки GalaxyRegistry.jl. Не править руками!\n\n`;
    
    identifiers.forEach(id => { tsContent += `export const ${id} = "${id}";\n`; });
    factions.forEach(fac => { tsContent += `export const ${fac} = "${fac}";\n`; });

    const targetDir = path.join(projectRoot, 'src', 'shared');
    const targetFile = path.join(targetDir, 'constants.ts');

    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    
    fs.writeFileSync(targetFile, tsContent, 'utf8');
    console.log(`💚 [Aura Registry Edge] Спецификация контента успешно вышита: src/shared/constants.ts`);
    console.log(`📦 Всего добавлено констант в игру: ${identifiers.length + factions.length} шт.`);
    return true;
}
