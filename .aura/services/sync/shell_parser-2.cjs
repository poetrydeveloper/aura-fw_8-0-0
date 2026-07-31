// .aura/services/sync/shell_parser-2.cjs
const fs = require('fs');
const path = require('path');

/**
 * 🪐 АВТОНОМНЫЙ ДИНАМИЧЕСКИЙ ДВИЖОК ГЛОССАРИЯ И БАЛАНСА v38.9.125
 * Автоматически загружает rules_matrix.json и проводит тотальный аудит ракушек.
 */
function validateShellBalanceAndGlossary(fileOrText) {
    if (!fileOrText) {
        throw new Error("[AURA PARSER FATAL]: Received undefined payload execution vector.");
    }

    let rawSource = "";
    let fileName = "inline_buffer.jl";

    // Полиморфный гвард входящего payload (Путь к файлу или сырой текст)
    if (typeof fileOrText === 'string' && fileOrText.length < 500 && fs.existsSync(fileOrText)) {
        rawSource = fs.readFileSync(fileOrText, 'utf8');
        fileName = path.basename(fileOrText);
    } else {
        rawSource = fileOrText;
    }

    // 🔥 АВТОМАТИЧЕСКАЯ НАДЁЖНАЯ ЗАГРУЗКА НАШЕГО ИДЕАЛЬНОГО МАНИФЕСТА
    const matrixPath = path.join(__dirname, 'manifest', 'rules_matrix.json');
    if (!fs.existsSync(matrixPath)) {
        throw new Error(`[AURA PARSER FATAL]: Файл матрицы правил не найден по пути: ${matrixPath}`);
    }
    const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));

    const lines = rawSource.split(/\r?\n/);
    let sanitizedMatrix = "";
    
    // =========================================================================
    // ЭШЕЛОН 1: ИНСПЕКЦИЯ СТРОК И ЧЕРНЫЙ СПИСОК ПРАВИЛ (BLACK LIST SCAN)
    // =========================================================================
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        let trimmed = line.trim();
        if (trimmed.startsWith('#') || trimmed === "") return; 

        // Прогоняем строку через Черный список регулярных выражений из JSON
        const blackList = Array.isArray(matrix.black_list_rules) ? matrix.black_list_rules : [];
        
        for (const rule of blackList) {
            if (!rule.pattern || rule.code.includes('DICT')) continue; 
            
            // Передаем флаг "m" (multiline), чтобы регулярные выражения манифеста могли снайперски 
            // контролировать как отдельные строки, так и многострочные разрывы скобок в rawSource!
            const regex = new RegExp(rule.pattern, "m");
            if (regex.test(rawSource)) {
                throw new Error(`\n| [НАРУШЕНИЕ КАНOНА АУРА-8]\n| Файл: ${fileName}\n| Код правила: ${rule.code}\n| Ошибка: ${rule.message}\n`);
                }
        }

        let insideQuotes = false;
        let quoteChar = null;
        let cleanLine = "";
        
        for (let i = 0; i < line.length; i++) {
            let char = line[i];
            let isEscaped = (i > 0 && line[i - 1] === '\\' && (i === 1 || line[i - 2] !== '\\'));
            
            if ((char === '"' || char === "'") && !isEscaped) {
                if (!insideQuotes) {
                    insideQuotes = true;
                    quoteChar = char;
                    cleanLine += char; 
                    continue;
                } else if (char === quoteChar) {
                    insideQuotes = false;
                    quoteChar = null;
                    cleanLine += char; 
                    continue;
                }
            }
            if (char === '#' && !insideQuotes) break;
            cleanLine += insideQuotes ? ' ' : char; // Очищаем строки для изоляции токенов 'end'
        }
        sanitizedMatrix += cleanLine + "\n";
    });
    // =========================================================================
    // ЭШЕЛОН 2: ПРОВЕРКА ПО БЕЛОМУ СЛОВАРЮ ТЕРМИНОВ (WHITE LIST GLOSSARY)
    // =========================================================================
    // Собираем все разрешенные слова из структуры манифеста без ошибок контекста
    const allowedTerms = new Set([
        ...matrix.white_list_dictionary.system_constants,
        ...matrix.white_list_dictionary.macros.map(m => m.term),
        ...matrix.white_list_dictionary.roblox_api.map(r => r.term),
        ...matrix.white_list_dictionary.runtime_context.map(c => c.term),
        ...matrix.white_list_dictionary.allowed_components_and_tags,
        ...matrix.white_list_dictionary.allowed_variables_and_expressions
    ]);

    // Разбиваем очищенный от кавычек и комментариев код на отдельные слова-токены
    const allWords = sanitizedMatrix.match(/\b[A-Za-z0-9_]+\b/g) || [];
    
    for (const word of allWords) {
        // Пропускаем чистые числа, чтобы валидатор не блокировал координаты и лимиты
        if (/^\d+$/.test(word)) continue;

        // Жесткая верификация по Белому глоссарию нашего JSON-документа
        if (!allowedTerms.has(word)) {
            throw new Error(`\n| [НАРУШЕНИЕ КАНOНА АУРА-8]\n| Файл: ${fileName}\n| Обнаружен неизвестный терм: "${word}"\n| Ошибка: Данное слово отсутствует в Белом словаре разрешенных терминов.\n| Подсказка: Проверьте опечатки или внесите слово в manifest/rules_matrix.json.\n`);
        }
    }

    // =========================================================================
    // ЭШЕЛОН 3: ТОКЕНИЗАЦИЯ И СТЭКОВЫЙ АНАЛИЗ БАЛАНСА БЛОКОВ (LIFO)
    // =========================================================================
    const tokenRegex = /\b(function|do|if|for|while|end)\b/g;
    const tokens = sanitizedMatrix.match(tokenRegex) || [];
    const blockStack = [];

    for (const token of tokens) {
        if (token === 'function' || token === 'do' || token === 'if' || token === 'for' || token === 'while') {
            blockStack.push({ type: token });
        } else if (token === 'end') {
            if (blockStack.length === 0) {
                throw new Error(`\n| [AURA PARSER ERROR] Критический дисбаланс в файле ${fileName}!\n| Обнаружен сиротский 'end', у которого нет открывающего блока.\n`);
            }
            blockStack.pop(); 
        }
    }

    if (blockStack.length > 0) {
        const unclosedScopes = blockStack.map(b => b.type).join(', ');
        throw new Error(`\n| [AURA PARSER ERROR] Нарушен баланс блоков Джулии в файле ${fileName}.\n| Не закрыты следующие операторы: [${unclosedScopes}].\n`);
    }

    // =========================================================================
    // ЭШЕЛОН 4: АВТОНОМНОЕ ИЗВЛЕЧЕНИЕ МЕТАДАННЫХ ДЛЯ ОРКЕСТРАТОРА
    // =========================================================================
    const extractParam = (paramName) => {
        const regex = new RegExp(`\\b${paramName}\\s*=\\s*["']([^"']+)["']`, 'i');
        const match = rawSource.match(regex);
        return match ? match[1] : "";
    };

    return {
        id: extractParam("id") || "ecs_generated_shell",
        className: extractParam("className") || path.basename(fileName, '.jl'),
        methodName: extractParam("methodName") || "update",
        pattern: extractParam("flameworkPattern") || "MatterSystem",
        executionSide: extractParam("executionSide") || "Server",
        rojoTarget: extractParam("rojoTarget") || "src/server/systems",
        subject: "System",
        action: "Mutates",
        object: "Component",
        codeImplementation: rawSource
    };
}

module.exports = {
    validateShellBalance: validateShellBalanceAndGlossary,
    parseShellFile: validateShellBalanceAndGlossary,
    validateShell: validateShellBalanceAndGlossary
};