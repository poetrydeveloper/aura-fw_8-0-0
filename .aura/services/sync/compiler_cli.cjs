const fs = require('fs');
const path = require('path');
const { parseShellFile } = require('./shell_parser.cjs');
const { sendPayloadToGateway } = require('./network_sender.js');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const SHELLS_DIR = path.join(PROJECT_ROOT, '.aura/services/shells/immutable');

console.log("=== START AURA UNBREAKABLE BASE64 CONVEYOR v18.5 (DOUBLE B64 MODE) ===");
console.log(`| Julia Source directory: ${SHELLS_DIR}`);

if (!fs.existsSync(SHELLS_DIR)) {
    console.error(`| ❌ КРИТИЧЕСКАЯ ОШИБКА: Директория не найдена: ${SHELLS_DIR}`);
    process.exit(1);
}

const allFiles = fs.readdirSync(SHELLS_DIR);
const juliaFiles = allFiles.filter(file => file.endsWith('.jl'));

console.log(`| Обнаружено иммутабельных ракушек для сканирования: ${juliaFiles.length} шт.`);
console.log("=========================================================");

for (const file of juliaFiles) {
    const fullPath = path.join(SHELLS_DIR, file);
    const fileBaseName = path.basename(file, '.jl');
    
    try {
        const shellData = parseShellFile(fullPath);
        
        // 1. Кодируем в Base64 сырой текст Julia-логики ракушки
        const rawCodeText = shellData.codeImplementation;
        const base64CodeMonolith = Buffer.from(rawCodeText, 'utf8').toString('base64');
        
        // 2. Упаковываем метаданные в JSON, а затем ТОЖЕ жестко кодируем в Base64 для роутера!
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
        
        // СБОРКА СЕТЕВОГО ПАКЕТА В ИДЕАЛЬНОМ КАНOНЕ СЕРВЕРА
        const alignedPayload = {
            shell_id: String(shellData.id),
            payload_code_b64: String(base64CodeMonolith),
            meta_semantic: String(base64SemanticMonolith) // <=== ТЕПЕРЬ СТРОГО СТРОКА BASE64!
        };
        
        sendPayloadToGateway(alignedPayload, fileBaseName);
        
    } catch (error) {
        console.error(`| ❌ ОШИБКА АНАЛИЗА в исходнике [${file}]:`, error.message);
    }
}
