const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldModalDiv = 'className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"';
const newModalDiv = 'className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-0 overflow-y-auto"';

const oldInnerDiv = 'className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 relative overflow-hidden text-neutral-800"';
const newInnerDiv = 'className="bg-white w-full h-full max-w-5xl mx-auto p-4 md:p-8 relative overflow-y-auto text-neutral-800 flex flex-col"';

code = code.replace(oldModalDiv, newModalDiv);
code = code.replace(oldInnerDiv, newInnerDiv);

fs.writeFileSync('src/App.tsx', code);
