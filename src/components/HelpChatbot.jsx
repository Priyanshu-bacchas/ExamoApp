import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, RotateCcw } from "lucide-react";

import { searchHelp } from "../services/helpService";

import "./HelpChatbot.css";

// Shuru me dikhne wale quick sawal (ye FAQ ke asli sawal hain)
const QUICK_QUESTIONS = [
  "How to use this website?",
  "How do I add an exam form?",
  "How do I change my exam form status?",
  "How to check my results?",
  "How does the free trial work?",
  "I can't log in to my account",
];

// Text ko saaf karo: lowercase, emoji/punctuation hatao, extra space hatao
function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(norm) {
  return norm ? norm.split(" ").length : 0;
}

// Greeting: hi, hii, hello, hey, namaste, good morning ... (pura message greeting ho)
const GREETING_RE =
  /^(h+i+|h+y+|h+e+y+|h+e+l+o+|h+l+o+|h+e+l+l+o+|hola|namaste|namaskar|pranam|good (morning|afternoon|evening)|gm)(\s+(there|bot|assistant|examo|sir|madam|mam|bro|bhai|everyone|all|dost))*$/;

// Short ack words: ok, okay, thik hai, got it, cool ...
const ACK_WORD_RE = /^(o+k+|o+k+a+y+|o+k+k+|k+|hm+|h+m+|o+h+|ohh+)$/;
const ACK_WORDS = new Set([
  "thik",
  "theek",
  "hai",
  "h",
  "acha",
  "accha",
  "achha",
  "got",
  "it",
  "gotcha",
  "cool",
  "nice",
  "great",
  "fine",
  "alright",
  "sure",
  "done",
  "good",
  "perfect",
  "awesome",
  "yes",
  "yeah",
  "yep",
  "haan",
  "ha",
  "hmm",
  "samajh",
  "gaya",
  "gayi",
  "aa",
  "ho",
]);

function isAck(norm) {
  const words = norm.split(" ").filter(Boolean);

  if (!words.length || words.length > 4) return false;

  return words.every((w) => ACK_WORD_RE.test(w) || ACK_WORDS.has(w));
}

const THANKS_RE =
  /\b(t+h+a+n+k+s*|thank ?you|thank ?u|thanku|thx|tnx|tysm|ty|shukriya|shukria|dhanyavad|dhanyawad|dhanyvaad)\b/;

const GREETING_REPLY =
  "Hi! I'm the Examo Assistant. Ask me anything about using Examo, like adding exams from Jobs, exam form status, results, plans or login help.";

const THANKS_REPLY = "Thank you! Ask me if you need anything else.";

// Seedhe jawab wale intent (backend search se pehle).
// test(norm) me norm = saaf kiya hua lowercase text
const INTENTS = [
  {
    test: (norm) => GREETING_RE.test(norm),
    reply: GREETING_REPLY,
    chips: true,
  },
  {
    test: (norm) =>
      wordCount(norm) <= 4 &&
      /\b(bye|goodbye|see you|tata|good night)\b/.test(norm),
    reply: "Goodbye! All the best for your exam preparation.",
  },
  {
    // thanks / thank you / ok / okay / thik hai ... sabka ek jaisa jawab
    test: (norm) =>
      isAck(norm) || (wordCount(norm) <= 4 && THANKS_RE.test(norm)),
    reply: THANKS_REPLY,
  },
  {
    test: (norm) =>
      /\b(who are you|your name|what are you|tum kaun|aap kaun)\b/.test(norm),
    reply:
      "I'm the Examo Assistant, a small help bot. I answer questions about this website using the Examo help articles.",
  },
  {
    test: (norm) => /^(help|menu|options|topics)$/.test(norm),
    reply: "Here are some things you can ask me:",
    chips: true,
  },
  {
    // "how to use / kaise use kare / guide / tutorial"
    test: (norm) =>
      /\b(how (to|do i|can i) use|how (does|do) (it|this|examo|the (website|app)) work|kaise (use|kaam|chalaye)|guide|tutorial)\b/.test(
        norm
      ),
    ask: "How to use this website?",
  },
];

// Backend na chale to local FAQ me dhoondho
function localSearch(text, faqs) {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);

  if (!words.length) return [];

  return faqs
    .map((faq) => {
      const hay = `${faq.question} ${faq.answer}`.toLowerCase();

      const score = words.reduce(
        (sum, w) =>
          sum +
          (faq.question.toLowerCase().includes(w) ? 3 : 0) +
          (hay.includes(w) ? 1 : 0),
        0
      );

      return { faq, score };
    })
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.faq);
}

