const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const colorMap = {
  '#7000FF': '#059669', // emerald-600
  'purple-50': 'emerald-50',
  'purple-100': 'emerald-100',
  'purple-200': 'emerald-200',
  'purple-300': 'emerald-300',
  'purple-400': 'emerald-400',
  'purple-500': 'emerald-500',
  'purple-600': 'emerald-600',
  'purple-700': 'emerald-700',
  'purple-800': 'emerald-800',
  'purple-900': 'emerald-900',
  'blue-50': 'teal-50',
  'blue-100': 'teal-100',
  'blue-200': 'teal-200',
  'blue-300': 'teal-300',
  'blue-400': 'teal-400',
  'blue-500': 'teal-500',
  'blue-600': 'teal-600',
  'blue-700': 'teal-700',
  'blue-800': 'teal-800',
  'blue-900': 'teal-900',
  'indigo-50': 'cyan-50',
  'indigo-100': 'cyan-100',
  'indigo-200': 'cyan-200',
  'indigo-300': 'cyan-300',
  'indigo-400': 'cyan-400',
  'indigo-500': 'cyan-500',
  'indigo-600': 'cyan-600',
  'indigo-700': 'cyan-700',
  'indigo-800': 'cyan-800',
  'indigo-900': 'cyan-900',
};

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
    
    // Replace hex colors
    newContent = newContent.replace(/#7000FF/g, '#059669'); // emerald-600
    newContent = newContent.replace(/#1E1B4B/g, '#064E3B'); // deep emerald for dark backgrounds
    newContent = newContent.replace(/#4338CA/g, '#0D9488'); // teal-600
    
    // Replace class colors
    // To avoid partial replacements (like blue-500 being replaced to teal-500 but what if it was lightblue-50?),
    // we use a word boundary or specific prefixes.
    const prefixes = ['bg-', 'text-', 'border-', 'ring-', 'from-', 'to-', 'via-', 'hover:bg-', 'hover:text-', 'focus:ring-', 'focus:border-'];
    
    for (const [oldColor, newColor] of Object.entries(colorMap)) {
      // Create a regex that matches the old color, ensuring it's preceded by a common prefix or just word boundary
      // Actually simpler: just replace `oldColor` with `newColor` if it's bounded
      const regex = new RegExp(`\\b${oldColor}\\b`, 'g');
      newContent = newContent.replace(regex, newColor);
    }
    
    // Additionally, change border radius and shadow to make the design more modern
    // rounded-xl -> rounded-2xl
    // shadow-md -> shadow-lg
    // rounded-lg -> rounded-xl
    // rounded-2xl -> rounded-3xl
    // wait, I can just leave layout intact and change specific roundedness for "different design"
    newContent = newContent.replace(/\brounded-xl\b/g, 'rounded-2xl');
    newContent = newContent.replace(/\brounded-lg\b/g, 'rounded-xl');
    newContent = newContent.replace(/\brounded-md\b/g, 'rounded-lg');
    newContent = newContent.replace(/\brounded-2xl\b/g, 'rounded-3xl');

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
