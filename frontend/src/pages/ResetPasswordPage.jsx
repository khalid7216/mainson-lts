// frontend/src/pages/ResetPasswordPage.jsx
// ═════════════════════════════════════════════════════════════
//  FIXED: Using navigate + useParams
// ═════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { AuthWrap } from "../components/Layout";
import { Btn, Inp, Spinner } from "../components/UI";
import { authAPI } from "../services/api";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(false);
  const [checking, setChecking] = useState(true);

  const getStrength = (p) => {
    if (!p) return null;
    if (p.length < 5) return { pct: 25, color: "var(--rose)", label: "Weak" };
    if (p.length < 8) return { pct: 60, color: "var(--gold)", label: "Fair" };
    return /(?=.*[A-Z])(?=.*[0-9])/.test(p)
      ? { pct: 100, color: "var(--emerald)", label: "Strong" }
      : { pct: 80, color: "var(--emerald)", label: "Good" };
  };
  const strength = getStrength(form.password);

  useEffect(() => {
    if (!token || token.length < 20) setExpired(true);
    setChecking(false);
  }, [token]);

  const validate = () => {
    const e = {};
    if (form.password.length < 8) e.password = "At least 8 characters required";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      await authAPI.resetPassword(token, form.password);
      setSuccess(true);
      toast("Password reset successful! ✦", "ok");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setLoading(false);
      if (error.message.includes("expired") || error.message.includes("Invalid")) {
        setExpired(true);
        toast("Reset link expired", "err");
      } else {
        toast(error.message, "err");
        setErrors({ password: error.message });
      }
    }
  };

  if (checking) {
    return (
      <AuthWrap title="Reset Password" subtitle="Loading...">
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spinner size={48} />
        </div>
      </AuthWrap>
    );
  }

  if (expired) {
    return (
      <AuthWrap title="Link Expired" subtitle="This reset link is no longer valid">
        <div className="fu" style={{ textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(192,57,43,.15)",
              border: "1px solid rgba(192,57,43,.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 32,
            }}
          >
            ⏰
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300, fontSize: 28, marginBottom: 12 }}>
            Reset Link Expired
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 32, lineHeight: 1.7 }}>
            This link has expired or was already used.
            <br />
            Links are valid for 30 minutes only.
          </p>
          <Btn v="primary" full size="lg" onClick={() => navigate("/forgot-password")}>
            Request New Link
          </Btn>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: 13,
              marginTop: 16,
            }}
          >
            ← Back to Sign In
          </button>
        </div>
      </AuthWrap>
    );
  }

  if (success) {
    return (
      <AuthWrap title="Password Reset!" subtitle="You can now sign in">
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(26,122,74,.15)",
              border: "1px solid rgba(26,122,74,.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 32,
            }}
          >
            ✓
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "var(--emerald)", marginBottom: 32 }}>
            Password Updated!
          </h2>
          <Spinner size={32} />
        </div>
      </AuthWrap>
    );
  }

  return (
    <AuthWrap title="Reset Password" subtitle="Enter your new password">
      <div className="fu">
        <div style={{ padding: "18px 20px", background: "rgba(201,168,76,.05)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 8, marginBottom: 28 }}>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>
            🔒 At least 8 characters
            <br />⏰ Link expires in 30 minutes
          </p>
        </div>

        <div className="inp-wrap">
          <label className="inp-label">New Password</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--dim)" }}>🔒</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Min. 8 characters"
              className="inp inp-icon"
            />
          </div>
          {strength && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[25, 60, 80, 100].map((t) => (
                  <div key={t} style={{ flex: 1, height: 3, borderRadius: 2, background: strength.pct >= t ? strength.color : "var(--border)" }} />
                ))}
              </div>
              <p style={{ fontSize: 11, color: strength.color, marginTop: 5 }}>Strength: {strength.label}</p>
            </div>
          )}
          {errors.password && <p style={{ color: "var(--rose)", fontSize: 11, marginTop: 5 }}>{errors.password}</p>}
        </div>

        <Inp
          label="Confirm Password"
          type="password"
          icon="🔒"
          value={form.confirm}
          onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
          placeholder="Repeat password"
          error={errors.confirm}
        />

        <Btn v="primary" full size="lg" onClick={handleSubmit} disabled={loading} style={{ marginBottom: 20 }}>
          {loading ? <><Spinner /> Resetting...</> : "Reset Password"}
        </Btn>

        <button onClick={() => navigate("/login")} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, margin: "0 auto", display: "flex" }}>
          ← Back to Sign In
        </button>
      </div>
    </AuthWrap>
  );
};

export default ResetPasswordPage;