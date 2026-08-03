const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Set setIsAiSpeaking(true) when audio or text arrives
code = code.replace(
  "if (msg.audio && autoSpeak) {",
  "if (msg.audio && autoSpeak) {\n        setIsAiSpeaking(true);\n        setTimeout(() => setIsAiSpeaking(false), 3000);"
);

code = code.replace(
  "if (msg.text) {",
  "if (msg.text) {\n         setIsAiSpeaking(true);\n         setTimeout(() => setIsAiSpeaking(false), 3000);"
);

// Add toggle button to header for showing/hiding chat box
const headerActionsOld = `                <button 
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  title={autoSpeak ? \`Mute \${botName}\` : \`Let \${botName} speak\`}
                >`;

const headerActionsNew = `                <button 
                  onClick={() => setShowChatBox(!showChatBox)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  title={showChatBox ? "Hide chat box to view AI glow light" : "Show chat box"}
                >
                  <Sparkles size={20} className={\`\${!showChatBox ? 'text-amber-500 animate-spin' : 'text-neutral-600'} hover:text-neutral-800 transition-colors\`} />
                </button>
                <button 
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  title={autoSpeak ? \`Mute \${botName}\` : \`Let \${botName} speak\`}
                >`;

code = code.replace(headerActionsOld, headerActionsNew);

// Wrap chat main and footer with {showChatBox && ( ... )} and provide an immersive glow view when hidden or active
const chatMainOld = `            {/* Chat Area */}
            <main
              ref={scrollRef}
              className="flex-1 overflow-y-auto pr-2 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-neutral-200"
            >`;

const chatMainNew = `            {/* Chat Area / Glow View */}
            {showChatBox ? (
              <main
                ref={scrollRef}
                className="flex-1 overflow-y-auto pr-2 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-neutral-200"
              >`;

code = code.replace(chatMainOld, chatMainNew);

// Now wrap footer and close condition, and add the immersive glow light view if showChatBox is false
const footerOld = `        {/* Input Area */}
        <footer className="mt-8 relative">`;

const glowView = `            </main>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center relative p-8">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={\`w-72 h-72 rounded-full blur-3xl opacity-40 transition-all duration-1000 \${isAiSpeaking ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500 scale-125 animate-pulse' : 'bg-gradient-to-r from-emerald-200 to-teal-200 scale-100'}\`}></div>
                  <div className={\`w-48 h-48 rounded-full blur-2xl opacity-60 transition-all duration-750 \${isAiSpeaking ? 'bg-gradient-to-tr from-amber-400 via-rose-400 to-violet-500 animate-ping' : 'bg-green-100'}\`}></div>
                </div>
                <div className="relative z-10 text-center space-y-6 bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-neutral-200 shadow-2xl max-w-sm w-full">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto">
                    <img src={auraAvatar} alt={botName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{botName}</h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      {isAiSpeaking ? "✨ Speaking & Glowing..." : "Listening to your presence..."}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowChatBox(true)}
                    className="w-full py-2.5 bg-[#2d3436] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-all"
                  >
                    Show Chat Box
                  </button>
                </div>
              </div>
            )}

        {/* Input Area */}
        {showChatBox && (
        <footer className="mt-8 relative">`;

code = code.replace(footerOld, glowView);

// Also need to close the footer wrapper
// Let's find the end of footer
const footerEndOld = `          <p className="text-[10px] text-center mt-3 text-neutral-400 tracking-wider uppercase font-medium">
            Shared with care by {botName} • Entertainment purposes only
          </p>
        </footer>`;

const footerEndNew = `          <p className="text-[10px] text-center mt-3 text-neutral-400 tracking-wider uppercase font-medium">
            Shared with care by {botName} • Entertainment purposes only
          </p>
        </footer>
        )}`;

code = code.replace(footerEndOld, footerEndNew);

fs.writeFileSync('src/App.tsx', code);
console.log('Glow and chat toggle updated successfully');
