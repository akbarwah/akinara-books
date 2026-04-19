'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Halo Bunda! 👋 Aku Nala. Ada buku anak yang sedang dicari, atau mau Nala bantu beri rekomendasi hari ini?'
};

// --- PENGATURAN WAKTU KADALUARSA MEMORI CHAT ---
// Set di angka 3 jam (3 jam * 60 menit * 60 detik * 1000 milidetik)
const EXPIRATION_TIME = 3 * 60 * 60 * 1000;

// --- FUNGSI PENYIHIR LINK WA ---
const formatText = (text: string) => {
  // 1. Bersihkan tanda bintang bawaan AI
  const cleanText = text.replace(/\*/g, '');

  // 2. Deteksi teks yang berawalan https:// atau wa.me/
  const urlRegex = /(https?:\/\/[^\s]+|wa\.me\/[^\s]+)/g;

  // 3. Pecah teks dan ubah URL menjadi tag <a> yang bisa diklik
  return cleanText.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      // Pastikan formatnya https agar tidak error saat diklik
      const href = part.startsWith('wa.me') ? `https://${part}` : part;
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline font-semibold hover:text-blue-800 transition-colors"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export default function ChatbotWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. MENGAMBIL MEMORI & CEK KADALUARSA
  useEffect(() => {
    setIsMounted(true);
    const savedData = localStorage.getItem('akinara_chat_history');

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        // Pastikan memori memiliki timestamp (format baru)
        if (parsed.lastUpdated && parsed.messages) {
          const now = Date.now();
          // Cek apakah chat sudah basi (melebihi EXPIRATION_TIME)
          if (now - parsed.lastUpdated > EXPIRATION_TIME) {
            localStorage.removeItem('akinara_chat_history');
            setMessages([INITIAL_MESSAGE]);
          } else {
            setMessages(parsed.messages);
          }
        } else {
          // Jika ini format lama (sebelum ada fitur auto-clear), reset saja
          localStorage.removeItem('akinara_chat_history');
          setMessages([INITIAL_MESSAGE]);
        }
      } catch (error) {
        setMessages([INITIAL_MESSAGE]);
      }
    } else {
      setMessages([INITIAL_MESSAGE]);
    }
  }, []);

  // 2. MENYIMPAN MEMORI + TIMESTAMP
  useEffect(() => {
    if (isMounted && messages.length > 0) {
      const dataToSave = {
        messages: messages,
        lastUpdated: Date.now() // Catat waktu terakhir interaksi
      };
      localStorage.setItem('akinara_chat_history', JSON.stringify(dataToSave));
    }
  }, [messages, isMounted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const textToSend = inputValue;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: textToSend };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: aiMessageId, role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Gagal terhubung ke server');
      if (!response.body) throw new Error('Tidak ada respon stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, content: msg.content + chunk } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("🔴 AI Error:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: 'Maaf Bunda, koneksi Nala sedang terputus. Mohon coba lagi ya 🙏' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  if (!isMounted) return null;
  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ${isOpen ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#8B5E3C] hover:bg-[#6D4C41] text-white animate-bounce-slow'
          }`}
      >
        {isOpen ? (
          <>
            <X className="w-5 h-5" /> <span className="font-bold text-sm tracking-wide">Tutup</span>
          </>
        ) : (
          <>
            <MessageCircle className="w-5 h-5" /> <span className="font-bold text-sm tracking-wide">Tanya Nala</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] w-[90vw] max-w-95 h-125 bg-white rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-orange-100 animate-slide-in-right">

          <div className="bg-gradient-to-r from-[#8B5E3C] to-[#a0724f] p-4 flex items-center gap-3 shadow-md relative z-10">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner shrink-0 animate-float">
              <Bot className="w-6 h-6 text-[#8B5E3C]" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg leading-tight">Nala</h3>
              <p className="text-orange-200 text-xs font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Asisten AI Akinara
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFF9F0]">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] shadow-sm text-sm leading-relaxed ${m.role === 'user'
                    ? 'bg-[#FF9E9E] text-white rounded-tr-sm'
                    : 'bg-white border border-orange-100 text-[#6D4C41] rounded-tl-sm'
                  }`}>
                  {/* EKSEKUSI FUNGSI FORMAT TEXT DI SINI */}
                  <span className="whitespace-pre-wrap">{formatText(m.content)}</span>
                  {isLoading && m.role === 'assistant' && !m.content && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin text-orange-400" /> Nala mengetik...
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-orange-100 flex gap-2 items-end">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={200} // FITUR KEAMANAN: Batas maksimal karakter
              placeholder="Ketik pesan..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-200 transition-all text-gray-700 resize-none min-h-[44px] max-h-24 overflow-y-auto"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="w-11 h-11 bg-[#8B5E3C] hover:bg-[#6D4C41] text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-[#8B5E3C] shrink-0 mb-0.5"
            >
              <Send className="w-5 h-5 -ml-0.5" />
            </button>
          </form>

        </div>
      )}

      <style jsx>{`
        .animate-slide-in-right {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}