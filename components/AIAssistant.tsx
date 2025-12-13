import React, { useState, useRef, useEffect } from 'react';
import { InventoryItem } from '../types';
import { getFabLabAdvice } from '../services/geminiService';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface AIAssistantProps {
  inventory: InventoryItem[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ inventory }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: "Bonjour ! Je suis l'assistant du FabLab. Je connais tout l'inventaire. Demandez-moi si nous avons des pièces pour un projet, ou où se trouve un outil !" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getFabLabAdvice(userMsg.content, inventory);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Désolé, j'ai rencontré une erreur de connexion." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
            <Bot className="w-6 h-6" />
        </div>
        <div>
            <h2 className="font-bold text-slate-800">FabAssistant</h2>
            <p className="text-xs text-slate-500">Propulsé par Gemini 2.5 Flash</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-indigo-600" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-indigo-100">
                    <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span className="text-xs text-slate-400">Réflexion en cours...</span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-shadow"
            placeholder="Posez une question sur le stock (ex: 'Puis-je construire un robot ?')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
