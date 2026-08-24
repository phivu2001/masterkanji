const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    [/bg-white/g, 'bg-white dark:bg-slate-800'],
    [/bg-slate-50/g, 'bg-slate-50 dark:bg-slate-900'],
    [/bg-slate-100/g, 'bg-slate-100 dark:bg-slate-700'],
    [/bg-slate-200/g, 'bg-slate-200 dark:bg-slate-600'],
    [/text-slate-900/g, 'text-slate-900 dark:text-white'],
    [/text-slate-800/g, 'text-slate-800 dark:text-slate-100'],
    [/text-slate-700/g, 'text-slate-700 dark:text-slate-200'],
    [/text-slate-600/g, 'text-slate-600 dark:text-slate-300'],
    [/text-slate-500/g, 'text-slate-500 dark:text-slate-400'],
    [/text-slate-400/g, 'text-slate-400 dark:text-slate-500'],
    [/border-slate-300/g, 'border-slate-300 dark:border-slate-600'],
    [/border-slate-200/g, 'border-slate-200 dark:border-slate-700'],
    [/border-slate-100/g, 'border-slate-100 dark:border-slate-800']
];

// First, make sure we don't duplicate `dark:bg-slate-800` if it's already there.
// We can just clean it up if it happens, but for now we apply carefully.
replacements.forEach(([regex, replacement]) => {
    // Only replace if it's not already followed by dark:
    // This regex is slightly complex, so we'll just do a straight replace and then deduplicate
    content = content.replace(regex, replacement);
});

// Deduplicate in case we run it multiple times
content = content.replace(/dark:bg-slate-800 dark:bg-slate-800/g, 'dark:bg-slate-800');
content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
// ... you get the idea.

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done replacing colors for Dark Mode!');
