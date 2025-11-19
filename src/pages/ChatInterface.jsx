import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Menu, X, LogOut, Trash2, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { useFlash } from "../context/FlashContext";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { PriceChartCard } from '../components';


const API_URL = import.meta.env.VITE_BACKEND_URI || "http://127.0.0.1:5000";

const ChatInterface = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setFlashMessage } = useFlash();
  const { theme, toggleTheme } = useTheme();

  const { userData, token } = useSelector((state) => state.auth);
  const userId = userData?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 🎤 Voice Recognition + TTS
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const recognitionRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false); // 🔊 AI voice playback
  const speechRef = useRef(null);

  // ✅ Scroll automatically
  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 70);
  };

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { if (userId) loadConversations(); }, [userId]);

  const authHeader = { headers: { Authorization: `Bearer ${token}` },withCredentials: true, };
  

  // ✅ Initialize Speech Recognition
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      setFlashMessage("🎤 Voice input not supported in this browser.", "warning");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = selectedLanguage;

    recognitionRef.current.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputMessage(transcript);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      if (inputMessage.trim().length > 0) {
        sendMessage(); // ✅ Auto-send after speech ends
      }
    };
  }, [selectedLanguage]);


  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const speakResponse = (text) => {
    if (!("speechSynthesis" in window)) {
      setFlashMessage("🔇 Speech synthesis not supported in this browser.", "warning");
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.pitch = 1;
    utterance.rate = 1;

    speechRef.current = utterance;
    setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopVoicePlayback = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };



    // ✅ Load All Chats
    const loadConversations = async () => {
      try {
        const res = await axios.get(`${API_URL}/conversations/${userId}`);
        const list = res.data.conversations || [];

        setConversations(list);

        // ⭐ Auto-open latest conversation
        if (list.length > 0) {
          const latest = list[0]; // since you already push newest first
          loadConversation(latest.id);
        }

      } catch (error) {
        console.error("Error loading conversations:", error);
        setFlashMessage("❌ Failed to load chats", "error");
      }
    };



  // ✅ Load Chat Messages
  const loadConversation = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/conversation/${id}`, authHeader);

      const restored = (res.data.messages || []).map(m => ({
        role: m.role,
        content: m.content,
        products: m.products || [],
        price_history: m.price_history || null,
        price_prediction: m.price_prediction || null,
        reviews: m.reviews || null,
      }));

      setMessages(restored);
      setCurrentConversationId(id);

    } catch {
      setFlashMessage("Failed to open chat!", "error");
    }
  };


  // ✅ Create New Chat
const createNewConversation = async () => {
  try {
    const res = await axios.post(`${API_URL}/conversation`, {
      user_id: userId,
      title: "New Chat",
    });

    const newConv = res.data.conversation;

    setConversations(prev => [newConv, ...prev]);
    loadConversation(newConv.id)
    speakResponse(messages[0])

    setCurrentConversationId(newConv.id);
    setFlashMessage("✅ New chat started", "success");

  } catch (error) {
    console.error("Error creating conversation:", error);
    setFlashMessage("❌ Failed to create chat", "error");
  }
};



  const autoResizeTextarea = () => {
    const t = textareaRef.current;
    if (!t) return;
    t.style.height = "40px";
    t.style.height = Math.min(t.scrollHeight, 150) + "px";
  };

  // ✅ Send Message
const sendMessage = async () => {
  if (!inputMessage.trim()) return;

  const userMsg = { role: "user", content: inputMessage };

  setMessages(prev => [...prev, userMsg]);
  setInputMessage("");
  setIsLoading(true);

  try {
    let convId = currentConversationId;

    // Create new conversation automatically
    if (!convId) {
      const res = await axios.post(`${API_URL}/conversation`, {
        user_id: userId,
        title: userMsg.content.slice(0, 50),
      });
      convId = res.data.conversation.id;
      setCurrentConversationId(convId);
      loadConversations();
    }

        const userMsgsCount = messages.filter(m => m.role === "user").length;

    // only update title on FIRST user message
    if (userMsgsCount === 0) {
      try {
        await axios.put(`${API_URL}/conversation/${convId}`, {
          title: userMsg.content.slice(0, 50),
        });

        // update title in UI
        setConversations(prev =>
          prev.map(conv =>
            conv.id === convId
              ? { ...conv, title: userMsg.content.slice(0, 50) }
              : conv
          )
        );
      } catch (titleErr) {
        console.error("Error updating conversation title:", titleErr);
      }
    }

    // Send message to backend
    const aiRes = await axios.post(`${API_URL}/message`, {
      conversation_id: convId,
      user_id: userId,
      message: userMsg.content,
      lang: selectedLanguage,
    });

    const data = aiRes.data;

    if (data.products && data.products.length > 0) {

      const botMessage = {
        role: "assistant",
        content: data.response || "Here are some results:",
        products: data.products,     // product cards
      };

      setMessages(prev => [...prev, botMessage]);
      speakResponse(botMessage.content);
      setIsLoading(false);
      return;
    }

    // ----------------------------------------------------------
    // 2️⃣ REVIEW ANALYSIS (Sentiment chart + review buckets)
    // ----------------------------------------------------------
    if (data.reviews || data.sentiment_chart_svg) {

      const botMessage = {
        role: "assistant",
        content: data.response || "",
        review_data: data.review_data || {},
        sentiment_chart_svg: data.sentiment_chart_svg || null,
        sentiment_chart_thumb: data.sentiment_chart_thumb || null,
        sentiment_counts: data.sentiment_counts || {},
      };

      setMessages(prev => [...prev, botMessage]);
      speakResponse(botMessage.content);
      setIsLoading(false);
      return;
    }

    // ----------------------------------------------------------
    // 3️⃣ PRICE HISTORY CHART (ML simulated)
    // ----------------------------------------------------------
    if (data.price_history) {

      const botMessage = {
        role: "assistant",
        content: data.response || "",
        price_history: data.price_history,   // full chart data
      };

      setMessages(prev => [...prev, botMessage]);
      speakResponse(botMessage.content);
      setIsLoading(false);
      return;
    }

    // ----------------------------------------------------------
    // 4️⃣ PRICE PREDICTION CHART (future days)
    // ----------------------------------------------------------
    if (data.price_prediction) {

      const botMessage = {
        role: "assistant",
        content: data.response || "",
        price_prediction: data.price_prediction,
      };

      setMessages(prev => [...prev, botMessage]);
      speakResponse(botMessage.content);
      setIsLoading(false);
      return;
    }

    // ----------------------------------------------------------
    // 5️⃣ NORMAL LLM MESSAGE (no tools used)
    // ----------------------------------------------------------
    const botMsg = {
      role: "assistant",
      content: data.response || "⚠️ No response",
    };

    setMessages(prev => [...prev, botMsg]);
    speakResponse(botMsg.content);

  } catch (error) {
    console.error("Error:", error);

    setMessages(prev => [
      ...prev,
      { role: "assistant", content: "⚠️ Something went wrong" },
    ]);
  }

  setIsLoading(false);
};




  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/conversation/${id}`, authHeader);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (id === currentConversationId) {
        setMessages([]);
        setCurrentConversationId(null);
      }
      setFlashMessage("🗑️ Chat deleted", "success");
    } catch {
      setFlashMessage("❌ Delete failed", "error");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setFlashMessage("Logged out ✅", "info");
    navigate("/signin");
  };
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-72" : "w-0"} transition-all bg-gray-900 text-white`}>
        <div className="p-3 border-b border-gray-700">
          <button
            onClick={createNewConversation}
            className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-medium flex gap-2 justify-center shadow"
          >
            <Plus /> New Chat
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group ${
                currentConversationId === conv.id ? "bg-gray-700" : "hover:bg-gray-800"
              }`}
            >
              <span className="truncate flex-1">{conv.title}</span>
              <button
                onClick={(e) => deleteConversation(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium flex gap-2 justify-center"
          >
            <LogOut /> Logout
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b p-3 bg-white dark:bg-gray-900 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          <h1 className="font-bold text-xl text-gray-800 dark:text-gray-200 flex-1">ShopMate AI</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-200 dark:bg-gray-700"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-700" />}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 max-w-2xl rounded-2xl shadow ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-white dark:bg-gray-900 border text-gray-800 dark:text-gray-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* 🛍️ Product Recommendation Grid */}
                {msg.price_history && (
                  <PriceChartCard data={msg.price_history} />
                )}

                {msg.price_prediction && (
                  <PriceChartCard data={msg.price_prediction} />
                )}
              {/* 🛍️ Product Recommendation Grid */}
              {msg.products && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                  {msg.products.map((p, i) => (
                    <div
                      key={i}
                      className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 bg-white dark:bg-gray-900 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                      {/* 🖼️ Product Image */}
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-44 object-contain mb-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-2"
                        />
                      ) : (
                        <div className="w-full h-44 flex items-center justify-center text-gray-400 italic">
                          No image available
                        </div>
                      )}

                      {/* 🏷️ Product Title */}
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 line-clamp-2">
                        {p.title}
                      </h3>

                      {/* 💰 Price */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {p.price || "Price not available"}
                      </p>

                      {/* ⭐ Rating */}
                      {p.rating && (
                        <p className="text-yellow-500 text-sm mt-1">
                          {p.rating}
                        </p>
                      )}

                      {/* 🔗 View Product */}
                      {p.link ? (
                        <a
                          href={p.link.startsWith("http") ? p.link : `https://${p.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto block text-center mt-3 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors duration-300"
                        >
                          View Product →
                        </a>
                      ) : (
                        <p className="text-gray-400 text-sm italic mt-2 text-center">
                          Link unavailable
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}



              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-900 border rounded-lg px-3 py-2 flex gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-white dark:bg-gray-900 p-3">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="self-start px-3 py-1 rounded-lg border bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-200 text-sm"
            >
              <option value="en-US">English 🇺🇸</option>
              <option value="hi-IN">Hindi 🇮🇳</option>
              <option value="kn-IN">Kannada 🇮🇳</option>
            </select>

            <div className="flex items-end gap-2">
              <button
                onClick={toggleVoiceInput}
                className={`p-3 rounded-xl transition ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                }`}
              >
                🎤
              </button>

              {isSpeaking && (
                <button
                  onClick={stopVoicePlayback}
                  className="p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition animate-pulse"
                  title="Stop AI Voice"
                >
                  🛑
                </button>
              )}

              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  autoResizeTextarea();
                }}
                onKeyDown={handleKey}
                placeholder="Ask anything..."
                className="flex-1 resize-none border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring focus:border-purple-500"
                rows={1}
              />

              <button
                disabled={isLoading || !inputMessage.trim()}
                onClick={sendMessage}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-xl transition"
              >
                <Send />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
