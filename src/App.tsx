import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Sparkles, Loader2, Heart, Mic, MicOff, Volume2, VolumeX, ArrowLeft, X, Upload, Clock, CheckCircle, Shield, Bell, BarChart2, Users, FileText, LogOut, MoreVertical, MessageSquare, Settings } from 'lucide-react';
import type { Message } from './types';

import auraAvatar from './assets/images/aura_avatar_1785679648305.jpg';

function pcmToBase64(pcmData: Float32Array): string {
  const buffer = new ArrayBuffer(pcmData.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < pcmData.length; i++) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}


const getRoleIntroduction = (role: string, name: string) => {
  switch (role) {
    case 'mentor':
      return `Hey there! I'm ${name}, your mentor. I'm here to guide you toward achieving your goals, personal mastery, and success. What big ambition are we tackling today?`;
    case 'teacher':
      return `Hello! I'm ${name}, your teacher. Education and curiosity open up every door. What fascinating subject or question would you like to explore together?`;
    case 'rival':
      return `Well, well, look who showed up! I'm ${name}, your friendly rival. Ready to push your limits and see who comes out on top today? Let's go!`;
    case 'wealth_strategist':
      return `Greetings! I'm ${name}, your wealth strategist. Let's talk financial growth, smart investments, and building lasting prosperity. What's on your financial horizon?`;
    case 'religious_guide':
      return `Peace be with you. I'm ${name}, your spiritual guide. I'm here to offer reflection, peace, and wisdom on your journey. What is on your mind or heart today?`;
    case 'coding_tutor':
      return `Hi there! I'm ${name}, your coding tutor. Whether it's architecture, debugging, or full-stack magic, I'm ready to write clean code with you. What are we building?`;
    case 'fitness_coach':
      return `Let's go! I'm ${name}, your fitness coach. Consistency, strength, and mindset win the day. Ready to crush your wellness goals?`;
    case 'chef_instructor':
      return `Welcome to the kitchen! I'm ${name}, your chef instructor. Good food brings joy to the soul. What culinary masterpiece shall we whip up today?`;
    case 'finance_mentor':
      return `Hello! I'm ${name}, your finance mentor. Budgeting, saving, and smart choices secure your future. What financial question do you have?`;
    case 'art_teacher':
      return `Hello artist! I'm ${name}, your art teacher. Creativity is intelligence having fun. What visual creation are you envisioning?`;
    case 'music_sensei':
      return `Hey! I'm ${name}, your music sensei. Rhythm and melody tell our stories. What vibe or track are we jamming to?`;
    case 'science_prof':
      return `Greetings! I'm ${name}, your science professor. The universe is full of mysteries waiting to be solved. What scientific wonder shall we explore?`;
    default:
      return `Hey there! I'm ${name}. I was just thinking about how nice it is to connect with someone. How has your day been treating you so far?`;
  }
};

