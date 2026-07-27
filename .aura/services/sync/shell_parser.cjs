const fs = require('fs');

/**
 * ⚡ ДЕТЕРМИНИРОВАННЫЙ СЕМАНТИЧЕСКИЙ ПАРСЕР JULIA v20.0
 * Снайперски вытаскивает метаданные как из плоских объявлений (id = "..."),
 * так и из вложенных словарей Джулии ("className" => "...") в шапке файла.
 */
function parseShellFile(filePath) {
    const sourceText = fs.readFileSync(filePath, 'utf8');
    const lines = sourceText.split(/\r?\n/);

    let shellData = {
        id: "", pattern: "MatterSystem", className: "", methodName: "update",
        executionSide: "Server", subject: "Unknown", action: "Updates", object: "Component",
        rojoTarget: "",
        codeImplementation: sourceText // Файл в базу летит целиком
    };

    // Сканируем строго шапку манифеста (первые 35 строк, где лежат метаданные и словари)
    const scanLimit = Math.min(lines.length, 35);
    
    for (let i = 0; i < scanLimit; i++) {
        let trimmed = lines[i].trim();
        if (trimmed.startsWith("#") || !trimmed) continue;

        // Паттерн 1: Плоское объявление Julia (id = "...")
        if (trimmed.includes('=')) {
            let parts = trimmed.split('=');
            let key = parts[0].trim();
            let val = parts.slice(1).join('=').trim().replace(/^["']|["']\s*,?$/g, '').trim();

            if (key === "id") shellData.id = val;
            if (key === "flameworkPattern") shellData.pattern = val;
            if (key === "className") shellData.className = val;
            if (key === "methodName") shellData.methodName = val;
            if (key === "executionSide") shellData.executionSide = val;
            if (key === "rojoTarget") shellData.rojoTarget = val;
        }

        // Паттерн 2: Вложенный словарь Джулии ("className" => "..." или :className => "...")
        if (trimmed.includes('=>')) {
            let parts = trimmed.split('=>');
            let key = parts[0].trim().replace(/[:"']/g, ""); // Очищаем ключ от двоеточий и кавычек
            let val = parts.slice(1).join('=>').trim().replace(/^["']|["']\s*,?$/g, '').trim();

            if (key === "id") shellData.id = val;
            if (key === "flameworkPattern" || key === "pattern") shellData.pattern = val;
            if (key === "className") shellData.className = val;
            if (key === "methodName") shellData.methodName = val;
            if (key === "executionSide") shellData.executionSide = val;
            if (key === "rojoTarget") shellData.rojoTarget = val;
            if (key === "subject") shellData.subject = val;
            if (key === "action") shellData.action = val;
            if (key === "object") shellData.object = val;
        }
    }

    // Финальный железный контроль: если ИИ-Исполнитель забыл прописать поля, 
    // восстанавливаем их по имени файла, исключая коллизии!
    const fileBaseName = filePath.split(/[\\/]/).pop().replace(/\..*$/, "");
    if (!shellData.className || shellData.className === "MovementSystem") {
        if (fileBaseName.includes("Collision")) shellData.className = "CollisionSystem";
        if (fileBaseName.includes("Cleaner")) shellData.className = "CleanerSystem";
        if (fileBaseName.includes("Input")) shellData.className = "InputSystem";
        if (fileBaseName.includes("Weapon")) shellData.className = "WeaponTimerSystem";
        if (fileBaseName.includes("components")) shellData.className = "GalaxyComponents";
    }

    if (!shellData.methodName || shellData.methodName === "update") {
        if (shellData.className === "MovementSystem") shellData.methodName = "updateMovement";
        if (shellData.className === "CollisionSystem") shellData.methodName = "checkCollisions";
        if (shellData.className === "CleanerSystem") shellData.methodName = "cleanOutOfBounds";
        if (shellData.className === "WeaponTimerSystem") shellData.methodName = "updateWeaponCooldowns";
        if (shellData.className === "InputSystem") shellData.methodName = "handleInput";
    }

    return shellData;
}

module.exports = { parseShellFile };
