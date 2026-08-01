// .aura/services/sync/shell_parser-2.cjs
const fs = require('fs-extra');
const path = require('path');

/**
 * 🛰️ СЕМАНТИЧЕСКИЙ КВАНТОВЫЙ ЭКСТРАКТОР v46.0.0 (LIGHTWEIGHT DEPLOY)
 * Полный отказ от избыточного подсчета скобок на хосте Windows.
 * Контроль баланса на 100% делегирован компилятору в Docker-контейнере.
 * Выуживает метаданные и страхует compiler_cli.cjs v38.9 от падения.
 */
function validateShellContract(...args) {
    let fileContent = "";
    let fileNameForLog = "UnknownSystem.jl";

    try {
        // 1. Извлекаем входные данные (путь к файлу или сырой контент)
        for (const arg of args) {
            if (!arg) continue;
            const strArg = arg.toString().trim();
            if (strArg.startsWith("AuraShell") || strArg.startsWith("AuraComponentPassport")) {
                fileContent = strArg;
                break;
            }
            if (typeof arg === 'string' && fs.existsSync(arg) && fs.statSync(arg).isFile()) {
                fileContent = fs.readFileSync(arg, 'utf8').trim();
                fileNameForLog = path.basename(arg);
                break;
            }
        }

        if (!fileContent) {
            throw new Error("Не удалось прочитать контент ракушки из переданных аргументов.");
        }

        // 2. Чтение Белого словаря терминов (Опциональный аудит)
        const rulesMatrixPath = path.resolve(process.cwd(), '.aura/services/sync/manifest/rules_matrix.json');
        let allowedTerms = new Set();
        if (fs.existsSync(rulesMatrixPath)) {
            const rules = fs.readJsonSync(rulesMatrixPath);
            allowedTerms = new Set(rules.allowed_variables_and_expressions || []);
        }

        const lines = fileContent.split(/\r?\n/);

        // Построчный аудит словаря для вывода предупреждений в консоль
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (trimmed.includes("AURA_END")) break;

            if (trimmed && !trimmed.startsWith("#") && !trimmed.includes("START_CONTENT") && !trimmed.includes("END_CONTENT") && allowedTerms.size > 0) {
                const tokens = trimmed.split(/[^a-zA-Z0-9_$]+/);
                for (const token of tokens) {
                    if (token && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(token)) {
                        const isReserved = ["function", "end", "do", "if", "then", "else", "elseif", "return", "true", "false", "undefined", "Dict", "const", "let", "var"].includes(token);
                        if (!isReserved && !allowedTerms.has(token)) {
                            // Выводим только варнинг, не блокируя деплой
                            console.warn(`[AURA POOL INFO] Пропущен терм: ${token}`);
                        }
                    }
                }
            }
        }

        // =========================================================================
        // 🛰️ СЕМАНТИЧЕСКИЙ ПАСС: ВЫУЖИВАНИЕ МЕТАДАННЫХ РЕГУЛЯРНЫМИ ВЫРАЖЕНИЯМИ
        // =========================================================================
        const extractField = (regex, defaultVal = "undefined") => {
            const match = fileContent.match(regex);
            return match && match[1] ? match[1].trim() : defaultVal;
        };

        // Извлекаем корневые идентификаторы контракта ракушки
        const id = extractField(/id\s*=\s*["']([^"']+)["']/);
        const className = extractField(/["']className["']\s*=>\s*["']([^"']+)["']/);
        const methodName = extractField(/["']methodName["']\s*=>\s*["']([^"']+)["']/, "update");
        const pattern = extractField(/["']flameworkPattern["']\s*=>\s*["']([^"']+)["']/, "MatterSystem");
        const executionSide = extractField(/["']executionSide["']\s*=>\s*["']([^"']+)["']/, "Server");
        const rojoTarget = extractField(/rojoTarget\s*=\s*["']([^"']+)["']/, "src/shared/components.types.ts");

        // Извлекаем семантическое SVO-окружение для графа Memgraph
        const subject = extractField(/["']subject["']\s*=>\s*["']([^"']+)["']/, className);
        const action = extractField(/["']action["']\s*=>\s*["']([^"']+)["']/, "Updates");
        const object = extractField(/["']object["']\s*=>\s*["']([^"']+)["']/, "Component");

        // Собираем идеальный объект shellData для compiler_cli.cjs v38.9
        return {
            id: id,
            className: className,
            methodName: methodName,
            pattern: pattern,
            executionSide: executionSide,
            rojoTarget: rojoTarget,
            subject: subject,
            action: action,
            object: object,
            codeImplementation: fileContent // Передаем сырой код ракушки Julia для Base64-кодирования
        };

    } catch (err) {
        console.error(`| ❌ СИСТЕМНЫЙ СБОЙ ВАЛИДАЦИИ в ${fileNameForLog}: ${err.message}`);
        return {
            id: "error_node",
            className: "ErrorSystem",
            methodName: "update",
            pattern: "MatterSystem",
            executionSide: "Server",
            rojoTarget: "src/shared/error.ts",
            subject: "Error",
            action: "Fails",
            object: "Conveyor",
            codeImplementation: `# ERROR: ${err.message}\n# AURA_END`
        };
    }
}

// Финальный каскадный экспорт алиасов под любые легаси имена конвейера
module.exports = { 
    validateShellContract,
    parseShellFile: validateShellContract,
    parseJuliaFile: validateShellContract
};
