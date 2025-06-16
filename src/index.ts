import { Marked } from "marked";
import path from "path";
import fs from "fs";
import { includeExtension } from "./includeExtension";

async function parseMD() {
    const source = path.join(process.cwd(), "testfiles");
    const rootFile = path.join(source, "index.md");

    const marked = new Marked();
    marked.use({
        pedantic: false,
        gfm: true,
        ...includeExtension(source),
    });

    const result = await marked.parse(fs.readFileSync(rootFile, "utf-8"));
    console.log(`Result:\n${result}`);
}

parseMD();
