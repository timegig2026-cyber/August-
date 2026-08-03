const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `        {authForm.email.trim().toLowerCase() === 'timegig2026@gmail.com' && (
          <button 
            onClick={() => setShowAdminPanel(true)}
            className="fixed top-4 left-4 flex items-center gap-1.5 text-white bg-blue-600 px-4 py-2 rounded-full shadow-2xl hover:bg-blue-500 transition-transform hover:scale-105 z-[90]"
          >
            <Shield size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">Admin Panel</span>
          </button>
        )}`;

const newLogout = `
        {(!showSplash && !showAuth) && (
          <button 
            onClick={() => {
              setShowAuth(true);
              setIsSetupComplete(false);
              setAuthForm({ name: '', email: '', password: '' });
            }}
            className="fixed top-4 right-4 flex items-center gap-1.5 text-neutral-600 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm hover:bg-white border border-neutral-200 transition-all z-[90]"
          >
            <LogOut size={16} />
            <span className="text-sm font-bold uppercase tracking-wider">Logout</span>
          </button>
        )}
`;

code = code.replace(anchor, anchor + newLogout);
fs.writeFileSync('src/App.tsx', code);