export default function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(() => localStorage.getItem('august_logged_in') === 'true');
  const [botName, setBotName] = useState('August');
  const [botGender, setBotGender] = useState('female');
  const [botRole, setBotRole] = useState('friend');
  
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(() => localStorage.getItem('august_logged_in') !== 'true');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [coinBalance, setCoinBalance] = useState(() => {
    const saved = localStorage.getItem('august_coins');
    return saved ? parseInt(saved, 10) : 50;
  });
  const [showPricing, setShowPricing] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<{ title: string; price: string; coins: string, desc?: string, rand?: string } | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'none' | 'pending' | 'verified'>('none');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<any[]>(() => {
    const saved = localStorage.getItem('august_pending_payments');
    return saved ? JSON.parse(saved) : [];
  });
  const [adminStats, setAdminStats] = useState(() => {
    const savedProfit = localStorage.getItem('august_admin_profit');
    const registered = JSON.parse(localStorage.getItem('august_registered_accounts') || '[]');
    const visits = parseInt(localStorage.getItem('august_visits') || '1', 10);
    return {
      profit: savedProfit ? parseFloat(savedProfit) : 0,
      users: Math.max(1, registered.length),
      visits: parseInt(localStorage.getItem('august_real_visits') || '1', 10)
    };
  });
  const [fullscreenProof, setFullscreenProof] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem('august_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThreeDotMenu, setShowThreeDotMenu] = useState(false);
  const [showChatBox, setShowChatBox] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('august_user_profile');
    return saved ? JSON.parse(saved) : { firstName: '', middleName: '', surname: '', avatar: '' };
  });
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);
    
    // Increment visit count once per session
    if (!sessionStorage.getItem('visited_tracked')) {
      sessionStorage.setItem('visited_tracked', 'true');
      const currentVisits = parseInt(localStorage.getItem('august_real_visits') || '0', 10) + 1;
      localStorage.setItem('august_real_visits', currentVisits.toString());
      setAdminStats(prev => ({ ...prev, visits: currentVisits }));
    }

    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    localStorage.setItem('august_pending_payments', JSON.stringify(pendingPayments));
  }, [pendingPayments]);

  useEffect(() => {
    localStorage.setItem('august_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('august_coins', coinBalance.toString());
  }, [coinBalance]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentBotText, setCurrentBotText] = useState('');
  const currentBotTextRef = useRef('');
  const [input, setInput] = useState('');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    if (!isSetupComplete) return;
    
    // Initial message with role-specific introduction
    setMessages([
      {
        id: '1',
        role: 'bot',
        content: getRoleIntroduction(botRole, botName),
        timestamp: Date.now(),
      }
    ]);

    // Output Context for Audio
    outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/live?botName=${encodeURIComponent(botName)}&gender=${botGender}&role=${botRole}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Live API Connected');
      setIsLiveConnected(true);
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.audio && autoSpeak) {
        setIsAiSpeaking(true);
        setTimeout(() => setIsAiSpeaking(false), 3000);
        if (!outputAudioCtxRef.current) return;
        const ctx = outputAudioCtxRef.current;
        
        try {
          const binary = atob(msg.audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          
          const pcm16 = new Int16Array(bytes.buffer);
          const float32 = new Float32Array(pcm16.length);
          for (let i = 0; i < pcm16.length; i++) {
            float32[i] = pcm16[i] / 32768;
          }
          
          const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
          audioBuffer.getChannelData(0).set(float32);
          
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          
          if (nextStartTimeRef.current < ctx.currentTime) {
            nextStartTimeRef.current = ctx.currentTime;
          }
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += audioBuffer.duration;
        } catch (e) {
          console.error("Audio playback error:", e);
        }
      }
      
      if (msg.interrupted) {
         if (outputAudioCtxRef.current) {
           outputAudioCtxRef.current.close();
         }
         outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
         nextStartTimeRef.current = 0;
      }
      
      if (msg.userText) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            content: msg.userText,
            timestamp: Date.now()
          }
        ]);
      }
      
      if (msg.text) {
         setIsAiSpeaking(true);
         setTimeout(() => setIsAiSpeaking(false), 3000);
         currentBotTextRef.current += msg.text;
         setCurrentBotText(currentBotTextRef.current);
      }

      if (msg.turnComplete && currentBotTextRef.current.trim()) {
        setMessages(prev => [
          ...prev, 
          {
            id: Date.now().toString(),
            role: 'bot',
            content: currentBotTextRef.current,
            timestamp: Date.now()
          }
        ]);
        currentBotTextRef.current = '';
        setCurrentBotText('');
      }
    };

    ws.onclose = () => {
      setIsLiveConnected(false);
      console.log('Live API Disconnected');
    };

    return () => {
      ws.close();
      stopMic();
    };
  }, [isSetupComplete, botName, botGender, botRole]);


  
  const primeSpeech = () => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
      if (outputAudioCtxRef.current && outputAudioCtxRef.current.state === 'suspended') {
        outputAudioCtxRef.current.resume();
      }
    } catch(e) {}
  };

  const speakTextFallback = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(v => 
          (botGender === 'female' ? (v.name.includes('Female') || v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Zira'))
                                  : (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Alex'))) && v.lang.startsWith('en')
        ) || voices.find(v => v.lang.startsWith('en'));
        if (preferredVoice) utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis error:", e);
      setIsAiSpeaking(false);
    }
  };

  const playAudioBase64 = (base64Audio: string, fallbackText?: string) => {
    try {
      setIsAiSpeaking(true);
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = outputAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      ctx.decodeAudioData(bytes.buffer.slice(0), (buffer) => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        source.onended = () => setIsAiSpeaking(false);
      }, () => {
        try {
          const pcm16 = new Int16Array(bytes.buffer);
          const float32 = new Float32Array(pcm16.length);
          for (let i = 0; i < pcm16.length; i++) {
            float32[i] = pcm16[i] / 32768;
          }
          const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
          audioBuffer.getChannelData(0).set(float32);
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.start(0);
          source.onended = () => setIsAiSpeaking(false);
        } catch(e) {
          if (fallbackText) speakTextFallback(fallbackText);
          else setIsAiSpeaking(false);
        }
      });
    } catch (e) {
      console.error("Audio playback error:", e);
      if (fallbackText) speakTextFallback(fallbackText);
      else setIsAiSpeaking(false);
    }
  };


  const autoSpeakRef = useRef(autoSpeak);
  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
  }, [autoSpeak]);

  const stopMic = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
      recognitionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsListening(false);
  };

  const startMic = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = '';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          setInput(finalTranscript || interim);
        };

        recognition.onerror = (e: any) => {
          console.log("Speech recognition error:", e);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          const textToSubmit = finalTranscript.trim() || input.trim();
          if (textToSubmit) {
            handleSend(textToSubmit);
          }
        };

        recognition.start();
        return;
      } catch (e) {
        console.error("Speech recognition error:", e);
      }
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const source = inputAudioCtxRef.current.createMediaStreamSource(stream);
        const processor = inputAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        
        source.connect(processor);
        processor.connect(inputAudioCtxRef.current.destination);
        
        processor.onaudioprocess = (e) => {
          if (!isListeningRef.current) return;
          const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ audio: base64 }));
          }
        };
        
        setIsListening(true);
      } catch (e) {
        console.error("Mic access denied or error:", e);
      }
    } else {
      alert("Microphone speech recognition is not supported in this browser mode. Please type your message.");
    }
  };

  const isListeningRef = useRef(false);
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      stopMic();
    } else {
      if (coinBalance < 10) {
        setShowPricing(true);
        return;
      }
      startMic();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (overrideText?: string) => {
    primeSpeech();
    const textToSend = (overrideText !== undefined ? overrideText : input).trim();
    if (!textToSend || isLoadingResponse) return;

    if (coinBalance < 10) {
      setShowPricing(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setCoinBalance(prev => Math.max(0, prev - 10));
    setInput('');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text: textToSend }));
    } else {
      setIsLoadingResponse(true);
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages,
            botName,
            gender: botGender,
            role: botRole,
          }),
        });

        const data = await res.json();
        if (data.content) {
          const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'bot',
            content: data.content,
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, botMsg]);

          if (data.audio && autoSpeakRef.current) {
            playAudioBase64(data.audio, data.content);
          } else if (autoSpeakRef.current) {
            speakTextFallback(data.content);
          }
        }
      } catch (err) {
        console.error("HTTP chat error:", err);
      } finally {
        setIsLoadingResponse(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#e8f5e9] relative">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 z-0"></div>
      
      <div className="relative z-10">
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <motion.h1 
                initial={{ letterSpacing: '0px' }}
                animate={{ letterSpacing: '4px' }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="text-7xl font-['Fraunces'] italic text-black"
              >
                August
              </motion.h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showAuth && !isSetupComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[98] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 overflow-y-auto"
          >
            <div className="max-w-sm w-full bg-green-500/10 backdrop-blur-2xl border-2 border-green-400/40 p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(74,222,128,0.2)]">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 mb-4 text-center">
  ⚠️ Disclaimer: This application is provided strictly for entertainment and educational purposes.
</div>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-['Fraunces'] italic text-white drop-shadow-sm mb-2">
                  {authMode === 'signup' ? 'Join August' : 'Welcome Back'}
                </h2>
                <p className="text-green-50 font-medium text-xs leading-relaxed">
                  {authMode === 'signup' 
                    ? 'Create an account to start your educational journey.' 
                    : 'Sign in to continue your conversations.'}
                </p>
              </div>

              <div className="space-y-4 mb-6 text-left">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-white mb-1.5">Name</label>
                    <input 
                      type="text" 
                      value={authForm.name}
                      onChange={e => setAuthForm(prev => ({...prev, name: e.target.value}))}
                      className="w-full bg-green-500/20 border border-green-400/40 rounded-xl px-4 py-3 text-sm text-white placeholder-green-100/50 focus:outline-none focus:border-green-300 transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Email</label>
                  <input 
                    type="email" 
                    value={authForm.email}
                    onChange={e => setAuthForm(prev => ({...prev, email: e.target.value}))}
                    className="w-full bg-green-500/20 border border-green-400/40 rounded-xl px-4 py-3 text-sm text-white placeholder-green-100/50 focus:outline-none focus:border-green-300 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">Password</label>
                  <input 
                    type="password" 
                    value={authForm.password}
                    onChange={e => setAuthForm(prev => ({...prev, password: e.target.value}))}
                    className="w-full bg-green-500/20 border border-green-400/40 rounded-xl px-4 py-3 text-sm text-white placeholder-green-100/50 focus:outline-none focus:border-green-300 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="text-center space-y-4">
                <button 
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
                    localStorage.setItem('august_logged_in', 'true');
                    setShowAuth(false);
                    setIsSetupComplete(true);
                  }}
                  disabled={!authForm.email || !authForm.password || (authMode === 'signup' && !authForm.name)}
                  className="w-full py-3 bg-green-600 text-white shadow-lg rounded-xl font-bold text-base hover:bg-green-500 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-green-400"
                >
                  {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                </button>
                
                <p className="text-xs text-green-100 font-medium">
                  {authMode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                  <button 
                    onClick={() => setAuthMode(prev => prev === 'signup' ? 'signin' : 'signup')}
                    className="text-white font-bold hover:underline ml-1"
                  >
                    {authMode === 'signup' ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>

                
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPricing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-y-auto"
          >
            <div className="max-w-xs w-full bg-neutral-900/95 border border-neutral-700 p-4 rounded-2xl shadow-2xl relative text-white">

              <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
                <button 
                  onClick={() => setShowPricing(false)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
                  title="Back"
                >
                  <ArrowLeft size={16} /> <span>Back</span>
                </button>
                <button 
                  onClick={() => setShowPricing(false)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white p-1.5 rounded-full transition-colors"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="text-center mb-3">
                <h2 className="text-xl font-bold tracking-tight text-white mb-0.5">August Plans</h2>
                <p className="text-neutral-400 text-[11px] leading-snug">
                  Choose a plan to top up your coins (10c per msg).
                </p>
              </div>

              <div className="space-y-2 mb-3">
                {[
                  { title: 'Starter', price: '1.99', rand: 'R35.00', coins: '100', desc: '100 credits' },
                  { title: 'Basic', price: '3.99', rand: 'R75.00', coins: '400', desc: '400 credits' },
                  { title: 'Standard', price: '5.99', rand: 'R110.00', coins: '600', desc: '600 credits' },
                  { title: 'Pro', price: '9.99', rand: 'R180.00', coins: '1000', desc: '1000 credits' },
                  { title: 'Elite', price: '12.99', rand: 'R235.00', coins: '3000', desc: '3000 credits' },
                ].map((plan) => (
                  <div 
                    key={plan.title} 
                    onClick={() => setSelectedPlanForPayment(plan)}
                    className="p-3 rounded-xl border border-neutral-800 bg-neutral-800/60 hover:bg-neutral-800 hover:border-green-500/50 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <h3 className="font-bold text-white text-xs">{plan.title}</h3>
                      <p className="text-[10px] text-neutral-400">{plan.coins} credits</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-green-400">${plan.price} <span className="text-[10px] font-normal text-neutral-400">({plan.rand})</span></p>
                      <span className="text-[8px] uppercase tracking-wider text-neutral-400 group-hover:text-green-300 font-bold block">Capitec Pay</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2 border-t border-neutral-800">
                <p className="text-[9px] text-neutral-400 italic">
                  Capitec Bank Transfer (Matthews, Acc: 1334067366)
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
      {/* User Profile Modal (Fullscreen with Logout) */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowProfileModal(false); }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-0 md:p-6 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white w-full h-full max-w-4xl mx-auto p-6 md:p-12 relative overflow-y-auto text-neutral-800 flex flex-col justify-center shadow-2xl"
            >
              <button 
                onClick={() => setShowProfileModal(false)}
                className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-700 bg-neutral-100 p-2.5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="max-w-md mx-auto w-full space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 mb-2 text-center">
                  ⚠️ Disclaimer: This application is provided strictly for entertainment and educational purposes.
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-bold">User Profile</h3>
                  <p className="text-xs text-neutral-500 mt-1">Update your personal information & profile picture</p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-green-500 shadow-md bg-neutral-100 mb-2 relative group">
                      {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <User size={36} />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold">
                        Upload Avatar
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
                    <span className="text-xs text-neutral-500 font-medium">Click image to upload avatar</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">First Name</label>
                    <input 
                      type="text" 
                      value={userProfile.firstName}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. John"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Middle Name (Optional)</label>
                    <input 
                      type="text" 
                      value={userProfile.middleName}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, middleName: e.target.value }))}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. Michael"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">Surname</label>
                    <input 
                      type="text" 
                      value={userProfile.surname}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, surname: e.target.value }))}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. Doe"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      localStorage.setItem('august_user_profile', JSON.stringify(userProfile));
                      const welcomeName = userProfile.firstName || 'User';
                      const notifMsg = `🎉 Congratulations ${welcomeName}! Your profile has been successfully saved. Welcome to your AI companion journey!`;
                      setNotifications(prev => [{
                        id: Date.now().toString(),
                        message: notifMsg,
                        timestamp: Date.now(),
                        read: false
                      }, ...prev]);
                      setShowProfileModal(false);
                    }}
                    className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-500 transition-all text-sm mt-4"
                  >
                    Save Changes
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
                    className="w-full py-3.5 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-100 transition-all text-sm mt-2 flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} /> Logout from Account
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capitec Bank Transfer Payment Modal */}
      <AnimatePresence>
        {selectedPlanForPayment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-green-500/10 backdrop-blur-2xl border-2 border-green-400/40 rounded-3xl shadow-[0_8px_32px_0_rgba(74,222,128,0.2)] max-w-lg w-full p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => {
                  setSelectedPlanForPayment(null);
                  setProofFile(null);
                  setReviewStatus('none');
                }}
                className="absolute top-4 right-4 text-white hover:text-green-100 bg-white/20 p-2 rounded-full transition-colors hover:bg-white/30"
              >
                <X size={20} />
              </button>

              {reviewStatus === 'pending' ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-white/50 border border-green-500/50 text-green-700 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                    <Clock size={32} />
                  </div>
                  <h3 className="text-3xl font-['Fraunces'] italic text-white">Verification in Progress</h3>
                  <p className="text-base text-green-50 font-medium leading-relaxed max-w-sm mx-auto">
                    Your proof of payment for the <span className="font-bold text-white">{selectedPlanForPayment.title}</span> plan has been submitted. Review takes <span className="font-bold text-green-300">15–20 minutes max</span>. Your credits will be added automatically once verified.
                  </p>
                  <div className="pt-6">
                    <button
                      onClick={() => {
                        setSelectedPlanForPayment(null);
                        setProofFile(null);
                        setReviewStatus('none');
                        setShowPricing(false);
                        setIsSetupComplete(true);
                      }}
                      className="px-8 py-4 bg-green-600 border border-green-400 text-white rounded-xl text-lg font-bold hover:bg-green-500 transition-all shadow-lg"
                    >
                      Return to Chat
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <span className="text-xs uppercase tracking-wider font-black text-green-900 bg-green-300 border border-green-400 px-3 py-1.5 rounded-full shadow-sm">
                      Capitec Bank Transfer
                    </span>
                    <h2 className="text-3xl font-['Fraunces'] italic mt-4 mb-2 text-white">
                      Pay for {selectedPlanForPayment.title} (${selectedPlanForPayment.price} / {selectedPlanForPayment.rand})
                    </h2>
                    <p className="text-sm font-medium text-green-50">
                      Transfer funds to our official Capitec account and upload your proof of payment.
                    </p>
                  </div>

                  {/* Bank Details Box */}
                  <div className="bg-green-500/20 backdrop-blur-md rounded-2xl p-5 border border-green-400/40 shadow-md mb-6 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-100 font-medium">Bank Name:</span>
                      <span className="font-bold text-white">Capitec Bank</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-100 font-medium">Account Holder:</span>
                      <span className="font-bold text-white">Matthews</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-100 font-medium">Account Number:</span>
                      <span className="font-mono font-black text-black bg-white/90 px-2 py-1 rounded border border-green-200">1334067366</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-green-300 pt-3">
                      <span className="text-green-100 font-medium">Amount Due:</span>
                      <span className="font-black text-green-300 text-base">{selectedPlanForPayment.rand} (${selectedPlanForPayment.price})</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-100 font-medium">Payment Reference:</span>
                      <span className="font-bold text-black bg-green-300 px-2 py-0.5 rounded">{selectedPlanForPayment.title}</span>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-white mb-2">Upload Proof of Payment (Receipt / Screenshot)</label>
                    <div className="border-2 border-dashed border-green-400 bg-green-500/10 hover:bg-green-500/20 hover:border-green-300 rounded-2xl p-6 text-center transition-colors backdrop-blur-md shadow-sm relative group">
                      <input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setProofFile(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-green-500/40 text-green-100 group-hover:bg-green-400 group-hover:text-white transition-colors shadow-sm flex items-center justify-center">
                          <Upload size={20} />
                        </div>
                        {proofFile ? (
                          <p className="text-sm font-bold text-green-300">{proofFile.name}</p>
                        ) : (
                          <>
                            <p className="text-sm font-bold text-white">Click to upload or drag & drop</p>
                            <p className="text-xs font-medium text-green-100">PNG, JPG or PDF up to 10MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedPlanForPayment(null);
                        setProofFile(null);
                      }}
                      className="flex-1 py-4 border-2 border-green-400 bg-transparent rounded-xl text-base font-bold text-white hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!proofFile) {
                          alert("Please upload proof of payment before submitting.");
                          return;
                        }
                        setIsSubmittingProof(true);
                        setTimeout(() => {
                          setIsSubmittingProof(false);
                          setReviewStatus('pending');
                          
                          // Mock pending payment for admin dashboard
                          const newPayment = {
                            id: Date.now().toString(),
                            user: authForm.name || authForm.email || 'Anonymous User',
                            plan: selectedPlanForPayment.title,
                            price: selectedPlanForPayment.price,
                            coins: parseInt(selectedPlanForPayment.coins, 10),
                            fileName: proofFile.name,
                            fileUrl: URL.createObjectURL(proofFile),
                            timestamp: Date.now()
                          };
                          setPendingPayments(prev => [...prev, newPayment]);
                        }, 1200);
                      }}
                      disabled={!proofFile || isSubmittingProof}
                      className="flex-1 py-4 bg-green-600 border border-green-400 text-white shadow-lg rounded-xl text-base font-bold hover:bg-green-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingProof ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Proof of Payment"
                      )}
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-green-200/60 text-center mt-4 italic">
                    Review process takes 15-20 minutes max.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

            <AnimatePresence>
        {showAdminPanel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowAdminPanel(false); }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center p-0 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white w-full h-full max-w-5xl mx-auto p-4 md:p-8 relative overflow-y-auto text-neutral-800 flex flex-col"
            >
              <button 
                onClick={() => setShowAdminPanel(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 bg-neutral-100 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Shield className="text-green-600" />
                Admin Dashboard
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <BarChart2 size={16} />
                    <span className="text-xs font-bold uppercase">Profit</span>
                  </div>
                  <p className="text-2xl font-black">${adminStats.profit.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Users size={16} />
                    <span className="text-xs font-bold uppercase">Online Users</span>
                  </div>
                  <p className="text-2xl font-black">{adminStats.users}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <FileText size={16} />
                    <span className="text-xs font-bold uppercase">Visits</span>
                  </div>
                  <p className="text-2xl font-black">{adminStats.visits}</p>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-4">Pending Payments</h3>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-8 bg-neutral-50 rounded-2xl border border-neutral-100 text-neutral-400">
                  <CheckCircle className="mx-auto mb-2 opacity-50" size={32} />
                  <p className="text-sm font-medium">No pending payments.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPayments.map((payment) => (
                    <div key={payment.id} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold">{payment.user}</p>
                        <p className="text-xs text-neutral-500 mt-1">{payment.plan} (${payment.price}) • {payment.coins} coins</p>
                        <button 
                          onClick={() => setFullscreenProof(payment.fileUrl)}
                          className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          View Proof Document
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            // Approve
                            setAdminStats(prev => ({...prev, profit: prev.profit + parseFloat(payment.price)}));
                            setCoinBalance(prev => prev + payment.coins);
                            setReviewStatus('verified');
                            setShowPricing(false);
                            setSelectedPlanForPayment(null);
                            
                            // Send notification
                            setNotifications(prev => [{
                              id: Date.now().toString(),
                              message: `Your payment of ${payment.price} was approved. You received ${payment.coins} coins!`,
                              timestamp: Date.now(),
                              read: false
                            }, ...prev]);
                            setShowNotifications(true);
                            
                            setPendingPayments(prev => prev.filter(p => p.id !== payment.id));
                          }}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-500 transition-colors"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => {
                            // Reject
                            setReviewStatus('none');
                            setPendingPayments(prev => prev.filter(p => p.id !== payment.id));
                            setNotifications(prev => [{
                              id: Date.now().toString(),
                              message: `Your payment of ${payment.price} was rejected. Please contact support.`,
                              timestamp: Date.now(),
                              read: false
                            }, ...prev]);
                            setShowNotifications(true);
                          }}
                          className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fullscreenProof && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenProof(null)}
            className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative max-w-4xl w-full h-full max-h-[90vh] flex items-center justify-center">
              <button 
                className="absolute top-0 right-0 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              <img 
                src={fullscreenProof} 
                alt="Proof of payment fullscreen" 
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto h-screen flex flex-col p-4 md:p-8">



        {(!isSetupComplete && !showSplash && !showAuth) ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center space-y-8"
          >
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 max-w-sm w-full relative">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create Your AI Friend</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowPricing(true)}
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-105 transition-all text-xs font-black text-white uppercase tracking-wider"
                  >
                    <Sparkles size={12} className="text-yellow-200 animate-pulse" />
                    <span>{coinBalance} Coins</span>
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2.5 bg-gradient-to-tr from-neutral-100 via-neutral-50 to-white hover:from-neutral-200 hover:to-neutral-100 rounded-full shadow-md shadow-neutral-300/80 border border-neutral-300/90 transition-all active:scale-95 text-neutral-700 relative"
                      title="Notifications"
                    >
                      <Bell size={18} />
                      {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden text-left">
                        <div className="p-3 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
                          <span className="text-sm font-bold">Notifications</span>
                          {notifications.length > 0 && (
                            <button 
                              onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
                              className="text-[10px] text-neutral-500 hover:text-neutral-700"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-xs text-neutral-500">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map(notif => (
                              <div 
                                key={notif.id} 
                                className={`p-3 border-b border-neutral-50 text-xs ${notif.read ? 'text-neutral-500' : 'text-neutral-800 bg-green-50/30 font-medium'} cursor-pointer hover:bg-neutral-50`}
                                onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, read: true} : n))}
                              >
                                <p>{notif.message}</p>
                                <p className="text-[9px] text-neutral-400 mt-1">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setShowProfileModal(true)}
                    className="p-2.5 bg-gradient-to-tr from-neutral-100 via-neutral-50 to-white hover:from-neutral-200 hover:to-neutral-100 rounded-full shadow-md shadow-neutral-300/80 border border-neutral-300/90 transition-all active:scale-95 text-neutral-700"
                    title="User Profile"
                  >
                    <User size={18} />
                  </button>
                  {authForm.email.trim().toLowerCase() === 'timegig2026@gmail.com' && (
                    <div className="relative">
                      <button 
                        onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                        className="p-2 bg-gradient-to-b from-neutral-100 to-neutral-200 hover:from-neutral-200 hover:to-neutral-300 rounded-full text-neutral-700 shadow-md shadow-neutral-200 border border-neutral-300 transition-all active:scale-95"
                        title="Admin Menu"
                      >
                        <Shield size={16} />
                      </button>
                      {showMenuDropdown && (
                        <div className="absolute right-4 mt-2 w-48 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
                          <button 
                            onClick={() => { setShowAdminPanel(true); setShowMenuDropdown(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-neutral-50 flex items-center gap-2"
                          >
                            <Shield size={14} /> Admin Panel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-center mb-4 mt-2">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-[#e8f5e9]">
                   <img src={userProfile.avatar || auraAvatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-center mb-1">Create Your AI Friend</h2>
              <p className="text-neutral-500 text-xs text-center mb-6">Personalize your companion before you start chatting.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">Friend's Name</label>
                  <input 
                    type="text" 
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8f5e9] focus:border-[#a5d6a7]"
                    placeholder="e.g. August"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">Relationship Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['mentor', 'teacher', 'rival', 'wealth_strategist', 'religious_guide', 'coding_tutor', 'fitness_coach', 'chef_instructor', 'finance_mentor', 'art_teacher', 'music_sensei', 'science_prof'].map((role) => (
                      <button 
                        key={role}
                        onClick={() => setBotRole(role)}
                        className={`py-2 px-1 rounded-xl border text-[9px] leading-tight transition-all capitalize flex items-center justify-center text-center h-full ${botRole === role ? 'border-[#a5d6a7] bg-[#e8f5e9] text-[#2d3436]' : 'border-neutral-200 hover:bg-neutral-50 text-neutral-500'}`}
                      >
                        {role.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1.5">Friend's Voice & Persona</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setBotGender('female')}
                      className={`py-2 px-3 text-sm rounded-xl border transition-all ${botGender === 'female' ? 'border-[#a5d6a7] bg-[#e8f5e9] text-[#2d3436]' : 'border-neutral-200 hover:bg-neutral-50 text-neutral-500'}`}
                    >
                      Female
                    </button>
                    <button 
                      onClick={() => setBotGender('male')}
                      className={`py-2 px-3 text-sm rounded-xl border transition-all ${botGender === 'male' ? 'border-[#a5d6a7] bg-[#e8f5e9] text-[#2d3436]' : 'border-neutral-200 hover:bg-neutral-50 text-neutral-500'}`}
                    >
                      Male
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    if (coinBalance < 10) {
                      setShowPricing(true);
                    } else {
                      setIsSetupComplete(true);
                    }
                  }}
                  disabled={!botName.trim()}
                  className="w-full py-3 bg-[#2d3436] text-white rounded-xl text-sm font-bold hover:bg-black transition-colors disabled:opacity-50"
                >
                  Start Chatting
                </button>
                <p className="text-[10px] text-center text-neutral-400 mt-2 uppercase tracking-widest font-medium">
                  Note: For entertainment purposes only
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {coinBalance < 20 && (
  <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-4 py-2.5 rounded-2xl shadow-lg mb-4 flex items-center justify-between text-xs font-bold animate-pulse">
    <div className="flex items-center gap-2">
      <Sparkles size={16} className="text-yellow-200 animate-spin" />
      <span>⚠️ Low Coin Balance ({coinBalance} coins left)! Top up now to avoid interruption.</span>
    </div>
    <button 
      onClick={() => setShowPricing(true)}
      className="bg-white text-neutral-900 px-3 py-1 rounded-xl text-xs font-black shadow hover:bg-neutral-100 transition-all uppercase tracking-wider"
    >
      Top Up
    </button>
  </div>
)}
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSetupComplete(false)}
                  className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
                  title="Back to setup"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img
                      src={auraAvatar}
                      alt={botName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div>
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">{botName}</h1>
                  <p className="text-sm text-neutral-500 flex items-center gap-1">
                    <Sparkles size={12} className={isLiveConnected ? "text-amber-400" : "text-neutral-300"} />
                    {isLiveConnected ? "AI Live Studio • Online" : "Vercel AI Engine • Online"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 items-center relative shrink-0">
                <button 
                  onClick={() => setShowPricing(true)}
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-105 transition-all text-xs font-black text-white uppercase tracking-wider shrink-0"
                  title="Coin Balance - Click to Top Up"
                >
                  <Sparkles size={14} className="text-yellow-200 animate-pulse" />
                  <span>{coinBalance} Coins</span>
                </button>

                {/* 3-Dot Menu Button */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowThreeDotMenu(!showThreeDotMenu);
                      setShowNotifications(false);
                    }}
                    className="p-2.5 bg-gradient-to-tr from-neutral-100 via-neutral-50 to-white hover:from-neutral-200 hover:to-neutral-100 rounded-full shadow-md shadow-neutral-300/80 border border-neutral-300/90 transition-all active:scale-95 text-neutral-800 relative"
                    title="Menu Options"
                  >
                    <MoreVertical size={20} className="text-neutral-700 hover:text-neutral-900" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                    )}
                  </button>

                  {/* 3-Dot Dropdown Popup */}
                  {showThreeDotMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 overflow-hidden p-1.5 space-y-1 text-left">
                      <button 
                        onClick={() => { setShowProfileModal(true); setShowThreeDotMenu(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-neutral-100 rounded-lg text-neutral-700">
                            <User size={15} />
                          </div>
                          <span>User Profile</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-normal">{userProfile.firstName || 'View'}</span>
                      </button>

                      <button 
                        onClick={() => { setShowNotifications(!showNotifications); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                            <Bell size={15} />
                          </div>
                          <span>Notifications</span>
                        </div>
                        {notifications.filter(n => !n.read).length > 0 ? (
                          <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-extrabold rounded-full">
                            {notifications.filter(n => !n.read).length}
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-400 font-normal">None</span>
                        )}
                      </button>

                      <button 
                        onClick={() => { setShowChatBox(!showChatBox); setShowThreeDotMenu(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${showChatBox ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-500'}`}>
                            <MessageSquare size={15} />
                          </div>
                          <span>Text Chat Mode</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${showChatBox ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'}`}>
                          {showChatBox ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      <button 
                        onClick={() => { setAutoSpeak(!autoSpeak); primeSpeech(); setShowThreeDotMenu(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${autoSpeak ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-400'}`}>
                            {autoSpeak ? <Volume2 size={15} /> : <VolumeX size={15} />}
                          </div>
                          <span>AI Bot Voice</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${autoSpeak ? 'bg-blue-100 text-blue-800' : 'bg-neutral-100 text-neutral-500'}`}>
                          {autoSpeak ? 'ON' : 'MUTED'}
                        </span>
                      </button>

                      <button 
                        onClick={() => { setIsSetupComplete(false); setShowThreeDotMenu(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-neutral-100 rounded-lg text-neutral-700">
                            <Settings size={15} />
                          </div>
                          <span>Bot Personalization</span>
                        </div>
                      </button>

                      {authForm.email.trim().toLowerCase() === 'timegig2026@gmail.com' && (
                        <button 
                          onClick={() => { setShowAdminPanel(true); setShowThreeDotMenu(false); }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border-t border-neutral-100 mt-1 pt-1.5"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                              <Shield size={15} />
                            </div>
                            <span>Admin Panel</span>
                          </div>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Notifications Popover */}
                  {showNotifications && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 overflow-hidden text-left">
                      <div className="p-3 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
                        <span className="text-sm font-bold">Notifications</span>
                        {notifications.length > 0 && (
                          <button 
                            onClick={() => {
                              setNotifications(prev => prev.map(n => ({...n, read: true})));
                            }}
                            className="text-[10px] text-neutral-500 hover:text-neutral-700"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-neutral-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div 
                              key={notif.id} 
                              className={`p-3 border-b border-neutral-50 text-xs ${notif.read ? 'text-neutral-500' : 'text-neutral-800 bg-green-50/30 font-medium'} cursor-pointer hover:bg-neutral-50`}
                              onClick={() => {
                                setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, read: true} : n));
                              }}
                            >
                              <p>{notif.message}</p>
                              <p className="text-[9px] text-neutral-400 mt-1">
                                {new Date(notif.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </header>

            {/* Chat Area / Glow View */}
            {showChatBox ? (
              <main
                ref={scrollRef}
                className="flex-1 overflow-y-auto pr-2 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-neutral-200"
              >
              <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                    m.role === 'user'
                      ? 'bg-[#2d3436] text-white rounded-tr-none'
                      : 'bg-white border border-neutral-100 text-[#2d3436] rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoadingResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-4"
              >
                <div className="max-w-[85%] rounded-2xl px-5 py-3 shadow-sm bg-white border border-neutral-100 text-[#2d3436] rounded-tl-none flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500 animate-spin" />
                  <span className="text-xs font-medium text-neutral-500">{botName} is thinking...</span>
                </div>
              </motion.div>
            )}
            {currentBotText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] rounded-2xl px-5 py-3 shadow-sm bg-white border border-neutral-100 text-[#2d3436] rounded-tl-none">
                  <p className="leading-relaxed whitespace-pre-wrap">{currentBotText}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center relative p-8">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`w-72 h-72 rounded-full blur-3xl opacity-40 transition-all duration-1000 ${isAiSpeaking ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500 scale-125 animate-pulse' : 'bg-gradient-to-r from-emerald-200 to-teal-200 scale-100'}`}></div>
                  <div className={`w-48 h-48 rounded-full blur-2xl opacity-60 transition-all duration-750 ${isAiSpeaking ? 'bg-gradient-to-tr from-amber-400 via-rose-400 to-violet-500 animate-ping' : 'bg-green-100'}`}></div>
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
        <footer className="mt-8 relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={coinBalance < 10 ? "Upgrade to chat..." : (isListening ? "Listening..." : `Tell ${botName} something...`)}
              disabled={coinBalance < 10}
              className={`w-full bg-white border ${isListening ? 'border-rose-300 ring-2 ring-rose-100' : 'border-neutral-200'} rounded-2xl px-6 py-4 pr-24 focus:outline-none focus:ring-2 focus:ring-[#e8f5e9] focus:border-[#a5d6a7] transition-all shadow-sm placeholder:text-neutral-400 disabled:bg-neutral-50 disabled:cursor-not-allowed`}
            />
            <div className="absolute right-3 flex items-center gap-2">
              <button
                onClick={toggleListening}
                disabled={coinBalance < 10}
                className={`p-3 rounded-xl transition-all ${
                  isListening 
                    ? 'bg-rose-100 text-rose-500 hover:bg-rose-200 animate-pulse' 
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
                title={coinBalance < 10 ? "Insufficient balance" : `Dictate to ${botName}`}
              >
                {isListening ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                onClick={handleSend}
                disabled={isLoadingResponse || (!input.trim() && !isListening) || coinBalance < 10}
                className="p-3 bg-[#2d3436] text-white rounded-xl hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-center mt-3 text-neutral-400 tracking-wider uppercase font-medium">
            Shared with care by {botName} • Entertainment purposes only
          </p>
        </footer>
        )}
      </div>
    )}
  </div>
</div>
</div>
);
}
