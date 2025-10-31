import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./styles/ChatPage.css";

export default function ChatPage({ initialPrompt = "", onBack }) {
  const [input, setInput] = useState(initialPrompt || "");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const recRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (initialPrompt) {
      // auto-send initial prompt (simulate user pressing enter)
      handleSend(initialPrompt);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // simple speech recognition for demo
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    recRef.current = new SR();
    recRef.current.lang = "vi-VN";
    recRef.current.interimResults = true;
    recRef.current.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join("");
      setInput(text);
    };
    recRef.current.onend = () => setIsRecording(false);
  }, []);

  const startRec = () => {
    if (!recRef.current) return alert("Trình duyệt không hỗ trợ ghi âm");
    recRef.current.start();
    setIsRecording(true);
  };
  const stopRec = () => {
    if (!recRef.current) return;
    recRef.current.stop();
    setIsRecording(false);
  };

  const handleSend = async (textArg) => {
    const text = (textArg !== undefined) ? textArg : input.trim();
    if (!text) return;
    const userMsg = { id: Date.now() + Math.random(), who: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    console.log("Sending query to backend:", text);

    try {
      const response = await fetch("http://localhost:3001/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received response from backend:", data);

      const ai = {
        id: Date.now() + Math.random(),
        who: "ai",
        data: data,
      };
      setMessages((m) => [...m, ai]);
    } catch (error) {
      console.error("Error calling backend:", error);
      const errorMsg = {
        id: Date.now() + Math.random(),
        who: "ai",
        data: {
          reliability: 0,
          verdict: "Error",
          summary: "Unable to verify this information. Please check your backend connection.",
          highlights: ["Backend error"],
          sources: [],
        },
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatpage-root">
      <div className="chatpage-container">
        <aside className="chat-history">
          <h4>Lịch sử trò chuyện (HIỆN TẠI CHƯA HOẠT ĐỘNG ĐƯỢC)</h4>
          <div className="history-list">
            <div className="history-item">
              <div className="title">Kiểm chứng tin tức về COVID</div>
              <div className="time">2 giờ trước</div>
            </div>
            <div className="history-item">
              <div className="title">Xác minh bài báo chính trị</div>
              <div className="time">Hôm qua</div>
            </div>
            <div className="history-item">
              <div className="title">Kiểm tra nguồn tin tức</div>
              <div className="time">3 ngày trước</div>
            </div>
          </div>
        </aside>

        <div className="chat-main">
          <div className="chat-header">
            <button className="back-btn" onClick={onBack}>← Back</button>
            <div className="header-title">PressAI — Kiểm chứng tin tức</div>
            <div className="header-spacer" />
          </div>

          <div className="chat-stream" ref={scrollRef}>
            {messages.length === 0 && <div className="empty-hint">Hãy nhập nội dung để kiểm chứng — PressAI sẽ tìm nguồn và tóm tắt.</div>}

            {messages.map((m) =>
              m.who === "user" ? (
                <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bubble user">
                  {m.text}
                </motion.div>
              ) : (
              <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bubble ai">
                <div className="ai-top">
                  <div className="ai-label">Kết quả kiểm chứng</div>
                  <div className="ai-score">{m.data.reliability ?? 0}%</div>
                  <button className="detail-btn" onClick={() => setShowDetail(m)}>Xem chi tiết</button>
                </div>

                <div className="ai-summary">
                  {typeof m.data.summary === "string"
                    ? m.data.summary
                    : JSON.stringify(m.data.summary)}
                </div>

                {/* Highlights */}
                <div className="ai-highlights">
                  {Array.isArray(m.data.highlights)
                    ? m.data.highlights.map((h, i) => (
                        <span key={i} className="tag">{String(h)}</span>
                      ))
                    : <span className="tag">Không có điểm nổi bật</span>}
                </div>

                {/* Sources */}
                <div className="ai-sources">
                  {Array.isArray(m.data.sources)
                    ? m.data.sources.map((s, i) =>
                        typeof s === "object" && s !== null ? (
                          <a key={i} href={s.url || "#"} target="_blank" rel="noreferrer">
                            {s.title || "Nguồn không xác định"}
                          </a>
                        ) : (
                          <span key={i}>{String(s)}</span>
                        )
                      )
                    : <span className="muted">Không có nguồn xác minh</span>}
                </div>
              </motion.div>

              )
            )}

            {loading && <div className="loading-note">PressAI đang truy vấn nguồn...</div>}
          </div>

          <div className="chat-input-area">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin cần kiểm chứng hoặc dán link..."
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            />
            <div className="input-actions">
              <button className={`mic ${isRecording ? "on" : ""}`} onClick={() => (isRecording ? stopRec() : startRec())}>{isRecording ? "●" : "🎤"}</button>
              <button className="send" onClick={() => handleSend()}>Check</button>
            </div>
          </div>
        </div>

        <aside className="chat-side">
          <div className="side-card">
            <h4>Phân tích nhanh</h4>
            <p className="muted">PressAI sẽ hiển thị tóm tắt, điểm nổi bật và nguồn liên quan.</p>
            <div className="side-list">
              <div className="side-item"><strong>Sources</strong><div className="small">VnExpress • BBC • ChínhPhủ</div></div>
              <div className="side-item"><strong>Model</strong><div className="small">GPT (demo) / Classifier</div></div>
            </div>
          </div>

          <div className="side-card tips">
            <h4>Tips</h4>
            <ul>
              <li>Đặt câu ngắn gọn, có tên, địa điểm, thời gian.</li>
              <li>Nếu là ảnh chụp màn hình, dán link nguồn nếu có.</li>
            </ul>
          </div>
        </aside>
      </div>

      {showDetail && (
        <motion.div
          className="detail-popup"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <button className="close-btn" onClick={() => setShowDetail(null)}>X</button>
          <h3>Chi tiết kiểm chứng</h3>
          <div className="detail-summary">{showDetail.data.summary}</div>
          <div className="detail-reliability">
            <div className="reliability-display">
              <span className="true-percent">{showDetail.data.reliability}% True</span>
              <span className="false-percent">{100 - showDetail.data.reliability}% False</span>
            </div>
            <div className="reliability-bar">
              <div
                className="true-bar"
                style={{ width: `${showDetail.data.reliability}%` }}
              ></div>
              <div
                className="false-bar"
                style={{ width: `${100 - showDetail.data.reliability}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
