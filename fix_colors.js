const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix bg-red-50
content = content.replace(/bg-red-50(?! dark:)/g, 'bg-red-50 dark:bg-red-900/30');
// Fix bg-blue-50
content = content.replace(/bg-blue-50(?! dark:)/g, 'bg-blue-50 dark:bg-blue-900/30');
// Fix bg-green-50
content = content.replace(/bg-green-50(?! dark:)/g, 'bg-green-50 dark:bg-green-900/30');
// Fix text-red-500 that might need adjustment (optional, red-500 is usually fine on dark)

fs.writeFileSync(filePath, content, 'utf8');
console.log("Fixed card background shapes");
