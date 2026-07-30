const fs = require('fs');
const path = require('path');
const { sendPayloadToGateway } = require('./network_sender.js');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const CONFIG_PATH = path.join(__dirname, 'aura_build_config.json');

console.log("=== START AURA UNBREAKABLE CONFIGURABLE CONVEYOR v38.9 (BLOCKING MODE) ===");

// 1. УРОВЕНЬ ЗАЩИТЫ: Проверка и чтение внешнего файла конфигурации
if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`| ❌ КРИТИЧЕСКАЯ ОШИБКА: Файл конфигурации сборщика не найден: ${CONFIG_PATH}`);
    process.exit(1);
}

let config;
try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (err) {
    console.error(`| ❌ КРИТИЧЕСКАЯ ОШИБКА: Ошибка чтения JSON в aura_build_config.json:`, err.message);
    process.exit(1);
}

// Извлекаем динамические параметры рантайма из конфигуратора
const SHELLS_DIR = path.isAbsolute(config.active_shells_dir) 
    ? config.active_shells_dir 
    : path.resolve(__dirname, '../../..', config.active_shells_dir);

const PARSER_MODULE_PATH = config.active_parser_module;

console.log(`| Динамический контур ракушек: ${SHELLS_DIR}`);
console.log(`| Подключенный модуль парсера: ${PARSER_MODULE_PATH}`);

if (!fs.existsSync(SHELLS_DIR)) {
    console.error(`| ❌ КРИТИЧЕСКАЯ ОШИБКА: Директория ракушек не найдена: ${SHELLS_DIR}`);
    process.exit(1);
}

// 2. УРОВЕНЬ ЗАЩИТЫ: Динамическое безопасное подключение парсера (например, shell_parser-2.cjs)
let parseShellFile;
try {
    const parserModule = require(PARSER_MODULE_PATH);
    parseShellFile = parserModule.parseShellFile;
    if (!parseShellFile) throw new Error("Функция parseShellFile не экспортирована из модуля.");
} catch (err) {
    console.error(`| ❌ КРИТИЧЕСКАЯ ОШИБКА: Не удалось загрузить модуль парсера [${PARSER_MODULE_PATH}]:`, err.message);
    process.exit(1);
}

// Сканируем целевую директорию на наличие иммутабельных ДНК-файлов
const allFiles = fs.readdirSync(SHELLS_DIR);
const juliaFiles = allFiles.filter(file => file.endsWith('.jl'));

console.log(`| Обнаружено ракушек для синхронизации: ${juliaFiles.length} шт.`);
console.log("=========================================================");

// 3. УРОВЕНЬ ЗАЩИТЫ: Синхронный последовательный конвейер. Гонка исключена намертво.
for (const file of juliaFiles) {
    const fullPath = path.join(SHELLS_DIR, file);
    const fileBaseName = path.basename(file, '.jl');
    
    try {
        // Запускаем полный скан кода и валидацию структуры синтаксиса Julia внутри парсера
        const shellData = parseShellFile(fullPath);
        
        // Кодируем в Base64 сырой текст Julia-логики ракушки
        const rawCodeText = shellData.codeImplementation;
        const base64CodeMonolith = Buffer.from(rawCodeText, 'utf8').toString('base64');
        
        // Упаковываем метаданные в JSON, а затем ТОЖЕ жестко кодируем в Base64 для защиты от ломаных кавычек
        const semanticMetaObj = {
            className: String(shellData.className),
            methodName: String(shellData.methodName),
            flameworkPattern: String(shellData.pattern),
            executionSide: String(shellData.executionSide),
            rojoTarget: String(shellData.rojoTarget),
            subject: String(shellData.subject),
            action: String(shellData.action),
            object: String(shellData.object)
        };
        const base64SemanticMonolith = Buffer.from(JSON.stringify(semanticMetaObj), 'utf8').toString('base64');
        
        // Сборка бронированного сетевого пакета
        const alignedPayload = {
            shell_id: String(shellData.id),
            payload_code_b64: String(base64CodeMonolith),
            meta_semantic: String(base64SemanticMonolith)
        };
        
        // Вызов ТРАНСПОРТА. Так как он блокирующий (execSync), цикл замирает
        // и ждет, пока Docker-контейнер не вернет 100% ответ об успешной компиляции.
        sendPayloadToGateway(alignedPayload, fileBaseName);
        
    } catch (error) {
        console.error(`| ❌ ОШИБКА ДЕПЛОЯ в ракушке [${file}]:`, error.message);
        // При аппаратном сбое или нарушении баланса скобок прерываем всю сборку,
        // чтобы не развалить итоговый проект в Roblox Studio смешанными версиями.
        process.exit(1);
    }
}

console.log("=========================================================");
console.log("🔥 [AURA CONVEYOR COMPLETE] Все ракушки успешно и детерминировано синхронизированы!");