// "1) ... 2) ..." wale jawab ko alag lines me tod do
function answerLines(text) {
  return String(text)
    .replace(/\s+(\d{1,2}\))\s/g, "\n$1 ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

let nextId = 1;

function makeMessage(from, data) {
  return { id: nextId++, from, ...data };
}

function HelpChatbot({ open, onClose, faqs = [], onContact }) {
  // Shuru me chat khali rahegi, bot tabhi bolega jab user pehle bole
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const busyRef = useRef(false);

  // Naya message aaye to scroll: bot ka jawab uski pehli line se dikhe
  useEffect(() => {
    const el = bodyRef.current;

    if (!el) return;

    const last = el.querySelector('[data-last="true"]');
    const lastMsg = messages[messages.length - 1];

    if (!typing && messages.length > 1 && lastMsg?.from === "bot" && last) {
      el.scrollTop = Math.max(0, last.offsetTop - 12);
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typing, open]);

  // Khulte hi input par focus, Esc se band
  useEffect(() => {
    if (!open) return undefined;

    const timer = setTimeout(() => inputRef.current?.focus(), 150);

    function onKey(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function pushBot(data) {
    setMessages((list) => [...list, makeMessage("bot", data)]);
  }

  async function ask(rawText) {
    const text = rawText.trim();

    if (!text || busyRef.current) return;

    busyRef.current = true;

    setMessages((list) => [...list, makeMessage("user", { text })]);
    setInput("");
    setTyping(true);

    // Thoda ruko taaki bot "soch raha" lage
    const pause = new Promise((resolve) => setTimeout(resolve, 450));

    let reply;

    try {
      const norm = normalize(text);
      const intent = INTENTS.find((item) => item.test(norm));

      let query = text;

      if (intent && intent.reply) {
        reply = {
          text: intent.reply,
          chips: intent.chips ? QUICK_QUESTIONS : undefined,
        };
      } else {
        if (intent && intent.ask) query = intent.ask;

        let results = [];

        try {
          const data = await searchHelp(query);

          results = Array.isArray(data?.results) ? data.results : [];
        } catch {
          results = localSearch(query, faqs);
        }

        if (results.length) {
          const [best, ...others] = results;

          reply = {
            title: best.question,
            lines: answerLines(best.answer),
            chips: others.slice(0, 2).map((x) => x.question),
            chipsLabel: others.length ? "Related questions" : "",
          };
        } else {
          reply = {
            text: "Sorry, I couldn't find an answer to that. Try asking in different words, pick one of these topics, or send a message to our support team.",
            chips: QUICK_QUESTIONS.slice(0, 4),
            contact: true,
          };
        }
      }
    } catch {
      reply = {
        text: "Something went wrong. Please try again in a moment.",
      };
    }

    await pause;

    setTyping(false);
    pushBot(reply);

    busyRef.current = false;
  }

  function handleSubmit(event) {
    event.preventDefault();
    ask(input);
  }

  function reset() {
    if (busyRef.current) return;

    setMessages([]);
    setInput("");
  }

  if (!open) return null;

  return (
    <div
      className="hbot"
      role="dialog"
      aria-label="Examo Assistant chat"
    >
      <div className="hbot-head">
        <span className="hbot-avatar">
          <Bot size={20} />
        </span>

        <div className="hbot-head-text">
          <strong>Examo Assistant</strong>
          <small>
            <i className="hbot-dot" />
            Online, instant answers
          </small>
        </div>

        <button
          type="button"
          className="hbot-icon-btn"
          onClick={reset}
          title="Start over"
          aria-label="Start over"
        >
          <RotateCcw size={16} />
        </button>

        <button
          type="button"
          className="hbot-icon-btn"
          onClick={onClose}
          title="Close"
          aria-label="Close chat"
        >
          <X size={18} />
        </button>
      </div>

      <div className="hbot-body" ref={bodyRef}>
        {messages.map((msg, index) => (
          <div
            className={`hbot-row ${msg.from}`}
            key={msg.id}
            data-last={index === messages.length - 1 ? "true" : undefined}
          >
            {msg.from === "bot" && (
              <span className="hbot-mini-avatar">
                <Bot size={14} />
              </span>
            )}

            <div className="hbot-col">
              <div className={`hbot-bubble ${msg.from}`}>
                {msg.title && (
                  <strong className="hbot-title">{msg.title}</strong>
                )}

                {msg.lines
                  ? msg.lines.map((line, i) => <p key={i}>{line}</p>)
                  : msg.text && <p>{msg.text}</p>}
              </div>

              {msg.contact && onContact && (
                <button
                  type="button"
                  className="hbot-chip contact"
                  onClick={() => {
                    onClose();
                    onContact();
                  }}
                >
                  Send a message to support
                </button>
              )}

              {msg.chips && msg.chips.length > 0 && (
                <div className="hbot-chips">
                  {msg.chipsLabel && (
                    <span className="hbot-chips-label">{msg.chipsLabel}</span>
                  )}

                  {msg.chips.map((chip) => (
                    <button
                      type="button"
                      className="hbot-chip"
                      key={chip}
                      disabled={typing}
                      onClick={() => ask(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="hbot-row bot">
            <span className="hbot-mini-avatar">
              <Bot size={14} />
            </span>

            <div className="hbot-bubble bot hbot-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <form className="hbot-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          maxLength={300}
          placeholder="Type your question..."
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          type="submit"
          disabled={!input.trim() || typing}
          aria-label="Send"
        >
          <Send size={17} />
        </button>
      </form>

      <div className="hbot-foot">
        Answers come from the Examo help articles.
      </div>
    </div>
  );
}

export default HelpChatbot;
