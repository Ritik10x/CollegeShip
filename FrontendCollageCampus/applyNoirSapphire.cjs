const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // 1. Text Colors
  { regex: /\btext-gray-900\b/g, replace: "text-[#0D0D12]" },
  { regex: /\bgray-900\b/g, replace: "text-[#0D0D12]" }, // some instances were just gray-900
  { regex: /\btext-gray-800\b/g, replace: "text-[#0D0D12]" },
  
  // 2. Error / Destructive (Red/Rose)
  { regex: /\bbg-red-500\b/g, replace: "bg-[#A62639]" },
  { regex: /\btext-red-500\b/g, replace: "text-[#A62639]" },
  { regex: /\bborder-red-500\b/g, replace: "border-[#A62639]" },
  { regex: /\bbg-rose-500\b/g, replace: "bg-[#A62639]" },
  { regex: /\btext-rose-500\b/g, replace: "text-[#A62639]" },
  { regex: /\btext-rose-600\b/g, replace: "text-[#A62639]" },
  { regex: /\bborder-rose-400\b/g, replace: "border-[#A62639]" },
  { regex: /\bbg-rose-50\b/g, replace: "bg-[#A62639]/10" },
  { regex: /\bfocus:border-rose-500\b/g, replace: "focus:border-[#A62639]" },
  { regex: /\btext-error\b/g, replace: "text-[#A62639]" },
  { regex: /\bborder-error\b/g, replace: "border-[#A62639]" },
  { regex: /\bhover:text-error\b/g, replace: "hover:text-[#8b1e2e]" },
  { regex: /\bhover:bg-red-50\b/g, replace: "hover:bg-[#A62639]/10" },

  // 3. Success (Green)
  { regex: /\bbg-green-500\b/g, replace: "bg-[#2D8A56]" },
  { regex: /\btext-green-600\b/g, replace: "text-[#2D8A56]" },
  { regex: /\btext-green-500\b/g, replace: "text-[#2D8A56]" },
  { regex: /\bbg-green-50\b/g, replace: "bg-[#2D8A56]/10" },
  { regex: /\bborder-green-200\b/g, replace: "border-[#2D8A56]/30" },
  { regex: /\bbg-green-100\b/g, replace: "bg-[#2D8A56]/20" },

  // 4. Warning / Pending (Yellow/Amber)
  { regex: /\bbg-yellow-500\b/g, replace: "bg-[#C9A227]" },
  { regex: /\btext-yellow-600\b/g, replace: "text-[#C9A227]" },
  { regex: /\btext-amber-500\b/g, replace: "text-[#C9A227]" },
  { regex: /\bbg-amber-100\b/g, replace: "bg-[#C9A227]/20" },

  // 5. Hardcoded Hexes & Backgrounds
  { regex: /bg-\[\#f0f5fc\]/g, replace: "bg-brand-bg" },
  { regex: /bg-\[\#fbfcff\]/g, replace: "bg-background" },
  { regex: /bg-\[\#f8fbff\]/g, replace: "bg-background" },
  { regex: /bg-\[\#f0fdf4\]/g, replace: "bg-[#2D8A56]/5" },
  { regex: /\bbg-slate-200\b/g, replace: "bg-[#E5E5E8]" },
  { regex: /\bbg-gray-50\b/g, replace: "bg-[#F7F7F9]" },
  { regex: /\btext-gray-300\b/g, replace: "text-[#5B5B63]/60" },

  // 6. Interactive States & Transitions
  // User Rule: primary button hovers go to Near-Black (#0D0D12)
  { regex: /\bhover:bg-primary\b/g, replace: "hover:bg-[#0D0D12] transition-colors duration-200" },
  { regex: /\bhover:-translate-y-\[2px\]\b/g, replace: "hover:-translate-y-[1px]" }, // lessen movement
  { regex: /\bactive:scale-95\b/g, replace: "active:scale-[0.98]" }, // gentle scale per rules
  
  // Primary links hover to gold (#C9A227)
  { regex: /\bhover:text-primary\b/g, replace: "hover:text-accent transition-colors duration-200" },

  // Brand borders hover to primary
  { regex: /\bhover:border-primary\b/g, replace: "hover:border-primary transition-colors duration-200" },
  
  // Specific custom hovers
  { regex: /hover:bg-\[\#b08e4d\]/g, replace: "hover:bg-[#A8813E] transition-colors duration-200" },
  { regex: /hover:bg-brand-bg/g, replace: "hover:bg-brand-bg\/80 transition-colors duration-200" }
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;

walkDir(directoryPath, function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    
    for (const item of replacements) {
      newContent = newContent.replace(item.regex, item.replace);
    }

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      modifiedFiles++;
    }
  }
});

console.log(`🚀 Color theme replacement finished! Modified ${modifiedFiles} files.`);
