import { useEffect, useState } from "react";

import {
  Search,
  ChevronDown,
  Mail,
  MessageCircle,
  GraduationCap,
  CalendarDays,
  Laptop,
} from "lucide-react";

import { getHelpContent, searchHelp } from "../services/helpService";
import ContactForm from "../components/ContactForm";
import HelpChatbot from "../components/HelpChatbot";

import "./HelpSubscription.css";

// Card ke icons (title se match hote hain)
const cardIcons = {
  "Student Basics": GraduationCap,
  "Exam Enrollment": CalendarDays,
  "Technical Issues": Laptop,
};

// Backend na mile to ye dikhega
const fallbackFeatured = [
  {
    title: "Student Basics",
    tone: "mint",
    links: [
      "How to use this website?",
      "What does the Dashboard show?",
      "How to upload my documents?",
    ],
  },
  {
    title: "Exam Enrollment",
    tone: "lavender",
    links: [
      "How do I add an exam form?",
      "How do I change my exam form status?",
      "How to check my results?",
    ],
  },
  {
    title: "Technical Issues",
    tone: "sky",
    links: [
      "I can't log in to my account",
      "My document upload is failing",
      "The page is not loading properly",
    ],
  },
];

const fallbackFaqs = [
  {
    id: 1,
    question: "How to use this website?",
    answer:
      "Sign up and log in, open Jobs and click 'Add to ExamForm' on the exam you want. It is added to Exam Forms, Exams, Preparation and Results automatically. Then open Exam Forms, fill the form on the official website and change its status from Pending to Filled.",
  },
  {
    id: 2,
    question: "How do I add an exam form?",
    answer:
      "Exam forms are added from the Jobs page. Open Jobs > Latest Jobs and click 'Add to ExamForm' next to the exam.",
  },
  {
    id: 3,
    question: "How do I change my exam form status?",
    answer:
      "Go to Student > Exam Forms, fill the form using the Open link, then click Edit and change the status from Pending to Filled.",
  },
  {
    id: 4,
    question: "How to reset my password?",
    answer:
      "On the login page click 'Forgot Password?', enter your registered email and we will send a 6-digit code. Enter the code, choose a new password and log in with it.",
  },
  {
    id: 5,
    question: "What payment methods are accepted?",
    answer:
      "We accept UPI, debit cards, credit cards and net banking for all paid plans.",
  },
];

function Help({ onNavigate }) {
  const [featured, setFeatured] = useState(fallbackFeatured);
  const [faqs, setFaqs] = useState(fallbackFaqs);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null); // null = search nahi ho raha
  const [searchMessage, setSearchMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);


  // Featured cards + FAQ backend se
  useEffect(() => {
    let cancelled = false;

    getHelpContent()
      .then((data) => {
        if (cancelled || !data) return;

        if (Array.isArray(data.featured) && data.featured.length) {
          setFeatured(data.featured);
        }

        if (Array.isArray(data.faqs) && data.faqs.length) {
          setFaqs(data.faqs);
        }
      })
      .catch(() => {
        // Backend nahi mila: fallback content dikhega
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Search: type karne ke 0.35 sec baad backend se jawab
  useEffect(() => {
    const text = query.trim();

    setOpenIndex(0);

    if (!text) {
      setResults(null);
      setSearchMessage("");
      setSearching(false);
      return undefined;
    }

    let cancelled = false;
    setSearching(true);

    const timer = setTimeout(async () => {
      try {
        const data = await searchHelp(text);

        if (cancelled) return;

        setResults(Array.isArray(data?.results) ? data.results : []);
        setSearchMessage(data?.message || "");
      } catch {
        if (cancelled) return;

        // Backend na chale to local FAQ me dhoondho
        const lower = text.toLowerCase();

        setResults(
          faqs.filter(
            (item) =>
              item.question.toLowerCase().includes(lower) ||
              item.answer.toLowerCase().includes(lower)
          )
        );
        setSearchMessage("");
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const visibleFaqs = results ?? faqs;

  return (
    <div className="hs-page">
      <div className="hs-main">
        <section className="hs-hero">
          <div className="hs-hero-title">
            <span className="hs-hero-icon">
              <MessageCircle size={26} />
            </span>

            <h1>How can we help you today?</h1>
          </div>

          <div className="hs-search">
            <input
              type="text"
              placeholder="Search for help..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button type="button" aria-label="Search">
              <Search size={18} />
            </button>
          </div>
        </section>

        <h2 className="hs-heading">Featured FAQ</h2>

        <div className="hs-card-grid">
          {featured.map((card) => {
            const Icon = cardIcons[card.title] || GraduationCap;

            return (
              <div className="hs-faq-card" key={card.title}>
                <div className={`hs-faq-card-head ${card.tone}`}>
                  <h3>{card.title}</h3>
                  <Icon size={34} strokeWidth={1.6} />
                </div>

                <ul>
                  {card.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => setQuery(link)}
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <h2 className="hs-heading">
          {results !== null
            ? "Answers for your search"
            : "Frequently Asked Questions"}
        </h2>

        <div className="hs-accordion">
          {searching && results === null && (
            <div className="hs-empty">Searching...</div>
          )}

          {!searching && visibleFaqs.length === 0 && (
            <div className="hs-empty">
              {searchMessage ||
                "No results found. Try a different keyword."}
            </div>
          )}

          {visibleFaqs.map((item, index) => {
            const open = openIndex === index;

            return (
              <div
                className={`hs-acc-item ${open ? "open" : ""}`}
                key={item.id ?? item.question}
              >
                <button
                  type="button"
                  className="hs-acc-head"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                >
                  <span>{item.question}</span>
                  <ChevronDown size={18} />
                </button>

                {open && (
                  <div className="hs-acc-body">{item.answer}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <aside className="hs-side">
        <h2>Still need help?</h2>

        <p className="hs-side-text">
          Send us your question and our support team will get back
          to you.
        </p>

        <ContactForm />

        <div className="hs-contact-links">
          <div>
            <Mail size={16} />
            <strong>Email Support</strong>
            <span>examoaspirant@gmail.com</span>
          </div>

          <button
            type="button"
            className="hs-chat-open"
            onClick={() => setChatOpen(true)}
          >
            <MessageCircle size={16} />
            <strong>Chat with Examo Assistant</strong>
            <span>Instant answers, available 24/7</span>
          </button>
        </div>

        {onNavigate && (
          <button
            type="button"
            className="hs-link-btn"
            onClick={() => onNavigate("subscription")}
          >
            View subscription details
          </button>
        )}
      </aside>

      <HelpChatbot
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        faqs={faqs}
        onContact={() =>
          document
            .querySelector(".hs-side")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      />
    </div>
  );
}

export default Help;
