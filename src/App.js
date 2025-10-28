import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "./components/LandingPage";
import ChatPage from "./components/ChatPage";
import "./App.css";

export default function App() {
  const [stage, setStage] = useState("landing"); // 'landing' | 'chat'
  const [initialPrompt, setInitialPrompt] = useState("");

  const goToChat = (prompt) => {
    setInitialPrompt(prompt || "");
    setStage("chat");
  };

  return (
    <div className="app-root">
      <AnimatePresence mode="wait">
        {stage === "landing" ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage onEnter={goToChat} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <ChatPage initialPrompt={initialPrompt} onBack={() => setStage("landing")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
