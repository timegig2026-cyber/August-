const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find where profile modal save button or bottom of profile modal is, and add Logout button there
const targetProfileButton = `                <button 
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
                </button>`;

const replacementProfileButton = `                <button 
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
                
                <button 
                  onClick={() => {
                    localStorage.removeItem('august_logged_in');
                    setShowAuth(true);
                    setIsSetupComplete(false);
                    setShowProfileModal(false);
                    setShowMenuDropdown(false);
                    setAuthForm({ name: '', email: '', password: '' });
                  }}
                  className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-100 transition-all text-sm mt-2 flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Logout from Account
                </button>`;

if (code.includes(targetProfileButton)) {
  code = code.replace(targetProfileButton, replacementProfileButton);
  fs.writeFileSync('src/App.tsx', code);
  console.log('Successfully added logout button inside profile modal.');
} else {
  console.log('Target profile button not found.');
}
