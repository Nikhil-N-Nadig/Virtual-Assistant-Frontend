import React from 'react';
import { ShoppingBag, ArrowRight, Sparkles, MessageCircle, Package } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-500 to-orange-400 flex items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-6xl text-center">
        
        {/* Logo + Title */}
        <div className="mb-10 animate-slide-up">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
              <ShoppingBag className="w-16 h-16 text-white drop-shadow-md" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            ShopMate AI
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto">
            Your Smart Shopping Companion Powered by AI 🛍️✨
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 px-3">
          {[
            {
              icon: <MessageCircle className="w-12 h-12 text-white mb-4" />,
              title: "24/7 AI Support",
              text: "Instant answers for your shopping needs"
            },
            {
              icon: <Sparkles className="w-12 h-12 text-white mb-4" />,
              title: "Smart Suggestions",
              text: "AI recommends the perfect products for you"
            },
            {
              icon: <Package className="w-12 h-12 text-white mb-4" />,
              title: "Live Order Tracking",
              text: "Track your purchases in real-time"
            }
          ].map((f, i) => (
            <div key={i}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 
              hover:bg-white/20 transition transform hover:scale-105 duration-300 shadow-lg">
              {f.icon}
              <h3 className="text-lg font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-white/85 text-sm">{f.text}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
          <button
            onClick={() => navigate("/signup")}
            className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg 
            shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate("/signin")}
            className="bg-white/20 backdrop-blur-lg text-white px-8 py-4 rounded-full font-bold text-lg 
            border border-white/40 hover:bg-white/30 transition-all"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
