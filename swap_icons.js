const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/fa-sun' : 'fa-moon'/g, "fa-moon' : 'fa-sun'");

fs.writeFileSync(filePath, content, 'utf8');
console.log("Swapped icons!");
