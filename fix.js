const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const adminModalStr = fs.readFileSync('/tmp/admin_modal.tsx', 'utf8');

// replace all instances of adminModalStr with empty string
code = code.split(adminModalStr).join('');

// put it back where it belongs. Let's find the last AnimatePresence before max-w-3xl
const marker = '<div className="max-w-3xl mx-auto h-screen flex flex-col p-4 md:p-8">';

if(code.includes(marker)) {
  code = code.replace(marker, adminModalStr + '\n      ' + marker);
}

fs.writeFileSync('src/App.tsx', code);
