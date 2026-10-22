import { useEffect, useState } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";

import { sendContactMessage } from "../services/supportService";
import { getUser, getDisplayName } from "../services/authService";

// Help page ka "Contact Us" form (same design, ab backend me save hota hai)
// Name aur Email login wale account se aate hain (read-only). Backend bhi
// inhe client se nahi leta, JWT wale user ke account se hi save karta hai.
function ContactForm() {
  const user = getUser();
  const accountName = getDisplayName(user);
  const accountEmail = user?.email || user?.Email || "";

  const [contact, setContact] = useState({
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Success / error message kuch seconds baad apne aap hat jaye
  useEffect(() => {
    if (!sent && !error) return;

    const timer = setTimeout(() => {
      setSent(false);
      setError("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [sent, error]);

  function handleChange(e) {
    const { name, value } = e.target;

    setContact((prev) => ({ ...prev, [name]: value }));
    setSent(false);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (sending) return;

    const payload = {
      subject: contact.subject.trim(),
      message: contact.message.trim(),
    };

    if (payload.message.length < 10) {
      setSent(false);
      setError("Message must be at least 10 characters.");
      return;
    }

    setSending(true);
    setSent(false);
    setError("");

    try {
      await sendContactMessage(payload);

      setSent(true);

      // Subject aur message saaf (naam/email account se aate hain)
      setContact({ subject: "", message: "" });
    } catch (err) {
      setError(
        err?.message || "Could not send your message. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="hs-contact" onSubmit={handleSubmit}>
      <h3>Contact Us</h3>

      <label>
        Name
        <input
          name="name"
          value={accountName}
          readOnly
          disabled
          title="Name is taken from your account"
        />
      </label>

      <label>
        Email Address
        <input
          type="email"
          name="email"
          value={accountEmail}
          readOnly
          disabled
          title="Email is taken from your account"
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

      <button type="submit" className="hs-btn" disabled={sending}>
        {sending ? "Sending..." : "Submit"}
      </button>

      {sent && (
        <div className="hs-success">
          <CircleCheck size={16} />
          Your message has been submitted successfully.
        </div>
      )}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 13,
          }}
        >
          <TriangleAlert size={16} />
          {error}
        </div>
      )}
    </form>
  );
}

export default ContactForm;