const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const floatingBtn = `
        {/* Floating Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode} 
          className="fixed bottom-6 right-6 w-12 h-12 bg-slate-800 dark:bg-white text-white dark:text-slate-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
          title={isDarkMode ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
        >
          <i className={\`fas \${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl\`}></i>
        </button>
      </div>
    );
  }
`;

// Replace the first early return closing
content = content.replace(/          <\/div>\r?\n        <\/div>\r?\n      <\/div>\r?\n    \);\r?\n  }/, 
`          </div>
        </div>
${floatingBtn}`);

// Replace the second early return closing
content = content.replace(/          <\/div>\r?\n        <\/div>\r?\n      <\/div>\r?\n    \);\r?\n  }/, 
`          </div>
        </div>
${floatingBtn}`);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Added floating button to early returns");
