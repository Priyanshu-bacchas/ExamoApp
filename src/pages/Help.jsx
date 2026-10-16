import { useMemo, useState } from "react";

import {
  Search,
  ChevronDown,
  Mail,
  MessageCircle,
  GraduationCap,
  CalendarDays,
  Laptop,
  CircleCheck,
} from "lucide-react";

import "./HelpSubscription.css";

const featuredFaq = [
  {
    title: "Student Basics",
    icon: GraduationCap,
    tone: "mint",
    links: [
      "How to set up my student profile?",
      "How to add subjects and schedules?",
      "How to upload my documents?",
    ],
  },
  {
    title: "Exam Enrollment",
    icon: CalendarDays,
    tone: "lavender",
    links: [
      "How do I fill an exam form?",
      "Where can I track my exam dates?",
      "How to check my results?",
    ],
  },
  {
    title: "Technical Issues",
    icon: Laptop,
    tone: "sky",
    links: [
      "I can't log in to my account",
      "My document upload is failing",
      "The page is not loading properly",
    ],
  },
];

const faqs = [
  {
    q: "How to reset my password?",
    a: "Go to the login page, click on 'Forgot password' and enter your registered email or mobile number. We will send you a link to set a new password.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI, debit cards, credit cards and net banking for all paid plans.",
  },
  {
    q: "How can I change or cancel my plan?",
    a: "Open the Subscription page from the sidebar. You can switch between the Monthly and Yearly plans, or go back to the Basic plan anytime.",
  },
  {
    q: "Is my data and uploaded documents safe?",
    a: "Yes. Your exams, subjects, schedules and documents are visible only to your account.",
  },
  {
    q: "How do I download my payment receipt?",
    a: "Go to Subscription > Previous Payments and click the Download button next to the payment.",
  },
];

function Help({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(0);

  const [contact, setContact] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const filteredFaqs = useMemo(() => {
    const text = query.trim().toLowerCase();

    if (!text) return faqs;

    return faqs.filter(
      (item) =>
        item.q.toLowerCase().includes(text) ||
        item.a.toLowerCase().includes(text)
    );
  }, [query]);

  function handleChange(e) {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
    setSent(false);
  }

  // Sirf frontend: abhi backend call nahi hai
  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
    setContact({ name: "", email: "", subject: "", message: "" });
  }

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
          {featuredFaq.map((card) => {
            const Icon = card.icon;

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

        <h2 className="hs-heading">Frequently Asked Questions</h2>

        <div className="hs-accordion">
          {filteredFaqs.length === 0 && (
            <div className="hs-empty">
              No results found. Try a different keyword.
            </div>
          )}

          {filteredFaqs.map((item, index) => {
            const open = openIndex === index;

            return (
              <div
                className={`hs-acc-item ${open ? "open" : ""}`}
                key={item.q}
              >
                <button
                  type="button"
                  className="hs-acc-head"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                >
                  <span>{item.q}</span>
                  <ChevronDown size={18} />
                </button>

                {open && <div className="hs-acc-body">{item.a}</div>}
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

        <form className="hs-contact" onSubmit={handleSubmit}>
          <h3>Contact Us</h3>

          <label>
            Name
            <input
              name="name"
              value={contact.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              name="email"
              value={contact.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Subject
            <input
              name="subject"
              value={contact.subject}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Message
            <textarea
              name="message"
              rows={5}
              placeholder="Message"
              value={contact.message}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="hs-btn">
            Submit
          </button>

          {sent && (
            <div className="hs-success">
              <CircleCheck size={16} />
              Thanks! Your message has been submitted.
            </div>
          )}
        </form>

        <div className="hs-contact-links">
          <div>
            <Mail size={16} />
            <strong>Email Support</strong>
            <span>support@examo.com</span>
          </div>

          <div>
            <MessageCircle size={16} />
            <strong>Live Chat</strong>
            <span>Available 9 AM - 6 PM</span>
          </div>
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
    </div>
  );
}

export default Help;
