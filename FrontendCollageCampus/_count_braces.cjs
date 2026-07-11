const fs = require('fs');
const c = fs.readFileSync('src/pages/admin/AdminColleges.jsx', 'utf8');
const lines = c.split('\n');
console.log('Total lines:', lines.length);
for (let i = 0; i < lines.length; i++) {
  let open = (lines[i].match(/{/g) || []).length;
  let close = (lines[i].match(/}/g) || []).length;
  console.log('Line ' + (i + 1) + ': len=' + lines[i].length + ', {=' + open + ', }=' + close);
}
