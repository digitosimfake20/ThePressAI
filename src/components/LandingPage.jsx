import React, { useState } from "react";
import { motion } from "framer-motion";
import TypingAnimation from "./TypingAnimation";
import "./styles/LandingPage.css";

export default function LandingPage({ onEnter }) {
  const [value, setValue] = useState("");
  const trending = [
    "Ngân 98 bị bắt — kiểm chứng ngay",
    "Giá xăng tăng mạnh hôm nay",
    "Sự kiện thời sự nóng: cuộc họp khẩn",
    "Tin lan truyền: Công ty A phá sản?",
  ];

  function submit() {
    const trimmed = value.trim();
    onEnter(trimmed || trending[0]);
  }

  return (
    <div className="landing-root">
      {/* Header with Auth Buttons */}
      <motion.header
        className="landing-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="header-content">
          <motion.div
            className="logo"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="logo-text">PressAI</span>
            <span className="logo-dot"></span>
          </motion.div>
          <div className="auth-buttons">
            <motion.button
              className="auth-btn signin-btn"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Đăng nhập
            </motion.button>
            <motion.button
              className="auth-btn signup-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Đăng ký
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Floating Decorative Elements */}
      <div className="floating-elements">
        <motion.div
          className="floating-circle circle-1"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="floating-circle circle-2"
          animate={{
            y: [0, 15, 0],
            x: [0, -10, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="floating-circle circle-3"
          animate={{
            y: [0, -25, 0],
            rotate: [0, -180, -360]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="landing-card">
        <motion.div
          className="landing-left"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h2
            className="landing-hello"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            PressAI có thể giúp bạn như thế nào hôm nay?
          </motion.h2>

          <motion.div
            className="landing-typing"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <TypingAnimation lines={trending} speed={45} pause={1700} />
            <div className="typing-sub">Tin tức thịnh hành tự động — cập nhật liên tục</div>
          </motion.div>

          <motion.div
            className="landing-input-wrap"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Nhập tiêu đề, nội dung hoặc dán link... (vd: Ngân 98 bị bắt)"
              className="landing-input"
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
            <motion.button
              className="landing-btn"
              onClick={submit}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(37,99,235,0.3)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Kiểm chứng
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div
          className="landing-right"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.div
            className="welcome-message"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Chào mừng đến với PressAI
            </motion.h3>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              Xác minh tin tức và kiểm chứng sự thật với phân tích AI từ nhiều nguồn đáng tin cậy.
            </motion.p>
            <motion.div
              className="feature-list"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <motion.div
                className="feature-item"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                🔍 Xác minh đa nguồn
              </motion.div>
              <motion.div
                className="feature-item"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                🤖 Phân tích AI thông minh
              </motion.div>
              <motion.div
                className="feature-item"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                📊 Đánh giá độ tin cậy
              </motion.div>
              <motion.div
                className="feature-item"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                🌐 Kiểm chứng thời gian thực
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
