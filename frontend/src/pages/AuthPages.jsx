// frontend/src/pages/AuthPages.jsx
// ═════════════════════════════════════════════════════════════
//  UPDATED: Improved signup/login/forgot flows with loading
// ═════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { AuthWrap } from "../components/Layout";
import { Btn, Inp, Spinner } from "../components/UI";
import { authAPI } from "../services/api";
import { IoMailOutline, IoLockClosedOutline, IoCheckmarkOutline, IoArrowBack } from "react-icons/io5";

/* ═══════════════════════════════════════════════════
   LOGIN PAGE (UPDATED: Welcome message with user name)
═══════════════════════════════════════════════════ */
export const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", pass: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.includes("@")) e.email = "Enter a valid email address";
    if (form.pass.length < 3) e.pass = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    const result = await login(form.email, form.pass);
    setLoading(false);

    if (result.success) {
      // ✅ NEW: Extract first name for welcome message
      const firstName = result.user?.name?.split(" ")[0] || "there";
      toast(`Welcome back, ${firstName}!`, "ok");
      setTimeout(() => navigate("/"), 400);
    } else {
      toast(result.error || "Login failed", "err");
      setErrors({ pass: result.error });
    }
  };

  return (
    <AuthWrap
      title="Welcome Back"
      subtitle="Sign in to your Maison Élite account"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <Inp
          label="Email Address"
          type="email"
          icon={<IoMailOutline />}
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="your@email.com"
          error={errors.email}
        />

        <div className="inp-wrap">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}>
            <label className="inp-label">Password</label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              style={{
                background: "none",
                border: "none",
                color: "var(--gold)",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Forgot?
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--dim)",
              fontSize: 15,
            }}>
              <IoLockClosedOutline size={16} />
            </span>
            <input
              type={showPass ? "text" : "password"}
              value={form.pass}
              onChange={(e) => setForm((p) => ({ ...p, pass: e.target.value }))}
              placeholder="••••••••"
              className="inp inp-icon"
              style={{ borderColor: errors.pass ? "var(--rose)" : "", paddingRight: 52 }}
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--dim)",
                cursor: "pointer",
                fontSize: 11,
                letterSpacing: ".08em",
                transition: "color .2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--dim)")}
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
          {errors.pass && (
            <p style={{ color: "var(--rose)", fontSize: 11, marginTop: 5 }}>
              {errors.pass}
            </p>
          )}
        </div>

        <Btn
          v="primary"
          full
          size="lg"
          type="submit"
          disabled={loading}
          style={{ marginBottom: 20 }}
        >
          {loading ? (
            <>
              <Spinner /> Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Btn>
      </form>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        margin: "20px 0",
      }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 11, color: "var(--dim)", letterSpacing: ".1em" }}>
          OR
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
        New to Maison Élite?{" "}
        <button
          onClick={() => navigate("/signup")}
          style={{
            background: "none",
            border: "none",
            color: "var(--gold2)",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: 13,
            textDecoration: "underline",
          }}
        >
          Create account
        </button>
      </p>
    </AuthWrap>
  );
};

