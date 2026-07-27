const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, 'nitka.log');

console.log("=== START AURA NITKA LOG COGNITIVE SCANNER v1.0 ===");

if (!fs.existsSync(LOG_PATH)) {
    console.error(`❌ ОШИБКА: Файл журнала не найден по адресу: ${LOG_PATH}`);
    process.exit(1);
}

const logText = fs.readFileSync(LOG_PATH, 'utf8');
const lines = logText.split(/\r?\n/);

let totalIssues = 0;

lines.forEach((line, index) => {
    if (!line.trim()) return;

    let hasIssue = false;
    let reasons = [];

    // 1. Ищем висячие закрывающие круглые скобки внутри сгенерированных полей объектов
    if (line.includes('[STITCH-600]') && line.includes(')}')) {
        hasIssue = true;
        reasons.push("Обнаружена висячая круглая скобка ')' внутри объекта мутации Mutate!");
    }

    // 2. Ищем знаки равенства '=' там, где в TypeScript объектах должны быть двоеточия ':'
    if (line.includes('[STITCH-600]') && line.includes('=')) {
        hasIssue = true;
        reasons.push("Обнаружен недопустимый знак '=' вместо ':' внутри полей мутации Mutate!");
    }

    // 3. Ищем пустые дыры в гвардах (когда оператор сравнения остался без значения)
    if (line.includes('[STITCH-400]') && (line.includes('== )') || line.includes('!= )') || line.includes('!== )') || line.endsWith(')'))) {
        // Дополнительная проверка на пустой хвост оператора
        if (line.match(/(?:==|!=|!==)\s*\)/)) {
            hasIssue = true;
            reasons.push("Критическая пустота (отсутствует значение) внутри условия Guard!");
        }
    }

    // Если аномалия найдена — выводим рапорт
    if (hasIssue) {
        totalIssues++;
        console.log(`\n🚨 [АНOМАЛИЯ №${totalIssues}] Строка журнала: ${index + 1}`);
        console.log(`| LOG: ${line}`);
        reasons.forEach(r => console.log(`| -> РЕШЕНИЕ: ${r}`));
    }
});

console.log("\n=========================================================");
if (totalIssues === 0) {
    console.log("💚 СКАНИРОВАНИЕ ЗАВЕРШЕНО: Семантических ошибок в nitka.log не обнаружено!");
} else {
    console.log(`🛑 СКАНИРОВАНИЕ ЗАВЕРШЕНО: Обнаружено аномалий: ${totalIssues} шт. Требуется калибровка парсера.`);
}
console.log("=========================================================");
