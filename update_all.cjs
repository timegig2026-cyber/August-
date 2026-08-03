const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update initial auth state to persist and not auto logout
code = code.replace(
  "const [isSetupComplete, setIsSetupComplete] = useState(false);",
  "const [isSetupComplete, setIsSetupComplete] = useState(() => localStorage.getItem('august_logged_in') === 'true');"
);

code = code.replace(
  "const [showAuth, setShowAuth] = useState(false);",
  "const [showAuth, setShowAuth] = useState(() => localStorage.getItem('august_logged_in') !== 'true');"
);

// Remove timer that forced showAuth
const timerOld = `  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      if (!isSetupComplete) setShowAuth(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isSetupComplete]);`;

const timerNew = `  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);`;

code = code.replace(timerOld, timerNew);

// Add profile states
const stateOld = `  const [showChatBox, setShowChatBox] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);`;

const stateNew = `  const [showChatBox, setShowChatBox] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('august_user_profile');
    return saved ? JSON.parse(saved) : { firstName: '', middleName: '', surname: '', avatar: '' };
  });
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);`;

code = code.replace(stateOld, stateNew);

// Update auth submission to set august_logged_in
code = code.replace(
  "setShowAuth(false);\n                    setIsSetupComplete(true);",
  "localStorage.setItem('august_logged_in', 'true');\n                    setShowAuth(false);\n                    setIsSetupComplete(true);"
);

// Remove fixed top-4 left/right buttons and replace with a clean top bar / header integration
const fixedBtnsOld = `        {authForm.email.trim().toLowerCase() === 'timegig2026@gmail.com' && (
          <button 
            onClick={() => setShowAdminPanel(true)}
            className="fixed top-4 left-4 p-2.5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-500 transition-all hover:scale-105 z-[90] flex items-center justify-center"
            title="Admin Panel"
          >
            <Shield size={18} />
          </button>
        )}
        {(!showSplash && !showAuth) && (
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

code = code.replace(fixedBtnsOld, '');

// Now let's add the Profile Modal and Profile / Menu toolbar in the top bar / setup header
const profileModalCode = `
      {/* User Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden text-neutral-800"
            >
              <button 
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 bg-neutral-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">User Profile</h3>
                <p className="text-xs text-neutral-500 mt-1">Update your personal information & profile picture</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green-500 shadow-md bg-neutral-100 mb-2 relative group">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <User size={32} />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold">
                      Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setUserProfile(prev => ({ ...prev, avatar: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-medium">Click image to upload avatar</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">First Name</label>
                  <input 
                    type="text" 
                    value={userProfile.firstName}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. John"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Middle Name (Optional)</label>
                  <input 
                    type="text" 
                    value={userProfile.middleName}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, middleName: e.target.value }))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Michael"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Surname</label>
                  <input 
                    type="text" 
                    value={userProfile.surname}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, surname: e.target.value }))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Doe"
                  />
                </div>

                <button 
                  onClick={() => {
                    localStorage.setItem('august_user_profile', JSON.stringify(userProfile));
                    const welcomeName = userProfile.firstName || 'User';
                    const notifMsg = \`🎉 Congratulations \${welcomeName}! Your profile has been successfully saved. Welcome to your AI companion journey!\`;
                    setNotifications(prev => [{
                      id: Date.now().toString(),
                      message: notifMsg,
                      timestamp: Date.now(),
                      read: false
                    }, ...prev]);
                    setShowProfileModal(false);
                    setIsSetupComplete(false);
                  }}
                  className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-500 transition-all text-sm mt-4"
                >
                  Save & Continue to AI Friend
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;

code = code.replace("{/* Admin Modal */}", profileModalCode + "\n      {/* Admin Modal */}");

// Now let's add profile button and non-intrusive menu in the setup view and chat header
const setupHeaderTarget = `              <div className="flex justify-center mb-4 mt-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-[#e8f5e9]">
                   <img src={auraAvatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>`;

const setupHeaderReplacement = `              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create Your AI Friend</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full text-xs font-semibold text-neutral-700 transition-colors"
                    title="User Profile"
                  >
                    <User size={14} />
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                    className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-600 relative"
                  >
                    <Shield size={16} />
                  </button>
                  {showMenuDropdown && (
                    <div className="absolute right-4 mt-12 w-48 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                      {authForm.email.trim().toLowerCase() === 'timegig2026@gmail.com' && (
                        <button 
                          onClick={() => { setShowAdminPanel(true); setShowMenuDropdown(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-blue-600 hover:bg-neutral-50 flex items-center gap-2"
                        >
                          <Shield size={14} /> Admin Panel
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          localStorage.removeItem('august_logged_in');
                          setShowAuth(true);
                          setIsSetupComplete(false);
                          setShowMenuDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-neutral-50 flex items-center gap-2"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-center mb-4 mt-2">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-[#e8f5e9]">
                   <img src={userProfile.avatar || auraAvatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>`;

code = code.replace(setupHeaderTarget, setupHeaderReplacement);

// Also update the chat header to include Profile and non-obstructive Menu dropdown
const chatHeaderRightTarget = `              <div className="flex gap-2 relative">
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors relative"
                    title="Notifications"
                  >
                    <Bell size={20} className="text-neutral-600 hover:text-neutral-800 transition-colors" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>`;

const chatHeaderRightReplacement = `              <div className="flex gap-2 items-center relative">
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full text-xs font-medium text-neutral-700 transition-colors"
                  title="User Profile"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">{userProfile.firstName || 'Profile'}</span>
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors relative"
                    title="Notifications"
                  >
                    <Bell size={20} className="text-neutral-600 hover:text-neutral-800 transition-colors" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>`;

code = code.replace(chatHeaderRightTarget, chatHeaderRightReplacement);

// Add menu dropdown in chat header actions
const chatHeaderMenuTarget = `                <button 
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  title={autoSpeak ? \`Mute \${botName}\` : \`Let \${botName} speak\`}
                >`;

const chatHeaderMenuReplacement = `                <button 
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  title={autoSpeak ? \`Mute \${botName}\` : \`Let \${botName} speak\`}
                >
                  {autoSpeak ? <Volume2 size={20} className="text-neutral-600 hover:text-neutral-800" /> : <VolumeX size={20} className="text-neutral-400 hover:text-neutral-600" />}
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                    className="p-2 hover:bg-neutral-100 rounded-full text-neutral-600 transition-colors"
                    title="Menu"
                  >
                    <Shield size={18} />
                  </button>
                  {showMenuDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                      {authForm.email.trim().toLowerCase() === 'timegig2026@gmail.com' && (
                        <button 
                          onClick={() => { setShowAdminPanel(true); setShowMenuDropdown(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-blue-600 hover:bg-neutral-50 flex items-center gap-2"
                        >
                          <Shield size={14} /> Admin Panel
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          localStorage.removeItem('august_logged_in');
                          setShowAuth(true);
                          setIsSetupComplete(false);
                          setShowMenuDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-neutral-50 flex items-center gap-2"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            `;

code = code.replace(chatHeaderMenuTarget, chatHeaderMenuReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log('App updated successfully with profile, persistence, and non-blocking menu.');
