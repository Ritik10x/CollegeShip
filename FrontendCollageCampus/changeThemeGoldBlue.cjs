const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // Gradients
  { regex: /from-emerald-600\s+to-cyan-600/g, replace: "from-[#002D62] to-[#C5A059]" },
  { regex: /from-emerald-500\s+to-cyan-500/g, replace: "from-[#002D62] to-[#C5A059]" },
  
  // Emerald classes to navy/blue
  { regex: /\bemerald-50\b/g, replace: "[#f0f5fc]" },
  { regex: /\bemerald-100\b/g, replace: "[#e1ecf7]" },
  { regex: /\bemerald-200\b/g, replace: "[#c2d8f2]" },
  { regex: /\bemerald-300\b/g, replace: "[#94bee7]" },
  { regex: /\bemerald-400\b/g, replace: "[#5d9de3]" },
  { regex: /\bemerald-500\b/g, replace: "[#C5A059]" }, // Gold accent for middling details
  { regex: /\bemerald-600\b/g, replace: "[#002D62]" }, // Primary navy
  { regex: /\bemerald-700\b/g, replace: "[#002147]" }, // Dark navy
  { regex: /\bemerald-800\b/g, replace: "[#001733]" },
  { regex: /\bemerald-900\b/g, replace: "[#000c1c]" },
  { regex: /\bemerald-950\b/g, replace: "[#00060f]" },
  
  // Cyan and Teal to Gold
  { regex: /\bcyan-50\b/g, replace: "[#fdfbf7]" },
  { regex: /\bcyan-100\b/g, replace: "[#f8eeda]" },
  { regex: /\bcyan-200\b/g, replace: "[#eedbad]" },
  { regex: /\bcyan-500\b/g, replace: "[#C5A059]" },
  { regex: /\bcyan-600\b/g, replace: "[#B8860B]" },
  { regex: /\bcyan-700\b/g, replace: "[#996515]" },

  { regex: /\bteal-50\b/g, replace: "[#fdfbf7]" },
  { regex: /\bteal-100\b/g, replace: "[#f8eeda]" },
  { regex: /\bteal-200\b/g, replace: "[#eedbad]" },
  { regex: /\bteal-300\b/g, replace: "[#e2c07a]" },
  { regex: /\bteal-500\b/g, replace: "[#C5A059]" },
  { regex: /\bteal-600\b/g, replace: "[#B8860B]" },
  { regex: /\bteal-700\b/g, replace: "[#996515]" },

  // Purple classes to Gold
  { regex: /\bpurple-50\b/g, replace: "[#fdfbf7]" },
  { regex: /\bpurple-100\b/g, replace: "[#f8eeda]" },
  { regex: /\bpurple-200\b/g, replace: "[#eedbad]" },
  { regex: /\bpurple-600\b/g, replace: "[#C5A059]" },
  { regex: /\bpurple-700\b/g, replace: "[#A8813E]" },
  
  // Specific shadows
  { regex: /shadow-emerald-100/g, replace: "shadow-[#002D62]/10" },
  { regex: /shadow-emerald-200/g, replace: "shadow-[#002D62]/15" },
  { regex: /shadow-emerald-300/g, replace: "shadow-[#002D62]/20" },
  { regex: /shadow-purple-100/g, replace: "shadow-[#C5A059]/10" },
  { regex: /shadow-purple-500\/20/g, replace: "shadow-[#C5A059]/20" },

  // Hardcoded hex replacements
  { regex: /#059669/g, replace: "#002D62" }, // main green -> deep navy blue
  { regex: /#064E3B/g, replace: "#001A3A" }, // deep green -> very dark navy
  { regex: /#047857/g, replace: "#002147" }, // secondary green -> Oxford navy
  { regex: /#0D9488/g, replace: "#C5A059" }, // teal -> Gold
  { regex: /#5b00cc/g, replace: "#C5A059" }, // purple accent -> Gold
  { regex: /#F3E8FF/g, replace: "#fdfbf7" }, // purple-50 -> soft gold-white
  { regex: /#ebd5ff/g, replace: "#f8eeda" }, // purple-100 -> light gold
  { regex: /#7e22ce/g, replace: "#C5A059" }, // bright purple -> Gold
  { regex: /#7000FF/g, replace: "#002D62" }, // bright purple -> navy
  { regex: /#4338CA/g, replace: "#C5A059" }, // indigo -> Gold
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(directoryPath, function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    
    // Apply replacements
    for (const item of replacements) {
      newContent = newContent.replace(item.regex, item.replace);
    }

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Updated: ${path.relative(__dirname, filePath)}`);
    }
  }
});

console.log("🚀 Color theme replacement finished successfully!");
