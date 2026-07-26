const fs = require('fs');
const path = require('path');
const http = require('http');

// Точечно нацеливаемся на папку, где лежат твои 6 ракушек
const IMMUTABLE_DIR = path.resolve(__dirname, '.aura/services/shells/immutable');

console.log("=== START AURA UNBREAKABLE BASE64 CONVEYOR v14.6 ===");
console.log(`| TSX Source directory: ${IMMUTABLE_DIR}`);
console.log(`| Direct API Endpoint: http://localhost:5000/api/sync-shell`);

if (!fs.existsSync(IMMUTABLE_DIR)) {
    console.error(`❌ Папка исходных ракушек не найдена по пути: ${IMMUTABLE_DIR}`);
    process.exit(1);
}

function extractMetaField(content, fieldName) {
    const startIdx = content.indexOf(`${fieldName}:`);
    if (startIdx === -1) return "";
    
    const quoteStartIdx = content.indexOf('"', startIdx + fieldName.length + 1);
    const altQuoteStartIdx = content.indexOf("'", startIdx + fieldName.length + 1);
    let finalStart = quoteStartIdx; let quoteChar = '"';
    
    if (altQuoteStartIdx !== -1 && (quoteStartIdx === -1 || altQuoteStartIdx < quoteStartIdx)) {
        finalStart = altQuoteStartIdx; quoteChar = "'";
    }
    if (finalStart === -1) return "";
    const finalEnd = content.indexOf(quoteChar, finalStart + 1);
    if (finalEnd === -1) return "";
    return content.substring(finalStart + 1, finalEnd).trim();
}

function sendPayloadToGateway(payloadObj, fileBaseName) {
    const payloadData = JSON.stringify(payloadObj);
    const options = {
        hostname: 'localhost',
        port: 5000, // Бьем напрямую в Express
        path: '/api/sync-shell',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payloadData) }
    };

    const req = http.request(options, (res) => {
        let resBody = '';
        res.on('data', (chunk) => resBody += chunk);
        res.on('end', () => {
            console.log(`| ✔ СИНХРОНИЗАЦИЯ ["${fileBaseName}"] ➔ Статус: ${res.statusCode} | Ответ: ${resBody}`);
        });
    });

    req.on('error', (err) => {
        console.error(`| ❌ СБОЙ СЕТИ на порту 5000 для ["${fileBaseName}"]:`, err.message);
    });
    req.write(payloadData);
    req.end();
}

const sourceFiles = fs.readdirSync(IMMUTABLE_DIR).filter(file => file.endsWith('.tsx'));
console.log(`| Обнаружено иммутабельных ракушек для сканирования: ${sourceFiles.length} шт.`);

sourceFiles.forEach(file => {
    const srcFilePath = path.join(IMMUTABLE_DIR, file);
    const rawContent = fs.readFileSync(srcFilePath, 'utf8');
    const fileBaseName = path.basename(file, '.tsx');
    
    try {
        const id = extractMetaField(rawContent, 'id');
        const pattern = extractMetaField(rawContent, 'flameworkPattern');
        if (!id) throw new Error("В TSX структуре ракушки не обнаружен обязательный параметр ID!");

        const semanticSvo = {
            subject: extractMetaField(rawContent, 'className') || fileBaseName,
            verb: "Updates", object: "CFrameComponent",
            className: extractMetaField(rawContent, 'className') || fileBaseName,
            flameworkPattern: pattern || "MatterSystem",
            methodName: extractMetaField(rawContent, 'methodName') || "update",
            executionSide: extractMetaField(rawContent, 'executionSide') || "Server",
            outputType: "void"
        };

        let cleanCodeImplementation = "";
        const renderIndex = rawContent.indexOf('return (');
        if (renderIndex !== -1) {
            cleanCodeImplementation = rawContent.substring(renderIndex + 'return ('.length, rawContent.lastIndexOf(');'));
        } else {
            const compStart = rawContent.indexOf('render()');
            if (compStart !== -1) {
                cleanCodeImplementation = rawContent.substring(rawContent.indexOf('{', compStart) + 1, rawContent.lastIndexOf('}'));
            }
        }

        const base64Payload = {
            shell_id: id,
            meta_semantic: Buffer.from(JSON.stringify(semanticSvo)).toString('base64'),
            payload_code_b64: Buffer.from(cleanCodeImplementation.trim()).toString('base64')
        };

        sendPayloadToGateway(base64Payload, fileBaseName);
    } catch (e) {
        console.error(`| ❌ ОШИБКА ПАРСИНГА в исходнике [${file}]: ${e.message}`);
    }
});
console.log("=========================================================");
