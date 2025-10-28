import React, { useEffect, useState } from "react";

/**
 * props:
 *  - lines: array of strings to type (loop)
 *  - speed: ms per char
 *  - pause: ms between lines
 */
export default function TypingAnimation({ lines = [], speed = 40, pause = 1500 }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    if (!lines || lines.length === 0) return;
    if (typing) {
      if (charIndex < lines[lineIndex].length) {
        const t = setTimeout(() => {
          setDisplay((s) => s + lines[lineIndex][charIndex]);
          setCharIndex((i) => i + 1);
        }, speed);
        return () => clearTimeout(t);
      } else {
        // finished current line -> pause then start deleting
        const t = setTimeout(() => setTyping(false), pause);
        return () => clearTimeout(t);
      }
    } else {
      // deleting
      if (charIndex > 0) {
        const t = setTimeout(() => {
          setDisplay((s) => s.slice(0, -1));
          setCharIndex((i) => i - 1);
        }, 24);
        return () => clearTimeout(t);
      } else {
        // move to next line
        setLineIndex((li) => (li + 1) % lines.length);
        setTyping(true);
      }
    }
  }, [lines, lineIndex, charIndex, typing, speed, pause]);

  return <span className="typing-text">{display}<span className="typing-cursor">|</span></span>;
}