/* ═══════════════════════════════════════════════════
   SIGNUP PAGE (UPDATED: Redirects to login after success)
═══════════════════════════════════════════════════ */
export const SignupPage = () => {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    first: "",
    last: "",
    email: "",
    pass: "",
    confirm: "",
    agreed: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const getStrength = (p) => {
    if (!p) return null;
    if (p.length < 5)
      return { pct: 25, color: "var(--rose)", label: "Weak" };
    if (p.length < 8)
      return { pct: 60, color: "var(--gold)", label: "Fair" };
    return /(?=.*[A-Z])(?=.*[0-9])/.test(p)
      ? { pct: 100, color: "var(--emerald)", label: "Strong" }
      : { pct: 80, color: "var(--emerald)", label: "Good" };
  };
  const strength = getStrength(form.pass);

  const validateStep1 = () => {
    const e = {};
    if (!form.first.trim()) e.first = "First name is required";
    if (!form.last.trim()) e.last = "Last name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.pass.length < 8) e.pass = "Minimum 8 characters";
    if (form.pass !== form.confirm) e.confirm = "Passwords don't match";
    if (!form.agreed) e.agreed = "Please accept to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);

    const result = await signup(
      `${form.first} ${form.last}`,
      form.email,
      form.pass
    );
    setLoading(false);

    if (result.success) {
      // ✅ NEW: Show success message and redirect to login
      toast("Account created successfully! Please login to continue", "ok");
      setTimeout(() => navigate("/login"), 1500);
    } else {
      toast(result.error || "Signup failed", "err");
      setErrors({ email: result.error });
    }
  };

  const STEP_LABELS = ["Personal Details", "Account Setup"];

  return (
    <AuthWrap
      title="Create Account"
      subtitle="Join 12,000+ members for exclusive access"
    >
      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < STEP_LABELS.length - 1 ? 1 : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    step > i + 1
                      ? "var(--gold)"
                      : step === i + 1
                      ? "rgba(201,168,76,.2)"
                      : "var(--lift)",
                  border: `1px solid ${
                    step >= i + 1 ? "var(--gold)" : "var(--border)"
                  }`,
                  color: step >= i + 1 ? "var(--gold2)" : "var(--dim)",
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "all .3s",
                }}
              >
                {step > i + 1 ? <IoCheckmarkOutline size={14} /> : i + 1}
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: step === i + 1 ? "var(--text)" : "var(--dim)",
                  letterSpacing: ".05em",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  margin: "0 12px",
                  background: step > 1 ? "var(--gold)" : "var(--border)",
                  transition: "background .4s",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Personal */}
      {step === 1 && (
        <form className="fu" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
            className="grid-1-mobile"
          >
            <Inp
              label="First Name"
              value={form.first}
              onChange={(e) =>
                setForm((p) => ({ ...p, first: e.target.value }))
              }
              placeholder="Emma"
              error={errors.first}
            />
            <Inp
              label="Last Name"
              value={form.last}
              onChange={(e) =>
                setForm((p) => ({ ...p, last: e.target.value }))
              }
              placeholder="Laurent"
              error={errors.last}
            />
          </div>

          <Btn v="primary" full size="lg" type="submit">
            Continue →
          </Btn>
        </form>
      )}

      {/* Step 2 — Account */}
      {step === 2 && (
        <form className="fu" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Inp
            label="Email Address"
            type="email"
            icon={<IoMailOutline />}
            value={form.email}
            onChange={(e) =>
              setForm((p) => ({ ...p, email: e.target.value }))
            }
            placeholder="your@email.com"
            error={errors.email}
          />

          {/* Password + strength meter */}
          <div className="inp-wrap">
            <label className="inp-label">Password</label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--dim)",
                  fontSize: 15,
                }}
              >
                <IoLockClosedOutline size={16} />
              </span>
              <input
                type="password"
                value={form.pass}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pass: e.target.value }))
                }
                placeholder="Min. 8 characters"
                className="inp inp-icon"
                style={{ borderColor: errors.pass ? "var(--rose)" : "" }}
              />
            </div>
            {strength && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[25, 60, 80, 100].map((threshold) => (
                    <div
                      key={threshold}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background:
                          strength.pct >= threshold
                            ? strength.color
                            : "var(--border)",
                        transition: "background .3s",
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: strength.color, marginTop: 5 }}>
                  Strength: {strength.label}
                </p>
              </div>
            )}
            {errors.pass && (
              <p style={{ color: "var(--rose)", fontSize: 11, marginTop: 5 }}>
                {errors.pass}
              </p>
            )}
          </div>

          <Inp
            label="Confirm Password"
            type="password"
            icon={<IoLockClosedOutline />}
            value={form.confirm}
            onChange={(e) =>
              setForm((p) => ({ ...p, confirm: e.target.value }))
            }
            placeholder="Repeat password"
            error={errors.confirm}
          />

          {/* Custom checkbox */}
          <label
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              marginBottom: 8,
              cursor: "pointer",
            }}
          >
            <div
              onClick={() =>
                setForm((p) => ({ ...p, agreed: !p.agreed }))
              }
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: `1px solid ${
                  form.agreed ? "var(--gold)" : "var(--border2)"
                }`,
                background: form.agreed ? "rgba(201,168,76,.2)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
                transition: "all .2s",
                cursor: "pointer",
              }}
            >
              {form.agreed && (
                <span
                  style={{
                    color: "var(--gold)",
                    fontSize: 12,
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <IoCheckmarkOutline size={14} />
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: 13,
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              I agree to the{" "}
              <span style={{ color: "var(--gold2)", cursor: "pointer" }}>
                Terms of Service
              </span>{" "}
              and{" "}
              <span style={{ color: "var(--gold2)", cursor: "pointer" }}>
                Privacy Policy
              </span>
            </span>
          </label>
          {errors.agreed && (
            <p style={{ color: "var(--rose)", fontSize: 11, marginBottom: 14 }}>
              {errors.agreed}
            </p>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn
              type="button"
              v="ghost"
              onClick={() => {
                setStep(1);
                setErrors({});
              }}
            >
              <IoArrowBack size={12} style={{ marginRight: 4 }} /> Back
            </Btn>
            <Btn
              v="primary"
              full
              size="lg"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner /> Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Btn>
          </div>
        </form>
      )}

      <p
        style={{
          textAlign: "center",
          marginTop: 28,
          fontSize: 13,
          color: "var(--muted)",
        }}
      >
        Already a member?{" "}
        <button
          onClick={() => navigate("/login")}
          style={{
            background: "none",
            border: "none",
            color: "var(--gold2)",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: 13,
          }}
        >
          Sign in
        </button>
      </p>
    </AuthWrap>
  );
};

/* ═══════════════════════════════════════════════════
   FORGOT PASSWORD PAGE (UPDATED: Loading state)
═══════════════════════════════════════════════════ */
export const ForgotPage = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setLoading(true); // ✅ NEW: Show loading state

    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast("Reset link sent! Check your email", "ok");
    } catch (err) {
      setError(err.message);
      toast(err.message, "err");
    } finally {
      setLoading(false); // ✅ NEW: Hide loading
    }
  };

  return (
    <AuthWrap
      title={sent ? "Check Your Inbox" : "Reset Password"}
      subtitle={
        sent
          ? "We've sent recovery instructions"
          : "We'll email you a secure reset link"
      }
    >
      {!sent ? (
        <form className="fu" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div
            style={{
              padding: "18px 20px",
              background: "rgba(201,168,76,.05)",
              border: "1px solid rgba(201,168,76,.2)",
              borderRadius: 8,
              marginBottom: 28,
            }}
          >
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
              Enter the email address linked to your account. We'll send a
              secure link to reset your password.
            </p>
          </div>

          <Inp
            label="Email Address"
            type="email"
            icon={<IoMailOutline />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            error={error}
          />

          <Btn
            v="primary"
            full
            size="lg"
            type="submit"
            disabled={loading}
            style={{ marginBottom: 20 }}
          >
            {loading ? (
              <>
                <Spinner /> Sending Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Btn>

          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
              margin: "0 auto",
              transition: "color .2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--muted)")
            }
          >
            <IoArrowBack size={12} style={{ marginRight: 4 }} /> Back to Sign In
          </button>
        </form>
      ) : (
        <div className="fu" style={{ textAlign: "center" }}>
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
            <IoMailOutline size={36} />
          </div>
          <p style={{ color: "var(--muted)", marginBottom: 10, fontSize: 14 }}>
            A reset link has been sent to
          </p>
          <p
            style={{
              fontWeight: 500,
              fontSize: 16,
              marginBottom: 32,
              color: "var(--gold2)",
            }}
          >
            {email}
          </p>

          <div
            style={{
              padding: 18,
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              marginBottom: 28,
              textAlign: "left",
            }}
          >
            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }}>
              • Check your spam folder if not received
              <br />
              • Link expires in 30 minutes
              <br />•{" "}
              <button
                onClick={() => setSent(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--gold)",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: 12,
                }}
              >
                Resend link
              </button>
            </p>
          </div>

          <Btn v="primary" full size="lg" onClick={() => navigate("/login")}>
            Back to Sign In
          </Btn>
        </div>
      )}
    </AuthWrap>
  );
};