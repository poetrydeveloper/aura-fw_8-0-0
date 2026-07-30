const fs = require('fs');
const path = require('path');

// 🔥 ФИКС ПУТИ: Направляем сканер хоста строго в общую смонтированную директорию dist/
// Теперь хост Windows без проблем прочитает логи, сгенерированные Docker-контейнером!
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const LOG_PATH = path.join(PROJECT_ROOT, '.aura/services/core/dist/nitka.log');

console.log("=== START AURA NITKA LOG COGNITIVE SCANNER v38.9 (DIST CONTROLS) ===");
console.log(`| Ожидание логов по адресу: ${LOG_PATH}`);

if (!fs.existsSync(LOG_PATH)) {
    console.error(`❌ ОШИБКА: Файл журнала еще не сгенерирован Docker-контейнером. Запустите сначала компиляцию ракушек.`);
    process.exit(1);
}

const logText = fs.readFileSync(LOG_PATH, 'utf8');
const lines = logText.split(/\r?\n/);

let totalIssues = 0;

lines.forEach((line, index) => {
    if (!line.trim()) return;

    let hasIssue = false;
    let reasons = [];

    // 1. Контроль висячих скобок мутаций
    if (line.includes('[STITCH-600]') && line.includes(')}')) {
        hasIssue = true;
        reasons.push("Обнаружена висячая круглая скобка ')' внутри объекта мутации Mutate!");
    }

    // 2. Контроль пролазания знаков равенства в объекты TypeScript
    if (line.includes('[STITCH-600]') && line.includes('=')) {
        hasIssue = true;
        reasons.push("Обнаружен недопустимый знак '=' вместо ':' внутри полей мутации Mutate!");
    }

    // 3. Контроль пустых гвардов
    if (line.includes('[STITCH-400]')) {
        // Улучшенный строгий regex-контроль, исключающий ложные срабатывания на штатные скобки
        if (line.match(/(?:==|!=|!==)\s*\)/)) {
            hasIssue = true;
            reasons.push("Критическая пустота (отсутствует значение сравнения) внутри условия Guard!");
        }
    }

    // Рапорт об аномалии
    if (hasIssue) {
        totalIssues++;
        console.log(`\n🚨 [АНOМАЛИЯ №${totalIssues}] Строка журнала: ${index + 1}`);
        console.log(`| LOG: ${line}`);
        reasons.forEach(r => console.log(`| -> РЕШЕНИЕ: ${r}`));
    }
});

console.log("\n=========================================================");
if (totalIssues === 0) {
    console.log("💚 СКАНИРОВАНИЕ ЗАВЕРШЕНО: Семантических ошибок в nitka.log не обнаружено! Код идеален.");
} else {
    console.log(`🛑 СКАНИРОВАНИЕ ЗАВЕРШЕНО: Обнаружено аномалий: ${totalIssues} шт. Требуется калибровка парсера.`);
}
console.log("=========================================================");
