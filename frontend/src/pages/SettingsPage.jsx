// frontend/src/pages/SettingsPage.jsx
// ═════════════════════════════════════════════════════════════
//  NEW FILE: User settings - change password, update username
// ═════════════════════════════════════════════════════════════

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Btn, Inp, Spinner } from "../components/UI";
import { authAPI } from "../services/api";

const SettingsPage = ({ navigate }) => {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  /* Profile form */
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [profileErrors, setProfileErrors] = useState({});

  /* Password form */
  const [passForm, setPassForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passErrors, setPassErrors] = useState({});

  /* ── Update Profile ────────────────────────────── */
  const handleUpdateProfile = async () => {
    const errors = {};
    if (!profileForm.name.trim()) errors.name = "Name is required";
    if (!profileForm.email.includes("@"))
      errors.email = "Valid email required";

    if (Object.keys(errors).length) {
      setProfileErrors(errors);
      return;
    }

    setLoading(true);
    try {
      // Call API to update user
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/auth/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(profileForm),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      updateUser({ name: profileForm.name, email: profileForm.email });
      toast("Profile updated successfully ✦", "ok");
    } catch (error) {
      toast(error.message, "err");
    } finally {
      setLoading(false);
    }
  };

  /* ── Change Password ───────────────────────────── */
  const handleChangePassword = async () => {
    const errors = {};

    if (!passForm.current) errors.current = "Current password is required";
    if (passForm.new.length < 8)
      errors.new = "New password must be at least 8 characters";
    if (passForm.new !== passForm.confirm)
      errors.confirm = "Passwords don't match";

    // ✅ Prevent reusing current password
    if (passForm.new === passForm.current) {
      errors.new = "New password cannot be same as current password";
    }

    if (Object.keys(errors).length) {
      setPassErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword: passForm.current,
            newPassword: passForm.new,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      toast("Password changed successfully ✦", "ok");
      setPassForm({ current: "", new: "", confirm: "" });
    } catch (error) {
      toast(error.message, "err");
      setPassErrors({ current: error.message });
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "password", label: "Password", icon: "🔒" },
  ];

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "60px 24px 100px",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 36,
            fontWeight: 300,
            marginBottom: 8,
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 16,
          borderBottom: "1px solid var(--border)",
          marginBottom: 32,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "12px 20px",
              background: "none",
              border: "none",
              borderBottom: `2px solid ${
                tab === t.id ? "var(--gold)" : "transparent"
              }`,
              color: tab === t.id ? "var(--gold2)" : "var(--muted)",
              fontSize: 13,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "'Jost', sans-serif",
              transition: "all .2s",
              marginBottom: -1,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 32,
        }}
      >
        {/* ═══ PROFILE TAB ═══ */}
        {tab === "profile" && (
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 24,
              }}
            >
              Profile Information
            </h2>

            <div style={{ maxWidth: 500 }}>
              <Inp
                label="Full Name"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Emma Laurent"
                error={profileErrors.name}
              />

              <Inp
                label="Email Address"
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="emma@example.com"
                error={profileErrors.email}
              />

              <div
                style={{
                  padding: "16px 20px",
                  background: "rgba(201,168,76,.05)",
                  border: "1px solid rgba(201,168,76,.2)",
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: "var(--gold2)" }}>Note:</strong>{" "}
                  Changing your email will require verification. You'll receive
                  a confirmation link at your new email address.
                </p>
              </div>

              <Btn
                v="primary"
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Btn>
            </div>
          </div>
        )}

        {/* ═══ PASSWORD TAB ═══ */}
        {tab === "password" && (
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 24,
              }}
            >
              Change Password
            </h2>

            <div style={{ maxWidth: 500 }}>
              <Inp
                label="Current Password"
                type="password"
                icon="🔒"
                value={passForm.current}
                onChange={(e) =>
                  setPassForm((p) => ({ ...p, current: e.target.value }))
                }
                placeholder="Enter current password"
                error={passErrors.current}
              />

              <Inp
                label="New Password"
                type="password"
                icon="🔑"
                value={passForm.new}
                onChange={(e) =>
                  setPassForm((p) => ({ ...p, new: e.target.value }))
                }
                placeholder="Min. 8 characters"
                error={passErrors.new}
              />

              <Inp
                label="Confirm New Password"
                type="password"
                icon="🔑"
                value={passForm.confirm}
                onChange={(e) =>
                  setPassForm((p) => ({ ...p, confirm: e.target.value }))
                }
                placeholder="Repeat new password"
                error={passErrors.confirm}
              />

              <div
                style={{
                  padding: "16px 20px",
                  background: "rgba(201,168,76,.05)",
                  border: "1px solid rgba(201,168,76,.2)",
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: "var(--gold2)" }}>
                    Password Requirements:
                  </strong>
                  <br />
                  ✦ At least 8 characters long
                  <br />
                  ✦ Cannot be the same as current password
                  <br />✦ Include uppercase, lowercase, and numbers for best
                  security
                </p>
              </div>

              <Btn
                v="primary"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner /> Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Btn>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div
        style={{
          marginTop: 40,
          padding: 24,
          background: "rgba(192,57,43,.05)",
          border: "1px solid rgba(192,57,43,.2)",
          borderRadius: 12,
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 500,
            marginBottom: 8,
            color: "var(--rose)",
          }}
        >
          Danger Zone
        </h3>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <Btn
          v="ghost"
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to delete your account? This cannot be undone."
              )
            ) {
              logout();
              navigate("/");
              toast("Account deleted", "err");
            }
          }}
          style={{ color: "var(--rose)", borderColor: "var(--rose)" }}
        >
          Delete Account
        </Btn>
      </div>
    </div>
  );
};

export default SettingsPage;