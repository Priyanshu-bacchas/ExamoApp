import { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Mail,
  MessageCircle,
  Headphones,
  X,
} from "lucide-react";

import { getHelpContent, searchHelp } from "../services/helpService";
import ContactForm from "../components/ContactForm";
import HelpChatbot from "../components/HelpChatbot";

import "./HelpSubscription.css";

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

function Help() {
  const [faqs, setFaqs] = useState(fallbackFaqs);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searchMessage, setSearchMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Keep the help articles available to the search fallback and Examo chatbot.
  useEffect(() => {
    let cancelled = false;

    getHelpContent()
      .then((data) => {
        if (!cancelled && Array.isArray(data?.faqs) && data.faqs.length) {
          setFaqs(data.faqs);
        }
      })
      .catch(() => {
        // Local help content remains available when the API is unreachable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Search remains live as the user types; results appear only when a query exists.
  useEffect(() => {
    const text = query.trim();

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

        const lower = text.toLowerCase();
        setResults(
          faqs.filter(
            (item) =>
              String(item.question || "").toLowerCase().includes(lower) ||
              String(item.answer || "").toLowerCase().includes(lower)
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
  }, [query, faqs]);

  function handleSearchSubmit(event) {
    event.preventDefault();
  }

  return (
    <div className="hs-page">
      <section className="hs-hero">
        <div className="hs-hero-title">
          <span className="hs-hero-icon">
            <Headphones size={25} strokeWidth={2} />
          </span>
          <h1>How can we help you today?</h1>
        </div>

        <p className="hs-hero-description">
          Search for help, guides or common issues and get quick support.
        </p>

        <form className="hs-search" onSubmit={handleSearchSubmit} role="search">
          <Search className="hs-search-leading" size={21} />
          <input
            type="search"
            placeholder="Search for help..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search help articles"
          />
          {query && (
            <button
              type="button"
              className="hs-search-clear"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            >
              <X size={17} />
            </button>
          )}
          <button type="submit" className="hs-search-submit" aria-label="Search">
            <Search size={19} />
          </button>
        </form>
      </section>

      {query.trim() && (
        <section className="hs-search-results" aria-live="polite">
          <div className="hs-search-results-heading">
            <h2>{searching ? "Searching for answers..." : "Search results"}</h2>
            <button type="button" onClick={() => setQuery("")}>
              Clear
            </button>
          </div>

          {!searching && results?.length === 0 && (
            <p className="hs-search-empty">
              {searchMessage || "No matching help articles found. Try another keyword."}
            </p>
          )}

          {!searching &&
            results?.map((item, index) => (
              <article className="hs-search-result" key={item.id ?? item.question ?? index}>
                <h3>{item.question || "Help article"}</h3>
                <p>{item.answer || item.content || ""}</p>
              </article>
            ))}
        </section>
      )}

      <section className="hs-support-intro">
        <span className="hs-support-intro-icon">
          <MessageCircle size={22} />
        </span>
        <div>
          <h2>Still need help?</h2>
          <p>Send us your question and our support team will get back to you.</p>
        </div>
      </section>

      <ContactForm />

      <div className="hs-contact-links">
        <button
          type="button"
          className="hs-contact-action hs-chat-open"
          onClick={() => setChatOpen(true)}
        >
          <span className="hs-action-icon">
            <MessageCircle size={27} />
          </span>
          <span className="hs-action-copy">
            <strong>Chat with Examo Assistant</strong>
            <span>Instant answers, available 24/7</span>
          </span>
          <ChevronRight className="hs-action-arrow" size={23} />
        </button>

        <a
          className="hs-contact-action hs-email-open"
          href="mailto:examoaspirant@gmail.com"
        >
          <span className="hs-action-icon">
            <Mail size={27} />
          </span>
          <span className="hs-action-copy">
            <strong>Email Support</strong>
            <span>examoaspirant@gmail.com</span>
          </span>
          <ChevronRight className="hs-action-arrow" size={23} />
        </a>
      </div>

      <HelpChatbot
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        faqs={faqs}
        onContact={() =>
          document
            .querySelector(".hs-contact")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      />
    </div>
  );
}

export default Help;
