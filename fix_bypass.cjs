const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove Admin Bypass Login block
code = code.replace(/<div className="pt-4 mt-4 border-t border-green-400\/30">\s*<button\s*onClick=\{\(\) => \{\s*setCoinBalance\(9999\);\s*setShowAuth\(false\);\s*setIsSetupComplete\(true\);\s*\}\}\s*className="text-\[10px\] uppercase tracking-wider text-green-200 hover:text-white transition-colors"\s*>\s*Admin Bypass Login\s*<\/button>\s*<\/div>/g, '');

// Remove Admin Bypass Payment block
code = code.replace(/<button\s*onClick=\{\(\) => \{\s*setCoinBalance\(9999\);\s*setShowPricing\(false\);\s*setIsSetupComplete\(true\);\s*\}\}\s*className="text-\[10px\] uppercase tracking-wider text-green-200 hover:text-white transition-colors"\s*>\s*Admin Bypass Payment\s*<\/button>/g, '');

// Make sure the email matching ignores trailing whitespace
code = code.replace(/authForm\.email\.toLowerCase\(\) === 'timegig2026@gmail\.com'/g, "authForm.email.trim().toLowerCase() === 'timegig2026@gmail.com'");

fs.writeFileSync('src/App.tsx', code);
