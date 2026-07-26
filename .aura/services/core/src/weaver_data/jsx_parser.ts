import { Project } from 'ts-morph';
import { WeaverErrorFactory } from './weaver_errors'; // <=== ПОДКЛЮЧАЕМ ВНЕШНИЙ ФАЙЛ ПРАВИЛ

/**
 * ⚡ ДЕТЕРМИНИРОВАННЫЙ AST-ТРАНСЛЯТОР JSX В TS v15.7
 * Полностью очищен от текстовых завалов. Логика ошибок делегирована внешнему модулю.
 */
export function translateJsxToTs(jsxCode: string): string {
    if (!jsxCode || !jsxCode.trim()) return "";
    
    let cleanJsx = jsxCode.replace(/\bcframe\b/g, "cFrame");
    const astProject = new Project({ useInMemoryFileSystem: true });
    const dummyFile = astProject.createSourceFile("dummy.tsx", `const element = (\n${cleanJsx}\n);`);
    let tsResult = "";

    dummyFile.forEachDescendant((node) => {
        const kindName = node.getKindName();
        if (kindName === "JsxOpeningElement" || kindName === "JsxSelfClosingElement") {
            const jsxElem = node as any;
            const tagName = jsxElem.getTagNameNode().getText();
            const attributes: Record<string, string> = {};
            
            jsxElem.getAttributes().forEach((attr: any) => {
                let name = "";
                if (typeof attr.getNameNode === 'function') name = attr.getNameNode().getText();
                else if (typeof attr.getName === 'function') name = attr.getName();
                if (name) {
                    const initializer = attr.getInitializer?.();
                    if (initializer) {
                        let text = initializer.getText();
                        if (text.startsWith("{") && text.endsWith("}")) text = text.slice(1, -1);
                        if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) text = text.slice(1, -1);
                        attributes[name] = text.trim();
                    }
                }
            });

            if (tagName === "Query") {
                const compsRaw = attributes["components"] || "[]";
                const comps = compsRaw.replace(/[\[\]"'\s]/g, "").split(",").filter(s => s.length > 0);
                const iterators = comps.map(c => {
                    const base = c.replace('Component', '');
                    const lowerFirst = base.charAt(0).toLowerCase() + base.slice(1);
                    return lowerFirst !== base ? `${lowerFirst}, ${base}` : base;
                }).join(', ');
                
                tsResult += `for (const [entityId, [${iterators}]] of ctx.world.query(${(comps.map(() => '({} as any)')).join(', ')})) {\n`;
            } 
            else if (tagName === "Safety") {
                tsResult += `let safetyCounter = 0; if (++safetyCounter > ${attributes["limit"] || "5000"}) { warn("Aura Safety Triggered"); break; }\n`;
            } 
            else if (tagName === "Guard") {
                tsResult += `if (${attributes["condition"] || "false"}) { continue; }\n`;
            }
            else if (tagName === "Calculate") {
                tsResult += `const ${attributes["var"]} = ${attributes["expr"]};\n`;
            }
            else if (tagName === "Mutate") {
                const targetId = attributes["targetEntity"] || 'entityId';
                let rawValues = attributes["values"] || "";
                if (rawValues.startsWith("{") && rawValues.endsWith("}")) rawValues = rawValues.slice(1, -1).trim();
                tsResult += `ctx.world.insert(${targetId}, ({ ${rawValues} }));\n`;
            }
            else if (tagName === "NestedQuery") {
                tsResult += `for (const [targetEntityId, [targetArchetype, targetCFrame]] of ctx.world.query(({} as any), ({} as any))) { if (targetArchetype.id !== "${attributes["target"]}") continue;\n`;
            }
        } 
        else if (kindName === "JsxClosingElement") {
            const tagName = (node as any).getTagNameNode().getText();
            if (tagName === "Query") {
                tsResult += "}\n";
            } else if (tagName === "NestedQuery") {
                tsResult += "}\n}\n";
            }
        }
        // Срабатывание жесткого семантического предохранителя
        else if (node.getKindName() === "ExpressionStatement" && node.getParent()?.getKindName() === "JsxElement") {
            const text = node.getText().trim();
            if (!text.startsWith("<") && !text.endsWith(">")) {
                // ЮВЕЛИРНЫЙ ВЫЗОВ ВНЕШНЕЙ ФАБРИКИ ОШИБОК
                throw new Error(WeaverErrorFactory.createUnwrappedCodeError(text));
            }
        }
    });

    return tsResult;
}
