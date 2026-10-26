import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Send, Globe, Bot, User as UserIcon, Loader2, ExternalLink } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { uri: string; title: string }[];
}

export default function SmartSearch() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "I couldn't find any information on that.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = chunks
        ?.filter(chunk => chunk.web)
        .map(chunk => ({
          uri: chunk.web!.uri,
          title: chunk.web!.title || 'Source'
        }));

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: text,
        sources: sources && sources.length > 0 ? sources : undefined
      }]);
    } catch (error) {
      console.error('Search error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error while searching. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <Globe size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Smart Web Search</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Powered by Google Search</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Search size={40} />
            </div>
            <div className="max-w-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-2">How can I help you today?</h3>
              <p className="text-sm text-gray-400">Ask me anything about your business, market trends, or general information. I'll search the web for the most accurate answers.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mt-8">
              {[
                "Latest market price of rice in Bangladesh",
                "How to improve DSO performance?",
                "Weather forecast for Jamalpur",
                "Best agricultural practices for 2026"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="p-4 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-2xl text-xs font-bold text-gray-500 transition-all text-left border border-transparent hover:border-blue-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-[#FF6B00] text-white' : 'bg-[#3B55A4] text-white'
              }`}>
                {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl space-y-3 ${
                msg.role === 'user' 
                  ? 'bg-[#FF6B00] text-white rounded-tr-none' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                
                {msg.sources && (
                  <div className="pt-3 border-t border-gray-200/50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 bg-white/50 hover:bg-white rounded-md text-[10px] font-bold text-blue-600 transition-all border border-blue-100"
                        >
                          <ExternalLink size={10} />
                          <span className="truncate max-w-[150px]">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center text-gray-400">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <span className="text-xs font-bold animate-pulse">Searching the web...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-gray-50/50 border-t border-gray-50">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search anything with Google..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-white border-none rounded-2xl pl-6 pr-16 py-4 text-sm font-bold text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
