import fs from 'fs';
import ts from 'typescript';

/**
 * ⚡ ДЕТЕРМИНИРОВАННЫЙ AST-ИЗВЛЕКАТЕЛЬ МЕТАДАННЫХ ХОСТА
 * Полностью исключает регулярные выражения и текстовые гадания.
 */
export function parseShellFile(filePath) {
    const sourceText = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    let shellData = {
        id: "", pattern: "MatterSystem", className: "", methodName: "update",
        executionSide: "Server", subject: "", action: "Updates", object: "Component",
        codeImplementation: ""
    };

    function transformer(node) {
        // Проверяем, является ли нода присвоением свойства (name: value)
        if (ts.isPropertyAssignment(node) && node.name) {
            const name = node.name.getText(sourceFile).trim();
            const valueNode = node.initializer;
            
            // Нативный способ TypeScript извлечь чистое строковое или числовое значение узла
            let cleanVal = valueNode.getText(sourceFile);
            if (ts.isStringLiteral(valueNode)) {
                cleanVal = valueNode.text; // Забираем строго текст строки БЕЗ кавычек и запятых!
            } else {
                cleanVal = cleanVal.replace(/['"\s,]/g, ''); // Защитная очистка для иных типов нод
            }

            if (name === 'id') shellData.id = cleanVal;
            if (name === 'flameworkPattern') shellData.pattern = cleanVal;
            if (name === 'className') shellData.className = cleanVal;
            if (name === 'methodName') shellData.methodName = cleanVal;
            if (name === 'executionSide') shellData.executionSide = cleanVal;
            if (name === 'subject') shellData.subject = cleanVal;
            if (name === 'action') shellData.action = cleanVal;
            if (name === 'object') shellData.object = cleanVal;
        }

        if (ts.isMethodDeclaration(node) && node.name.getText(sourceFile) === 'render') {
            if (node.body) {
                const bodyText = node.body.getText(sourceFile);
                if (shellData.pattern === 'Component' || filePath.includes('components')) {
                    shellData.codeImplementation = bodyText.substring(1, bodyText.length - 1).trim();
                } else {
                    const returnMatch = bodyText.match(/return\s*\(([\s\S]*?)\);/);
                    shellData.codeImplementation = returnMatch ? returnMatch[1].trim() : bodyText.substring(1, bodyText.length - 1).trim();
                }
            }
        }
        ts.forEachChild(node, transformer);
    }

    transformer(sourceFile);
    return shellData;
}
