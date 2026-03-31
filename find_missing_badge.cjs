const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ?
            walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let missing = [];

walkDir('c:/Users/cesar/Cesar Ascanio/CA_CORE/Proyectos_Dev/MediVisitPro/src', (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('<Badge') || content.includes(' Badge ')) {
            if (!content.includes('import { Badge }') && !content.includes('import {Badge}')) {
                // Let's double check if it imports Badge at all
                if (!(/import\s+{.*?\bBadge\b.*?}\s+from/.test(content))) {
                    missing.push(filePath);
                }
            }
        }
    }
});

console.log("Missing Badge import in:");
console.log(missing);
