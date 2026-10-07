import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { login, loginWithGoogle } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(localStorage.getItem("examo_id") || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(!!localStorage.getItem("examo_id"));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const go = (user) => navigate((user.role || "").toLowerCase() === "admin" ? "/admin" : "/", { replace: true });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim() || !password) return setError("Email/Mobile aur password dono daalo");
    setLoading(true);
    try {
      const user = await login(identifier.trim(), password);
      if (remember) localStorage.setItem("examo_id", identifier.trim());
      else localStorage.removeItem("examo_id");
      go(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError("");
    setLoading(true);
    try { go(await loginWithGoogle()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Apne Examo account me login karo">
      <form onSubmit={onSubmit}>
        {error && <div className="err">{error}</div>}
        <input placeholder="Email ya Mobile Number" value={identifier}
               onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" />
        <input type="password" placeholder="Password" value={password}
               onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>
        <div className="divider">ya</div>
        <button type="button" className="btn-google" onClick={onGoogle} disabled={loading}>
          <b>G</b> Continue with Google
        </button>
      </form>
      <p className="switch">Account nahi hai? <Link to="/signup">Sign up</Link></p>
    </AuthShell>
  );
}
