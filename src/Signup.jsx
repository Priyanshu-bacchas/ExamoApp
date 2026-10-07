import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { sendOtp, verifyOtp, register, loginWithGoogle } from "../services/authService";

const empty = {
  title: "Mr", firstName: "", lastName: "", mobile: "", email: "",
  password: "", confirmPassword: "", terms: false,
};

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const validate = () => {
    if (!form.firstName.trim()) return "First name daalo";
    if (!/^\d{10}$/.test(form.mobile)) return "Mobile number 10 digit ka hona chahiye";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Valid email daalo";
    if (form.password.length < 6) return "Password kam se kam 6 character ka ho";
    if (form.password !== form.confirmPassword) return "Passwords match nahi kar rahe";
    if (!form.terms) return "Terms & Conditions accept karo";
    return "";
  };

  const sendCode = async () => {
    await sendOtp(form.email.trim());
    setCooldown(30);
    setInfo(`OTP ${form.email} par bhej diya gaya hai`);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    setLoading(true);
    try {
      if (step === 1) {
        const v = validate();
        if (v) throw new Error(v);
        await sendCode();
        setStep(2);
      } else {
        if (otp.length !== 6) throw new Error("6 digit ka OTP daalo");
        await verifyOtp(form.email.trim(), otp);
        await register({
          name: `${form.firstName} ${form.lastName}`.trim(),
          mobileNumber: form.mobile,
          email: form.email.trim(),
          password: form.password,
        });
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    try { await sendCode(); } catch (err) { setError(err.message); }
  };

  const onGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      navigate((user.role || "").toLowerCase() === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell
      title={step === 1 ? "Create your account" : "Email verify karo"}
      subtitle={step === 1 ? "Examo se judne ke liye details bharo" : "Email par aaya 6 digit OTP daalo"}
    >
      <form onSubmit={onSubmit}>
        {error && <div className="err">{error}</div>}
        {info && <div className="ok">{info}</div>}

        {step === 1 && (
          <>
            <div className="row2">
              <select value={form.title} onChange={set("title")}>
                <option>Mr</option><option>Ms</option><option>Mrs</option><option>Dr</option>
              </select>
              <input placeholder="First Name" value={form.firstName} onChange={set("firstName")} />
            </div>
            <div className="row2">
              <input placeholder="Last Name" value={form.lastName} onChange={set("lastName")} />
              <input placeholder="Mobile Number" inputMode="numeric" maxLength={10}
                     value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })} />
            </div>
            <input type="email" placeholder="Email" value={form.email} onChange={set("email")} />
            <div className="row2">
              <input type="password" placeholder="Password" value={form.password} onChange={set("password")} />
              <input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={set("confirmPassword")} />
            </div>
            <label className="check">
              <input type="checkbox" checked={form.terms} onChange={set("terms")} />
              Main Terms & Conditions se sehmat hoon
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <input className="otp-input" placeholder="------" maxLength={6} inputMode="numeric"
                   value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} autoFocus />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button type="button" className="link" onClick={() => { setStep(1); setOtp(""); setInfo(""); }}>
                Email badlo
              </button>
              <button type="button" className="link" disabled={cooldown > 0} onClick={resend}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : "OTP dobara bhejo"}
              </button>
            </div>
          </>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Please wait..." : step === 1 ? "Send OTP" : "Verify & Sign up"}
        </button>

        {step === 1 && (
          <>
            <div className="divider">ya</div>
            <button type="button" className="btn-google" onClick={onGoogle} disabled={loading}>
              <b>G</b> Continue with Google
            </button>
          </>
        )}
      </form>
      <p className="switch">Pehle se account hai? <Link to="/login">Login</Link></p>
    </AuthShell>
  );
}
