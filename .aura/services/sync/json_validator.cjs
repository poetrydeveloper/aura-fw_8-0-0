// .aura/services/sync/json_validator.cjs
const fs = require('fs');
const path = require('path');

const TARGET_JSON_PATH = path.join(__dirname, 'manifest', 'rules_matrix.json');

console.log("=== ЗАПУСК СНАЙПЕРСКОГО ИНСПЕКТОРА JSON СИНТАКСИСА АУРА-8 ===");
console.log(`| Целевой файл: ${TARGET_JSON_PATH}`);

if (!fs.existsSync(TARGET_JSON_PATH)) {
    console.error(`| ❌ КРИТИЧЕСКАЯ ОШИБКА: Файл не обнаружен! Проверьте путь.`);
    process.exit(1);
}

const rawText = fs.readFileSync(TARGET_JSON_PATH, 'utf8');

try {
    // Пробуем нативно распарсить матрицу правил
    JSON.parse(rawText);
    console.log("=========================================================");
    console.log("🟢 СТАТУС: JSON ИДЕАЛЕН! Синтаксис чист. Все скобки и запятые сошлись.");
    console.log("=========================================================");
} catch (err) {
    console.error("=========================================================");
    console.error("❌ ОБНАРУЖЕН СИНТАКСИЧЕСКИЙ РАЗРЫВ В JSON-МАТРИЦЕ ПРАВИЛ!");
    console.error(`| Ошибка: ${err.message}`);
    
    // Интеллектуальный лексический парсер позиции ошибки
    const match = err.message.match(/at position (\d+)/);
    if (match) {
        const pos = parseInt(match[1], 10);
        
        // Вычисляем точную строку и колонку в файле
        let lineNum = 1;
        let colNum = 1;
        let currentPos = 0;
        const lines = rawText.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i].length + 1; // +1 для учета символа переноса строки
            if (currentPos + lineLength > pos) {
                lineNum = i + 1;
                colNum = pos - currentPos + 1;
                break;
            }
            currentPos += lineLength;
        }
        
        console.error(`| Локализация: Строка ${lineNum}, Колонка ${colNum}`);
        console.error("---------------------------------------------------------");
        
        // Выводим срез проблемного участка кода для визуального анализа
        const startLine = Math.max(0, lineNum - 3);
        const endLine = Math.min(lines.length, lineNum + 2);
        
        for (let i = startLine; i < endLine; i++) {
            const currentLineNum = i + 1;
            const marker = (currentLineNum === lineNum) ? " ----> " : "       ";
            console.error(`${marker}[${String(currentLineNum).padStart(3, '0')}] ${lines[i].trimRight()}`);
            
            // Рисуем указатель точного символа под битой строкой
            if (currentLineNum === lineNum) {
                const padding = " ".repeat(colNum + 12); // Учитываем префикс строки
                console.error(`${padding}^--- ЗДЕСЬ СЛОМАЛСЯ СИНТАКСИС`);
            }
        }
    }
    console.error("=========================================================");
    process.exit(1);
}