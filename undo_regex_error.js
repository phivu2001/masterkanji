const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The regex erroneously replaced bg-red-500 to bg-red-50 dark:bg-red-900/300
// It also replaced bg-blue-500 to bg-blue-50 dark:bg-blue-900/300
// and bg-green-500 to bg-green-50 dark:bg-green-900/300

content = content.replace(/bg-red-50 dark:bg-red-900\/300/g, 'bg-red-500');
content = content.replace(/bg-blue-50 dark:bg-blue-900\/300/g, 'bg-blue-500');
content = content.replace(/bg-green-50 dark:bg-green-900\/300/g, 'bg-green-500');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Fixed regex replacement errors");
