import fs from 'fs';
import ts from 'typescript';

/**
 * ⚡ СЕМАНТИЧЕСКИЙ AST-ИЗВЛЕКАТЕЛЬ МЕТАДАННЫХ v16.9
 * Нативно разделяет логику: для систем логики забирает мясо render(),
 * а для паспорта компонентов (Component) — забирает ВЕСЬ внутренний объект данных.
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

        // ПУЛЕНЕПРОБИВАЕМЫЙ СБОР КРOМЕШНЫХ ДАННЫХ КОМПОНЕНТОВ
        if (ts.isCallExpression(node)) {
            const funcName = node.expression.getText(sourceFile).trim();
            // Если мы парсим паспорт компонентов, высасываем весь объект конфигурации целиком!
            if (funcName === 'AuraComponentPassport' && node.arguments.length > 0) {
                const arg = node.arguments[0];
                if (ts.isObjectLiteralExpression(arg)) {
                    shellData.codeImplementation = arg.getText(sourceFile).trim();
                }
            }
        }

        // Для обычных систем логики по-прежнему честно забираем только мясо render()
        if (shellData.pattern !== 'Component' && ts.isMethodDeclaration(node) && node.name.getText(sourceFile) === 'render') {
            if (node.body) {
                let foundJsxText = "";
                node.body.forEachChild((statement) => {
                    if (ts.isReturnStatement(statement) && statement.expression) {
                        let expr = statement.expression;
                        if (ts.isParenthesizedExpression(expr)) {
                            expr = expr.expression;
                        }
                        foundJsxText = expr.getText(sourceFile).trim();
                    }
                });
                if (foundJsxText) {
                    shellData.codeImplementation = foundJsxText;
                } else {
                    const bodyText = node.body.getText(sourceFile);
                    shellData.codeImplementation = bodyText.substring(1, bodyText.length - 1).trim();
                }
            }
        }
        ts.forEachChild(node, transformer);
    }

    transformer(sourceFile);
    return shellData;
}
