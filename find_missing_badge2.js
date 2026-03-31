import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const missing = [];

walkDir('c:/Users/cesar/Cesar Ascanio/CA_CORE/Proyectos_Dev/MediVisitPro/src', (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Match <Badge or </Badge> literally
        if (content.includes('<Badge') || content.includes('Badge>')) {
            // Check if there is ANY import statement that contains 'Badge'
            if (!content.includes('import ') || (!content.includes('Badge') && !content.includes('badge'))) {
                // Not possible if it has <Badge
            }
            // A simple check: Does the file contain "import { Badge" or "import {Badge" or "import Badge"?
            const hasImport = content.includes('import { Badge') || content.includes('import {Badge') || content.match(/import.*Badge.*from/);
            if (!hasImport) {
                missing.push(filePath);
            }
        }
    }
});

console.log("Missing Badge import in:");
console.log(missing);
