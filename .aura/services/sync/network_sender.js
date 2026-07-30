import { execSync } from 'child_process';

/**
 * 🛰️ СИНХРОННЫЙ БЛОКИРУЮЩИЙ ТРАНСПОРТ v38.8 (УНИЧТОЖИТЕЛЬ ГОНКИ)
 * Останавливает поток выполнения CLI до полного ответа бэкенда.
 */
export function sendPayloadToGateway(payloadObj, fileBaseName) {
    const payloadData = JSON.stringify(payloadObj);
    
    // Экранируем JSON для безопасной передачи через аргументы CLI cURL (защита от поломки кавычек на Windows Bash)
    const escapedPayload = payloadData.replace(/"/g, '\\"');

    // Формируем жесткую, нативную команду cURL для блокирующего выполнения
    const curlCommand = `curl -s -X POST http://localhost:47788/api/sync-shell ` +
                        `-H "Content-Type: application/json" ` +
                        `-d "${escapedPayload}"`;

    try {
        console.log(`| 🔄 ОТПРАВКА ["${fileBaseName}"] ➔ Ожидание завершения транзакции...`);
        
        // Синхронный блокирующий вызов. Поток хоста ждет здесь!
        const responseBuffer = execSync(curlCommand);
        const responseBody = responseBuffer.toString('utf8');
        
        console.log(`| ✔ СИНХРОНИЗАЦИЯ ["${fileBaseName}"] ➔ Успешно обработано. Ответ ядра: ${responseBody}`);
    } catch (err) {
        console.error(`| ❌ КРИТИЧЕСКИЙ СБОЙ СИНХРОННОГО ДЕПЛОЯ для ["${fileBaseName}"]:`, err.stderr ? err.stderr.toString() : err.message);
        // Жестко останавливаем весь конвейер, если транзакция упала, предотвращая порчу последующих файлов
        process.exit(1);
    }
}
