import http from 'http';

/**
 * 🛰️ ИЗОЛИРОВАННЫЙ СЕТЕВОЙ ТРАНСПОРТ
 * Стреляет строго в безопасный верхний порт шлюза Nginx AURA_7 (47788)
 */
export function sendPayloadToGateway(payloadObj, fileBaseName) {
    const payloadData = JSON.stringify(payloadObj);
    const options = {
        hostname: 'localhost',
        port: 47788,
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
        console.error(`| ❌ СБОЙ СЕТИ на шлюзе 47788 для ракушки ["${fileBaseName}"]:`, err.message);
    });

    req.write(payloadData);
    req.end();
}
