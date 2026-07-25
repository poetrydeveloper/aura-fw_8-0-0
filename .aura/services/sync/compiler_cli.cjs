// .aura/services/sync/compiler_cli.cjs
const fs = require('fs');
const path = require('path');
const http = require('http');

// Конфигурация путей на основе твоей выровненной монорепозиторной структуры AURA_7
const IMMUTABLE_DIR = path.resolve(__dirname, '../shells/immutable');

console.log("=== START AURA UNBREAKABLE BASE64 CONVEYOR v14.6 ===");
console.log(`| TSX Source directory: ${IMMUTABLE_DIR}`);
console.log(`| Target Nginx API Gateway: http://localhost:7788/api/sync-shell`);

if (!fs.existsSync(IMMUTABLE_DIR)) {
    console.error(`❌ Критическая ошибка: Папка исходных ракушек не найдена: ${IMMUTABLE_DIR}`);
    process.exit(1);
}

/**
 * 🕵️‍♂️ ПАРСЕР ПОЛЕЙ ТЕКСТОВОГО ПРЕДСТАВЛЕНИЯ TSX (Сохранено и оптимизировано из v7.1)
 * Извлекает конфигурационные параметры объекта без раздувания кода сторонними парсерами.
 */
function extractMetaField(content, fieldName, isArray = false) {
    // Регулярное выражение игнорирует любые переносы строк, табы и пробелы вокруг двоеточия
    const regex = isArray 
        ? new RegExp(`${fieldName}\\s*:\\s*\\[([\\s\\S]*?)\\]`)
        : new RegExp(`${fieldName}\\s*:\\s*["']([^"']+)["']`);
    const match = content.match(regex);
    if (!match) return isArray ? [] : "";
    
    if (isArray) {
        return match[1].split(',').map(s => s.replace(/["'\s]/g, "")).filter(s => s.length > 0);
    }
    return match[1].trim();
}


/**
 * Функция отправки изолированного Base64-пакета через Nginx шлюз в Docker
 */
function sendPayloadToGateway(payloadObj, fileBaseName) {
    const payloadData = JSON.stringify(payloadObj);

    const options = {
        hostname: 'localhost',
        port: 7788, // Наш уникальный порт внешнего шлюза Nginx
        path: '/api/sync-shell',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payloadData)
        }
    };

    const req = http.request(options, (res) => {
        let resBody = '';
        res.on('data', (chunk) => resBody += chunk);
        res.on('end', () => {
            console.log(`| ✔ СИНХРОНИЗАЦИЯ ["${fileBaseName}"] ➔ Статус шлюза: ${res.statusCode} | Ответ: ${resBody}`);
        });
    });

    req.on('error', (err) => {
        console.error(`| ❌ СБОЙ СЕТИ при отправке ракушки ["${fileBaseName}"]:`, err.message);
    });

    req.write(payloadData);
    req.end();
}

// Считываем чистые иммутабельные TSX-исходники, написанные ИИ-Архитектором
const sourceFiles = fs.readdirSync(IMMUTABLE_DIR).filter(file => file.endsWith('.tsx'));
console.log(`| Обнаружено иммутабельных ракушек для сканирования: ${sourceFiles.length} шт.`);

sourceFiles.forEach(file => {
    const srcFilePath = path.join(IMMUTABLE_DIR, file);
    const rawContent = fs.readFileSync(srcFilePath, 'utf8');
    const fileBaseName = path.basename(file, '.tsx');
    
    try {
        // Детерминированный сбор мета-данных и адресности ракушки из TSX структуры
        const id = extractMetaField(rawContent, 'id');
        const pattern = extractMetaField(rawContent, 'flameworkPattern');
        
        if (!id) throw new Error("В TSX структуре ракушки не обнаружен обязательный параметр ID!");

        // Собираем семантический паспорт SVO для Memgraph
        const semanticSvo = {
            subject: extractMetaField(rawContent, 'subject') || fileBaseName,
            verb: extractMetaField(rawContent, 'action') || "Updates", // Маппим action на verb для графа
            object: extractMetaField(rawContent, 'object') || "Component"
        };

        let cleanCodeImplementation = "";

        // СОХРАНЕННАЯ ФИЧА: Полиморфное ветвление для слоя типов Component
        if (pattern === 'Component' || fileBaseName.includes('components')) {
            const codeStart = rawContent.indexOf('render(');
            if (codeStart > -1) {
                // Вырезаем внутренности метода render целиком для слоя типов (AS IS)
                cleanCodeImplementation = rawContent.substring(rawContent.indexOf('{', codeStart) + 1, rawContent.lastIndexOf('}'));
            }
        } else {
            // Для классических систем логики вырезаем чистое JSX-мясо из блока return ( ... );
            const renderIndex = rawContent.indexOf('return (');
            if (renderIndex > -1) {
                cleanCodeImplementation = rawContent.substring(renderIndex + 'return ('.length, rawContent.lastIndexOf(');'));
            }
        }

        if (!cleanCodeImplementation.trim()) {
            throw new Error("Метод render() или блок return() пуст или поврежден.");
        }

        // ПУЛЕНЕПРОБИВАЕМЫЙ ТРАНСПОРТ: Кодируем семантику и код в Base64 прямо в памяти хоста
        const base64Payload = {
            shell_id: id,
            meta_semantic: Buffer.from(JSON.stringify(semanticSvo)).toString('base64'),
            payload_code_b64: Buffer.from(cleanCodeImplementation.trim()).toString('base64')
        };

        // Стреляем пакетом в шлюз
        sendPayloadToGateway(base64Payload, fileBaseName);

    } catch (e) {
        console.error(`| ❌ ОШИБКА ПАРСИНГА в исходнике [${file}]: ${e.message}`);
    }
});

console.log("=========================================================");
