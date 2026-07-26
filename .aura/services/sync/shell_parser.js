import fs from 'fs';
import ts from 'typescript';

/**
 * ⚡ ДЕТЕРМИНИРОВАННЫЙ AST-ИЗВЛЕКАТЕЛЬ МЕТАДАННЫХ ХОСТА v16.6
 * Полностью исключает регулярные выражения. Забирает тело метода render
 * строго по границам нод TypeScript AST, защищая код от обрезания.
 */
export function parseShellFile(filePath) {
    const sourceText = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    let shellData = {
        id: "", pattern: "MatterSystem", className: "", methodName: "update",
        executionSide: "Server", subject: "", action: "Updates", object: "Component",
        rojoTarget: "",
        codeImplementation: ""
    };

    function transformer(node) {
        if (ts.isPropertyAssignment(node) && node.name) {
            const parentObject = node.parent;
            const isRootConfig = parentObject && ts.isObjectLiteralExpression(parentObject) && 
                                 (parentObject.parent?.kind === ts.SyntaxKind.CallExpression || 
                                  parentObject.parent?.parent?.kind === ts.SyntaxKind.CallExpression);

            if (isRootConfig) {
                const name = node.name.getText(sourceFile).trim();
                const valueNode = node.initializer;
                
                let cleanVal = valueNode.getText(sourceFile);
                if (ts.isStringLiteral(valueNode)) {
                    cleanVal = valueNode.text;
                } else {
                    cleanVal = cleanVal.replace(/['"\s,]/g, '');
                }

                if (name === 'id') shellData.id = cleanVal;
                if (name === 'flameworkPattern') shellData.pattern = cleanVal;
                if (name === 'className') shellData.className = cleanVal;
                if (name === 'methodName') shellData.methodName = cleanVal;
                if (name === 'executionSide') shellData.executionSide = cleanVal;
                if (name === 'subject') shellData.subject = cleanVal;
                if (name === 'action') shellData.action = cleanVal;
                if (name === 'object') shellData.object = cleanVal;
                if (name === 'rojoTarget') shellData.rojoTarget = cleanVal;
            }
        }

        // ЧЕСТНЫЙ ИЗВЛЕКАТЕЛЬ МЕТОДА RENDER ЧЕРЕЗ AST НОДЫ
        if (ts.isMethodDeclaration(node) && node.name.getText(sourceFile) === 'render') {
            if (node.body) {
                // Если паттерн компонент - забираем внутренности блока {}
                if (shellData.pattern === 'Component' || filePath.includes('components')) {
                    const bodyText = node.body.getText(sourceFile);
                    shellData.codeImplementation = bodyText.substring(1, bodyText.length - 1).trim();
                } else {
                    // Для ECS-систем логики: ищем ноду ParenthesizedExpression (круглые скобки ретерна)
                    // или JsxElement / JsxSelfClosingElement напрямую внутри блока return
                    let foundJsxText = "";
                    
                    node.body.forEachChild((statement) => {
                        if (ts.isReturnStatement(statement) && statement.expression) {
                            let expr = statement.expression;
                            // Если код обернут в круглые скобки return (...); спускаемся внутрь них
                            if (ts.isParenthesizedExpression(expr)) {
                                expr = expr.expression;
                            }
                            foundJsxText = expr.getText(sourceFile).trim();
                        }
                    });

                    // Если нашли честный JSX-узел компилятора - берем его текст целиком без срезов регулярками!
                    if (foundJsxText) {
                        shellData.codeImplementation = foundJsxText;
                    } else {
                        // Резервный фолбэк, если ИИ написал плоский ретерн
                        const bodyText = node.body.getText(sourceFile);
                        shellData.codeImplementation = bodyText.substring(1, bodyText.length - 1).trim();
                    }
                }
            }
        }
        ts.forEachChild(node, transformer);
    }

    transformer(sourceFile);
    return shellData;
}