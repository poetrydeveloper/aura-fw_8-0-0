const fs = require('fs');

/**
 * ⚡ СИСТЕМНЫЙ ВАЛИДАТОР-ПАРСЕР JULIA v38.8 (ИММУННЫЙ КОНТУР-2)
 * Полный скан, изоляция Меты от Мяса, аппаратный контроль структуры.
 */
function parseShellFile(filePath) {
    const sourceText = fs.readFileSync(filePath, 'utf8');
    
    // УРОВЕНЬ ЗАЩИТЫ 1: АППАРАТНЫЙ КОНТРОЛЬ СТРУКТУРЫ
    if (!sourceText.includes("AuraShell(") && !sourceText.includes("AuraComponentPassport(") && !sourceText.includes("AuraModel(")) {
        throw new Error(`[AURA PARSER-2 ERROR] КРИТИЧЕСКИЙ СБОЙ СТРУКТУРЫ в "${filePath}": Отсутствует конструктор манифеста.`);
    }
    
    if (!sourceText.trim().endsWith(")")) {
        throw new Error(`[AURA PARSER-2 ERROR] КРИТИЧЕСКИЙ СБОЙ СТРУКТУРЫ в "${filePath}": Манифест не закрыт финальной скобкой ')'.`);
    }

    const doCount = (sourceText.match(/\bdo\b/g) || []).length;
    const endCount = (sourceText.match(/\bend\b/g) || []).length;
    
    if (sourceText.includes("render = function") && (endCount !== (doCount + 1))) {
        throw new Error(`[AURA PARSER-2 ERROR] РАЗРЫВ СИНТАКСИСА JULIA в "${filePath}": Нарушен баланс блоков. do: ${doCount}, end: ${endCount}.`);
    }

    // УРОВЕНЬ ЗАЩИТЫ 2: ПОЛНЫЙ СКАН С ИЗОЛЯЦИЕЙ МЕТЫ
    const lines = sourceText.split(/\r?\n/);
    let shellData = {
        id: "", pattern: "MatterSystem", className: "", methodName: "update",
        executionSide: "Server", subject: "Unknown", action: "Updates", object: "Component",
        rojoTarget: "",
        codeImplementation: sourceText
    };

    let insideRenderBlock = false;

    for (let i = 0; i < lines.length; i++) {
        let trimmed = lines[i].trim();
        if (trimmed.startsWith("#") || !trimmed) continue;

        if (trimmed.includes("render = function")) insideRenderBlock = true;
        if (insideRenderBlock) continue;

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

        if (trimmed.includes('=>')) {
            let parts = trimmed.split('=>');
            let key = parts[0].trim().replace(/[:"']/g, ""); 
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

    // УРОВЕНЬ ЗАЩИТЫ 3: УМНЫЙ ДИНАМИЧЕСКИЙ FALLBACK
    const fileBaseName = filePath.split(/[\\/]/).pop().replace(/\..*$/, "");
    if (!shellData.className) shellData.className = fileBaseName;
    if (!shellData.methodName || shellData.methodName === "update") {
        const cleanName = shellData.className.replace("System", "");
        shellData.methodName = `update${cleanName}`;
    }

    return shellData;
}

module.exports = { parseShellFile };
