const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update initial coin balance to 50 for new users
code = code.replace(
  "return saved ? parseInt(saved, 10) : 25;",
  "return saved ? parseInt(saved, 10) : 50;"
);

// Add showChatBox state
const stateInsertion = "const [showNotifications, setShowNotifications] = useState(false);";
const newState = "const [showNotifications, setShowNotifications] = useState(false);\n  const [showChatBox, setShowChatBox] = useState(true);\n  const [isAiSpeaking, setIsAiSpeaking] = useState(false);";
code = code.replace(stateInsertion, newState);

// 2. Update auth button logic for duplicate account blocking and 50c
const oldAuthBtn = `                <button 
                  onClick={() => {
                    setShowAuth(false);
                  }}
                  disabled={!authForm.email || !authForm.password || (authMode === 'signup' && !authForm.name)}
                  className="w-full py-3 bg-green-600 text-white shadow-lg rounded-xl font-bold text-base hover:bg-green-500 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-green-400"
                >
                  {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                </button>`;

const newAuthBtn = `                <button 
                  onClick={() => {
                    const registered = JSON.parse(localStorage.getItem('august_registered_accounts') || '[]');
                    const emailTrim = authForm.email.trim().toLowerCase();
                    if (authMode === 'signup') {
                      if (registered.includes(emailTrim)) {
                        alert('An account with this email already exists. Redirecting to Sign In or Pricing Plan.');
                        setAuthMode('signin');
                        return;
                      }
                      registered.push(emailTrim);
                      localStorage.setItem('august_registered_accounts', JSON.stringify(registered));
                      setCoinBalance(50);
                    }
                    setShowAuth(false);
                    setIsSetupComplete(true);
                  }}
                  disabled={!authForm.email || !authForm.password || (authMode === 'signup' && !authForm.name)}
                  className="w-full py-3 bg-green-600 text-white shadow-lg rounded-xl font-bold text-base hover:bg-green-500 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-green-400"
                >
                  {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                </button>`;

code = code.replace(oldAuthBtn, newAuthBtn);

// 3. Make Admin Panel and Logout compact icon-only buttons
const oldAdminBtn = `{authForm.email.trim().toLowerCase() === 'timegig2026@gmail.com' && (
          <button 
            onClick={() => setShowAdminPanel(true)}
            className="fixed top-4 left-4 flex items-center gap-1.5 text-white bg-blue-600 px-4 py-2 rounded-full shadow-2xl hover:bg-blue-500 transition-transform hover:scale-105 z-[90]"
          >
            <Shield size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">Admin Panel</span>
          </button>
        )}`;

const newAdminBtn = `{authForm.email.trim().toLowerCase() === 'timegig2026@gmail.com' && (
          <button 
            onClick={() => setShowAdminPanel(true)}
            className="fixed top-4 left-4 p-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 transition-all hover:scale-105 z-[90] flex items-center justify-center"
            title="Admin Panel"
          >
            <Shield size={18} />
          </button>
        )}`;

code = code.replace(oldAdminBtn, newAdminBtn);

const oldLogoutBtn = `{(!showSplash && !showAuth) && (
          <button 
            onClick={() => {
              setShowAuth(true);
              setIsSetupComplete(false);
              setAuthForm({ name: '', email: '', password: '' });
              setCoinBalance(0);
            }}
            className="fixed top-4 right-4 flex items-center gap-1.5 text-neutral-600 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm hover:bg-white border border-neutral-200 transition-all z-[90]"
          >
            <LogOut size={16} />
            <span className="text-sm font-bold uppercase tracking-wider">Logout</span>
          </button>
        )}`;

const newLogoutBtn = `{(!showSplash && !showAuth) && (
          <button 
            onClick={() => {
              setShowAuth(true);
              setIsSetupComplete(false);
              setAuthForm({ name: '', email: '', password: '' });
            }}
            className="fixed top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md text-neutral-700 rounded-full shadow-lg hover:bg-white border border-neutral-200 transition-all hover:scale-105 z-[90] flex items-center justify-center"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        )}`;

code = code.replace(oldLogoutBtn, newLogoutBtn);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated successfully');
