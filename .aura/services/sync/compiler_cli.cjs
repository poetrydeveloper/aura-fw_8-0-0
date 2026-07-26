// .aura/services/sync/compiler_cli.cjs
const fs = require('fs');
const path = require('path');

const IMMUTABLE_DIR = path.resolve(__dirname, '../shells/immutable');

console.log("=== START AURA UNBREAKABLE BASE64 CONVEYOR v15.0 ===");
console.log(`| TSX Source directory: ${IMMUTABLE_DIR}`);
console.log(`| Target Nginx API Gateway: http://localhost:47788/api/sync-shell`);

if (!fs.existsSync(IMMUTABLE_DIR)) {
    console.error(`❌ Критическая ошибка: Папка исходных ракушек не найдена: ${IMMUTABLE_DIR}`);
    process.exit(1);
}

// Асинхронный запуск рантайма для бесшовной интеграции CommonJS с ESM
(async () => {
    try {
        // Динамический импорт соседних .js файлов в области видимости Node.js
        const { parseShellFile } = await import('./shell_parser2.js');
        const { sendPayloadToGateway } = await import('./network_sender.js');

        // ВСЕЯДНЫЙ ФИЛЬТР: Сканируем и .tsx, и .ts файлы ракушек Галактики!
        const sourceFiles = fs.readdirSync(IMMUTABLE_DIR).filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));
        console.log(`| Обнаружено иммутабельных ракушек для сканирования: ${sourceFiles.length} шт.`);

        sourceFiles.forEach(file => {
            const srcFilePath = path.join(IMMUTABLE_DIR, file);
            const fileBaseName = file.replace(/\.tsx?$/, ''); // Универсальный срез расширения
            
            try {
                const shellData = parseShellFile(srcFilePath);
                
                if (!shellData.id) throw new Error("В TSX структуре ракушки не обнаружен обязательный параметр ID!");
                if (!shellData.codeImplementation) throw new Error("Метод render() пуст или поврежден.");

                const semanticSvo = {
                    subject: shellData.subject || shellData.className || fileBaseName,
                    verb: shellData.action || "Updates",
                    object: shellData.object || "Component",
                    className: shellData.className || fileBaseName,
                    flameworkPattern: shellData.pattern,
                    methodName: shellData.methodName,
                    executionSide: shellData.executionSide,
                    rojoTarget: shellData.rojoTarget, // <=== ШАГ 2: Инжектируем рекомендованный Rojo-путь в метаданные сетевого пакета
                    outputType: "void"
                };

                const base64Payload = {
                    shell_id: shellData.id,
                    meta_semantic: Buffer.from(JSON.stringify(semanticSvo)).toString('base64'),
                    payload_code_b64: Buffer.from(shellData.codeImplementation).toString('base64')
                };

                sendPayloadToGateway(base64Payload, fileBaseName);
            } catch (e) {
                console.error(`| ❌ ОШИБКА АНАЛИЗА в исходнике [${file}]: ${e.message}`);
            }
        });
        console.log("=========================================================");
    } catch (globalErr) {
        console.error("❌ Критический сбой инициализации модулей хоста:", globalErr.message);
    }
})();
