import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, X, Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, CloudRain, Droplets, ShieldAlert, Thermometer, Wind } from 'lucide-react';
import api, { errorMessage } from '../api';

const QUICK_PROMPTS = [
  "Will it rain today?",
  "Check precipitation timeline",
  "What is the current flood risk?",
  "Is there a rain warning?"
];

export default function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Operational SkyIntel Weather Intelligence system initialized. Ready to consult.', agent: 'Rain & Weather Intelligence Expert' },
  ]);
  const [loading, setLoading] = useState(false);

  // Speech API states
  const [voiceOn, setVoiceOn] = useState(false);
  const [ttsOn, setTtsOn] = useState(true);
  const [recognition, setRecognition] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Speech Recognition hook
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setQuery(text);
        setVoiceOn(false);
      };

      rec.onerror = () => {
        setVoiceOn(false);
      };

      rec.onend = () => {
        setVoiceOn(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (voiceOn) {
      recognition.stop();
      setVoiceOn(false);
    } else {
      setVoiceOn(true);
      recognition.start();
    }
  };

  const handleSpeak = (text) => {
    if (!ttsOn) return;
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel(); // stop previous speech
      const cleanText = text.replace(/<[^>]*>/g, ''); // strip inline components tags
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      synth.speak(utterance);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    triggerSubmit(query);
  };

  const triggerSubmit = async (textToSend) => {
    setQuery('');
    setMessages((prev) => [...prev, { role: 'user', text: textToSend }]);
    setLoading(true);

    try {
      const res = await api.post('/assistant/query', {
        query: textToSend,
      });

      const data = res.data;
      const responseText = data.response || data.answer;
      const decisionEngineData = data.decision_engine || data.decision_metrics;

      // Simulated ChatGPT-like streaming effect
      let currentLength = 0;
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        text: '', 
        agent: data.agent_used || 'Rain & Weather Intelligence Expert', 
        decisionEngine: decisionEngineData 
      }]);
      
      const interval = setInterval(() => {
        currentLength += 8;
        if (currentLength >= responseText.length) {
          clearInterval(interval);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].text = responseText;
            return updated;
          });
          handleSpeak(responseText);
          setLoading(false);
        } else {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].text = responseText.slice(0, currentLength);
            return updated;
          });
        }
      }, 30);

    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: `System consult failed: ${errorMessage(err)}`, agent: 'SystemError' }]);
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    if (loading) return;
    triggerSubmit(promptText);
  };

  return (
    <>
      {/* Floating Assist Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 border border-sky-400 text-white shadow-2xl hover:scale-105 transition"
        >
          <MessageSquare className="h-6 w-6 animate-pulse" />
        </button>
      )}

      {/* Floating Chatbot Container */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[380px] h-[520px] rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300">
          
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-sky-900 p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Bot className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-heading text-xs font-bold text-white tracking-wider uppercase">SkyIntel AI Assistant</h4>
                <p className="text-[9px] text-sky-400 font-extrabold font-mono">RAIN INTELLIGENCE EXPERT</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* TTS Toggler */}
              <button
                onClick={() => setTtsOn(!ttsOn)}
                className={`p-1.5 rounded-lg border text-xs transition ${
                  ttsOn ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
                title={ttsOn ? 'Voice response enabled' : 'Voice response muted'}
              >
                {ttsOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50/50 flex flex-col">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <div className={`flex gap-2.5 items-start ${isUser ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold border ${
                      isUser 
                        ? 'bg-sky-600 border-sky-400 text-white' 
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    }`}>
                      {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>

                    {/* Bubble content */}
                    <div className={`p-3 rounded-2xl text-[11px] font-medium leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                    }`}>
                      {msg.text ? (
                        <span className="whitespace-pre-line">{msg.text}</span>
                      ) : (
                        <div className="flex gap-1 py-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Telemetry Card Widget */}
                  {!isUser && msg.decisionEngine && (
                    <div className="ml-9 rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2 w-72 text-[10px] shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-extrabold text-sky-400 flex items-center gap-1 uppercase tracking-wider text-[8px]">
                          <Sparkles className="h-3 w-3 text-sky-400 animate-pulse" /> METEOROLOGICAL TELEMETRY
                        </span>
                        <span className="px-2 py-0.5 rounded-[4px] text-[8px] font-mono font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                          Active Scan
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-slate-700">
                        <div className="bg-slate-50 rounded-xl p-2 flex flex-col items-center justify-center border border-slate-150 text-center">
                          <span className="text-slate-500 text-[7px] uppercase font-bold tracking-wider">Rain Probability</span>
                          <span className="text-slate-800 text-xs font-extrabold font-mono mt-0.5">{msg.decisionEngine.rain_probability}%</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2 flex flex-col items-center justify-center border border-slate-150 text-center">
                          <span className="text-slate-500 text-[7px] uppercase font-bold tracking-wider">Rainfall Rate</span>
                          <span className="text-slate-800 text-xs font-extrabold font-mono mt-0.5">{msg.decisionEngine.rainfall} mm/h</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2 flex flex-col items-center justify-center border border-slate-150 text-center">
                          <span className="text-slate-500 text-[7px] uppercase font-bold tracking-wider">ML Confidence</span>
                          <span className="text-slate-800 text-xs font-extrabold font-mono mt-0.5">{msg.decisionEngine.confidence_score}%</span>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-2 flex flex-col items-center justify-center border border-slate-150 text-center">
                          <span className="text-slate-500 text-[7px] uppercase font-bold tracking-wider">Flood Hazard</span>
                          <span className={`text-[10px] font-extrabold mt-0.5 ${msg.decisionEngine.flood_risk_score > 40 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {msg.decisionEngine.flood_risk}
                          </span>
                        </div>
                      </div>

                      {/* Small visual bar for severity */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[7px] font-extrabold text-slate-400 uppercase tracking-wider">
                          <span>Atmospheric Severity Index</span>
                          <span className="font-mono">{msg.decisionEngine.weather_severity_score}/100</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className="bg-gradient-to-r from-sky-500 via-yellow-500 to-rose-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${msg.decisionEngine.weather_severity_score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            {QUICK_PROMPTS.map((promptText, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickPrompt(promptText)}
                disabled={loading}
                className="shrink-0 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-300 text-[9px] font-bold text-slate-600 hover:text-sky-700 transition duration-150 cursor-pointer disabled:opacity-50"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Form input bar */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl border transition ${
                voiceOn ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
              title="Voice Input"
            >
              {voiceOn ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask SkyIntel weather intelligence..."
              className="flex-1 bg-transparent border-none text-[11px] text-slate-800 placeholder:text-slate-400 outline-none font-medium py-2"
            />

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="primary-button p-2.5 rounded-xl text-xs py-2 px-3 shadow"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
