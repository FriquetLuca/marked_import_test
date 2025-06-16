import fs from 'fs';
import { type MarkedExtension, Marked } from 'marked';
import path from 'path';

export function includeExtension(baseDir: string): MarkedExtension {
    const importStack = new Set<string>();
    return {
        extensions: [
            {
                name: 'includeExtension',
                level: 'block',
                start(src) {
                    return src.match(/^!INCLUDE\s+"(.+?)"(?:\s*,\s*(\d+))?/)?.index;
                },
                tokenizer(src) {
                    const match = /^!INCLUDE\s+"(.+?)"(?:\s*,\s*(\d+))?[ \t]*(?:\r?\n|$)/.exec(src);

                    if (!match) return;

                    const [raw, includePath, _] = match;
                    const fullPath = path.resolve(baseDir, includePath);

                    if (importStack.has(fullPath)) {
                        return {
                            type: 'includeExtension',
                            raw,
                        };
                    }

                    if (!fs.existsSync(fullPath)) {
                        return {
                            type: 'includeExtension',
                            raw,
                        };
                    }
                    const rawFile = fs.readFileSync(fullPath, 'utf-8');
                    importStack.add(fullPath);
                    
                    const result = new Marked().lexer(rawFile, { ...this.lexer.options });

                    importStack.delete(fullPath);

                    return {
                        type: 'includeExtension',
                        raw,
                        tokens: result,
                    };
                },
                renderer(code) {
                    return code.text ?? this.parser.parse(code.tokens??[]);
                }
            }
        ]
    }
}
