const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We will add a global admin button that floats at the top left of the screen for the admin.
// First, let's remove the one in the Create AI Friend screen.
const createScreenButton = `              {authForm.email.trim().toLowerCase() === 'timegig2026@gmail.com' && (
                <button 
                  onClick={() => setShowAdminPanel(true)}
                  className="absolute top-4 left-4 flex items-center gap-1.5 text-white bg-blue-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-blue-500 transition-colors z-10"
                >
                  <Shield size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Admin</span>
                </button>
              )}`;
code = code.replace(createScreenButton, '');

const pricingScreenButton = `              {authForm.email.trim().toLowerCase() === 'timegig2026@gmail.com' && (
                <button 
                  onClick={() => setShowAdminPanel(true)}
                  className="absolute top-4 left-4 flex items-center gap-1.5 text-white bg-blue-600 px-3 py-1.5 rounded-full shadow-lg hover:bg-blue-500 transition-colors z-10"
                >
                  <Shield size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Admin</span>
                </button>
              )}`;
code = code.replace(pricingScreenButton, '');

// Now we'll add it right inside the main div or AnimatePresence.
// Let's add it right after <div className="max-w-3xl mx-auto h-screen flex flex-col p-4 md:p-8">
const mainDiv = '<div className="max-w-3xl mx-auto h-screen flex flex-col p-4 md:p-8">';
const newButton = `
        {authForm.email.trim().toLowerCase() === 'timegig2026@gmail.com' && (
          <button 
            onClick={() => setShowAdminPanel(true)}
            className="fixed top-4 left-4 flex items-center gap-1.5 text-white bg-blue-600 px-4 py-2 rounded-full shadow-2xl hover:bg-blue-500 transition-transform hover:scale-105 z-[90]"
          >
            <Shield size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">Admin Panel</span>
          </button>
        )}
`;
code = code.replace(mainDiv, mainDiv + newButton);

fs.writeFileSync('src/App.tsx', code);
