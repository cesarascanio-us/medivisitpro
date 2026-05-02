import fs from 'fs';
import path from 'path';

function fixColorsInDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            fixColorsInDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            const nonColorTextClasses = [
                'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 
                'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 
                'text-7xl', 'text-8xl', 'text-9xl',
                'text-center', 'text-left', 'text-right', 'text-justify',
                'text-transparent', 'text-clip', 'text-ellipsis'
            ];

            content = content.replace(/(className\s*=\s*(["'`]))([^"'`]+)\2/g, (match, prefix, quote, classes) => {
                let classArray = classes.split(/\s+/);
                let newClasses = [...classArray];
                let changed = false;

                const hasLightBg = classArray.some(c => ['bg-white', 'bg-slate-50', 'bg-slate-100', 'bg-slate-200', 'bg-emerald-50', 'bg-blue-50', 'bg-amber-50', 'bg-rose-50'].includes(c));
                const hasDarkBg = classArray.some(c => ['bg-slate-800', 'bg-slate-900', 'bg-slate-950', 'bg-primary', 'bg-emerald-600', 'bg-blue-600', 'bg-rose-600', 'bg-indigo-600'].includes(c));
                
                const hasTextColor = classArray.some(c => c.startsWith('text-') && !nonColorTextClasses.includes(c));

                if (hasLightBg && !hasTextColor) {
                    newClasses.push('text-slate-900');
                    changed = true;
                }

                if (hasDarkBg && !hasTextColor) {
                    newClasses.push('text-white');
                    changed = true;
                }

                // Fix invisible placeholders on light backgrounds
                if (hasLightBg) {
                    classArray.forEach((c, idx) => {
                        if (c === 'placeholder:text-slate-200' || c === 'placeholder:text-slate-300' || c === 'placeholder:text-white') {
                            newClasses[newClasses.indexOf(c)] = 'placeholder:text-slate-500';
                            changed = true;
                        }
                    });
                }

                if (!hasLightBg) {
                    const idx = newClasses.indexOf('text-slate-900');
                    if (idx !== -1) {
                        newClasses[idx] = 'text-foreground';
                        changed = true;
                    }
                }

                if (changed) {
                    modified = true;
                    return `${prefix}${newClasses.join(' ')}${quote}`;
                }
                return match;
            });

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Fixed colors in ${fullPath}`);
            }
        }
    }
}

console.log("Starting color fix...");
fixColorsInDir('./src');
console.log("Color fix completed.");
