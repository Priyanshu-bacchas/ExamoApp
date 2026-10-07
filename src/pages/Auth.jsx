import { useState } from "react";
import {
  Laptop,
  Smartphone,
  Clock,
  BookOpen,
  CalendarDays,
  Award,
  Pencil,
} from "lucide-react";

import { login, register } from "../services/authService";
import "./Auth.css";

/* ---------- Small helpers ---------- */

const EyeIcon = ({ open }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
    )}
  </svg>
);

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);

  return (
    <div className="ex-pw">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
      <button
        type="button"
        className="ex-eye"
        onClick={() => setShow(!show)}
        aria-label="Toggle password visibility"
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

function Brand() {
  return (
    <div className="ex-brand">
      <div className="ex-logo">E</div>
      <div>
        <div className="ex-brand-name">Examo</div>
        <div className="ex-brand-sub">Student Management</div>
      </div>
    </div>
  );
}

/* ---------- Illustration (student + floating icons) ---------- */

const TILES = [
  { Icon: Clock, label: "Schedules", top: "2%", left: "42%", size: 54, color: "#2563eb", delay: "0s", dur: "5s" },
  { Icon: BookOpen, label: "Subjects", top: "15%", left: "5%", size: 58, color: "#7c3aed", delay: "0.6s", dur: "6s" },
  { Icon: Laptop, label: "Online Exams", top: "45%", left: "-1%", size: 62, color: "#0ea5e9", delay: "1.2s", dur: "5.5s" },
  { Icon: CalendarDays, label: "Calendar", top: "13%", left: "79%", size: 56, color: "#f59e0b", delay: "0.3s", dur: "6.5s" },
  { Icon: Smartphone, label: "Mobile Access", top: "45%", left: "86%", size: 54, color: "#10b981", delay: "0.9s", dur: "5.2s" },
  { Icon: Award, label: "Results", top: "75%", left: "77%", size: 56, color: "#ec4899", delay: "1.5s", dur: "6s" },
  { Icon: Pencil, label: "Preparation", top: "77%", left: "6%", size: 52, color: "#ef4444", delay: "0.2s", dur: "5.8s" },
];

const DOTS = [
  { top: "9%", left: "26%", size: 8, delay: "0s" },
  { top: "30%", left: "92%", size: 6, delay: "0.8s" },
  { top: "62%", left: "-2%", size: 7, delay: "1.4s" },
  { top: "92%", left: "46%", size: 8, delay: "0.4s" },
  { top: "28%", left: "-3%", size: 5, delay: "1.1s" },
  { top: "66%", left: "95%", size: 6, delay: "1.8s" },
];

function Student() {
  return (
    <svg viewBox="0 0 300 340" className="ex-student" role="img" aria-label="Graduate student">
      <defs>
        <linearGradient id="exGown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a4685" />
          <stop offset="1" stopColor="#16244d" />
        </linearGradient>
        <linearGradient id="exCap" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22356b" />
          <stop offset="1" stopColor="#111c3f" />
        </linearGradient>
      </defs>

      {/* gown */}
      <path d="M36 340 C36 262 86 236 150 236 C214 236 264 262 264 340 Z" fill="url(#exGown)" />
      {/* shirt + lapels + tie */}
      <path d="M116 238 L150 296 L184 238 Z" fill="#ffffff" />
      <path d="M100 246 L150 316 L122 240 Z" fill="#7fb0ee" />
      <path d="M200 246 L150 316 L178 240 Z" fill="#7fb0ee" />
      <path d="M144 262 L156 262 L159 290 L150 303 L141 290 Z" fill="#1b3a7a" />

      {/* neck */}
      <rect x="134" y="204" width="32" height="42" rx="12" fill="#f0c3a0" />
      {/* ears + head */}
      <circle cx="100" cy="172" r="9" fill="#f5c9a6" />
      <circle cx="200" cy="172" r="9" fill="#f5c9a6" />
      <ellipse cx="150" cy="170" rx="50" ry="54" fill="#fcdcc2" />
      {/* hair */}
      <path d="M101 158 Q104 124 150 120 Q196 124 199 158 Q188 141 150 139 Q112 141 101 158 Z" fill="#1b2a52" />

      {/* face */}
      <g className="ex-blink">
        <circle cx="130" cy="173" r="4.5" fill="#1b2a52" />
        <circle cx="170" cy="173" r="4.5" fill="#1b2a52" />
      </g>
      <circle cx="131.5" cy="171.5" r="1.4" fill="#fff" />
      <circle cx="171.5" cy="171.5" r="1.4" fill="#fff" />
      <path d="M121 161 Q130 156 139 161" stroke="#1b2a52" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M161 161 Q170 156 179 161" stroke="#1b2a52" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M134 192 Q150 207 166 192" stroke="#1b2a52" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="117" cy="189" r="8" fill="#f7a99a" opacity="0.45" />
      <circle cx="183" cy="189" r="8" fill="#f7a99a" opacity="0.45" />

      {/* cap */}
      <path d="M104 128 L104 152 Q150 174 196 152 L196 128 L150 146 Z" fill="#26407a" />
      <path d="M150 78 L248 112 L150 146 L52 112 Z" fill="url(#exCap)" />
      <path d="M150 78 L248 112 L150 146 L52 112 Z" fill="none" stroke="#3b5aa8" strokeWidth="1.5" />
      <circle cx="150" cy="112" r="4.5" fill="#f5b942" />
      <path d="M150 112 L232 118 L232 158" stroke="#f5b942" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="226" y="154" width="12" height="22" rx="4" fill="#f5b942" />
    </svg>
  );
}

function Illustration() {
  return (
    <div className="ex-stage">
      <div className="ex-orbit o1" />
      <div className="ex-orbit o2" />
      <div className="ex-glow" />

      <Student />

      {DOTS.map((d, i) => (
        <span
          key={i}
          className="ex-dot"
          style={{ top: d.top, left: d.left, width: d.size, height: d.size, animationDelay: d.delay }}
        />
      ))}

      {TILES.map(({ Icon, label, top, left, size, color, delay, dur }) => (
        <div
          key={label}
          className="ex-float"
          style={{ top, left, animationDelay: delay, animationDuration: dur }}
        >
          <div
            className="ex-tile"
            data-label={label}
            style={{ "--s": `${size}px`, "--c": color }}
          >
            <Icon size={Math.round(size * 0.46)} strokeWidth={2} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Main component ---------- */

export default function Auth({ onSuccess }) {
  const [mode, setMode] = useState("login");
  const [loginTab, setLoginTab] = useState("email");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    mobile: "",
    password: "",
    remember: true,
  });

  const [signup, setSignup] = useState({
    title: "Mr.",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: true,
  });

  const setL = (k) => (e) =>
    setLoginForm({
      ...loginForm,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });

  const setS = (k) => (e) =>
    setSignup({
      ...signup,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });

  function switchMode(m) {
    setMode(m);
    setError("");
    setInfo("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const identifier = loginTab === "email" ? loginForm.email : loginForm.mobile;
      await login(identifier, loginForm.password, loginForm.remember);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (signup.password !== signup.confirmPassword) {
      return setError("Password and Confirm Password match nahi kar rahe.");
    }

    if (!/^\d{10,15}$/.test(signup.mobileNumber.trim())) {
      return setError("Valid mobile number daalein (10-15 digits).");
    }

    if (!signup.agree) {
      return setError("Terms & Conditions accept karna zaroori hai.");
    }

    setLoading(true);

    try {
      const res = await register(signup);

      if (res.token) {
        onSuccess?.();
      } else {
        setInfo("Account ban gaya! Ab login karein.");
        setMode("login");
        setLoginTab("email");
        setLoginForm((f) => ({ ...f, email: signup.email, password: "" }));
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ex-page">
      <div className="ex-bg ex-bg-1" />
      <div className="ex-bg ex-bg-2" />

      <div className="ex-shell">
        {/* ===== Left: illustration ===== */}
        <section className="ex-hero">
          <Brand />

          <Illustration />

          <div className="ex-hero-text">
            <h1>Your exams, beautifully organised.</h1>
            <p>
              Exam forms, schedules, preparation and subjects &mdash; everything
              a student needs, in one place.
            </p>

            <div className="ex-chips">
              <span>Exam Forms</span>
              <span>Schedules</span>
              <span>Preparation</span>
            </div>
          </div>
        </section>

        {/* ===== Right: forms ===== */}
        <section className="ex-panel">
          <div className="ex-mobile-brand">
            <Brand />
          </div>

          <div className="ex-main-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => switchMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => switchMode("signup")}
            >
              Signup
            </button>
          </div>

          {error && <div className="ex-alert ex-error">{error}</div>}
          {info && <div className="ex-alert ex-info">{info}</div>}

          {mode === "login" ? (
            <form className="ex-form" onSubmit={handleLogin}>
              <h2>Welcome Back!</h2>
              <p className="ex-sub">Login to your account</p>

              <div className="ex-sub-tabs">
                <button
                  type="button"
                  className={loginTab === "email" ? "active" : ""}
                  onClick={() => setLoginTab("email")}
                >
                  Email / Username
                </button>
                <button
                  type="button"
                  className={loginTab === "mobile" ? "active" : ""}
                  onClick={() => setLoginTab("mobile")}
                >
                  Mobile Number
                </button>
              </div>

              {loginTab === "email" ? (
                <div className="ex-field">
                  <label>Email Address or Username</label>
                  <input
                    type="text"
                    placeholder="Enter email or username"
                    value={loginForm.email}
                    onChange={setL("email")}
                    required
                  />
                </div>
              ) : (
                <div className="ex-field">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={loginForm.mobile}
                    onChange={setL("mobile")}
                    required
                  />
                </div>
              )}

              <div className="ex-field">
                <div className="ex-row-between">
                  <label>Password</label>
                  <a
                    href="#forgot"
                    className="ex-link"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgot Password?
                  </a>
                </div>
                <PasswordInput
                  value={loginForm.password}
                  onChange={setL("password")}
                />
              </div>

              <label className="ex-check">
                <input
                  type="checkbox"
                  checked={loginForm.remember}
                  onChange={setL("remember")}
                />
                Remember Me
              </label>

              <button className="ex-btn" disabled={loading}>
                {loading ? "Please wait..." : "Login"}
              </button>

              <div className="ex-divider">
                <span>or continue with</span>
              </div>

              <button
                type="button"
                className="ex-btn-outline"
                onClick={() =>
                  setError("Google login abhi backend se connect nahi hai.")
                }
              >
                <b>G</b> Continue with Google
              </button>

              <p className="ex-foot">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="ex-link-btn"
                  onClick={() => switchMode("signup")}
                >
                  Register
                </button>
              </p>
            </form>
          ) : (
            <form className="ex-form" onSubmit={handleRegister}>
              <h2>Create Your Account</h2>
              <p className="ex-sub">Register to get started</p>

              <div className="ex-grid">
                <div className="ex-field">
                  <label>Title</label>
                  <select value={signup.title} onChange={setS("title")}>
                    <option>Mr.</option>
                    <option>Mrs.</option>
                    <option>Ms.</option>
                    <option>Dr.</option>
                  </select>
                </div>

                <div className="ex-field">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={signup.firstName}
                    onChange={setS("firstName")}
                    required
                  />
                </div>

                <div className="ex-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={signup.lastName}
                    onChange={setS("lastName")}
                    required
                  />
                </div>

                <div className="ex-field">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    value={signup.mobileNumber}
                    onChange={setS("mobileNumber")}
                    required
                  />
                </div>

                <div className="ex-field ex-full">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={signup.email}
                    onChange={setS("email")}
                    required
                  />
                </div>

                <div className="ex-field">
                  <label>Password</label>
                  <PasswordInput
                    value={signup.password}
                    onChange={setS("password")}
                  />
                </div>

                <div className="ex-field">
                  <label>Confirm Password</label>
                  <PasswordInput
                    value={signup.confirmPassword}
                    onChange={setS("confirmPassword")}
                  />
                </div>
              </div>

              <label className="ex-check">
                <input
                  type="checkbox"
                  checked={signup.agree}
                  onChange={setS("agree")}
                />
                I agree to the{" "}
                <a
                  href="#terms"
                  className="ex-link"
                  onClick={(e) => e.preventDefault()}
                >
                  Terms &amp; Conditions
                </a>
              </label>

              <button className="ex-btn" disabled={loading}>
                {loading ? "Please wait..." : "Register"}
              </button>

              <p className="ex-foot">
                Already have an account?{" "}
                <button
                  type="button"
                  className="ex-link-btn"
                  onClick={() => switchMode("login")}
                >
                  Login
                </button>
              </p>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
