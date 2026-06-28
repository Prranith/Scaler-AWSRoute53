"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import { Globe, Eye, EyeOff, Loader2, ChevronDown } from "lucide-react";

type AuthStep = "usertype" | "root_password" | "iam_login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, _hasHydrated } = useAuthStore();

  const [step, setStep] = useState<AuthStep>("usertype");
  const [userType, setUserType] = useState<"root" | "iam">("root");
  
  const [email, setEmail] = useState("");
  const [accountId, setAccountId] = useState("123456789012");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) router.replace("/zones");
  }, [isAuthenticated, _hasHydrated, router]);

  const handleNextUserType = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (userType === "root") {
      if (!email) {
        setError("Please enter your root email address.");
        return;
      }
      setStep("root_password");
    } else {
      setStep("iam_login");
    }
  };

  const handleBackToUserType = () => {
    setError(null);
    setPassword("");
    setStep("usertype");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Simulate a small network delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      const mockUser = {
        id: "admin-uuid-placeholder",
        email: email || "admin@example.com",
        username: username || (email ? email.split("@")[0] : "admin"),
        is_active: true,
        created_at: new Date().toISOString()
      };
      const mockToken = "mock-jwt-token-bypass-verification";

      localStorage.setItem("access_token", mockToken);
      setAuth(mockUser, mockToken);
      router.replace("/zones");
    } catch (err: any) {
      setError("An unexpected error occurred during mock sign-in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Absolute positioned Language Selector */}
      <div style={{ position: "absolute", top: "18px", right: "24px" }} className="auth-lang-selector">
        <span>English</span>
        <ChevronDown size={12} style={{ marginLeft: "4px" }} />
      </div>

      {/* Centered Logo Header */}
      <div className="auth-header" style={{ justifyContent: "center", marginBottom: "24px" }}>
        <img
          src="/aws-logo.jpg"
          alt="AWS Smile Logo"
          style={{ height: "42px", objectFit: "contain" }}
        />
      </div>

      {/* Auth responsive two-column grid */}
      <div className="auth-container">
        
        {/* Left Column: Interactive AWS Sign-in Card */}
        <div className="auth-card">
          <div className="auth-card-header">
            {step === "usertype" && <h2>Sign in</h2>}
            {step === "root_password" && <h2>Root user sign in</h2>}
            {step === "iam_login" && <h2>IAM user sign in</h2>}
            {step === "register" && <h2>Sign up</h2>}
          </div>

          <div className="auth-card-body">
            
            {/* Step 1: User Type Selection */}
            {step === "usertype" && (
              <form onSubmit={handleNextUserType}>
                <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#545b64", textAlign: "left" }}>
                  Access your AWS account by user type.
                </p>

                <div className="aws-form-group">
                  <label className="aws-label" style={{ marginBottom: "8px" }}>
                    User type <span style={{ fontWeight: 400, color: "#0073bb", textDecoration: "underline", fontSize: "11px", cursor: "pointer", marginLeft: "4px" }}>(not sure?)</span>
                  </label>
                  
                  {/* Root user Selection card */}
                  <div
                    className={`user-type-card ${userType === "root" ? "selected" : ""}`}
                    onClick={() => setUserType("root")}
                  >
                    <div className="user-type-radio">
                      <div className="user-type-radio-inner" />
                    </div>
                    <div className="user-type-info">
                      <span className="user-type-title">Root user</span>
                      <span className="user-type-desc">
                        Account owner that performs tasks requiring unrestricted access.
                      </span>
                    </div>
                  </div>

                  {/* IAM User Selection card */}
                  <div
                    className={`user-type-card ${userType === "iam" ? "selected" : ""}`}
                    onClick={() => setUserType("iam")}
                  >
                    <div className="user-type-radio">
                      <div className="user-type-radio-inner" />
                    </div>
                    <div className="user-type-info">
                      <span className="user-type-title">IAM user</span>
                      <span className="user-type-desc">
                        User within an account that performs daily tasks.
                      </span>
                    </div>
                  </div>
                </div>

                {userType === "root" && (
                  <div className="aws-form-group">
                    <label className="aws-label" htmlFor="root-email">Root user email address</label>
                    <input
                      id="root-email"
                      className="aws-input"
                      type="text"
                      placeholder="username@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                {userType === "iam" && (
                  <div
                    style={{
                      background: "#f2f8fc",
                      borderLeft: "4px solid #0073bb",
                      padding: "8px 12px",
                      borderRadius: "0 4px 4px 0",
                      fontSize: "11px",
                      color: "#545b64",
                      marginBottom: "16px",
                      textAlign: "left"
                    }}
                  >
                    <span>IAM users must sign in with Account ID and username. Click Next to continue.</span>
                  </div>
                )}

                {error && (
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "rgba(203,36,49,0.08)",
                      borderLeft: "4px solid var(--aws-red)",
                      fontSize: "12px",
                      color: "var(--aws-red)",
                      marginBottom: "16px",
                      textAlign: "left"
                    }}
                  >
                    {error}
                  </div>
                )}

                <button type="submit" className="aws-btn-orange" style={{ marginTop: "8px" }}>
                  Next
                </button>

                <div className="aws-divider">OR</div>

                <button
                  type="button"
                  className="aws-btn-secondary"
                  onClick={() => {
                    setError(null);
                    setStep("register");
                  }}
                >
                  New to AWS? Sign up
                </button>
              </form>
            )}

            {/* Step 2: Root User Password Input */}
            {step === "root_password" && (
              <form onSubmit={handleSubmit}>
                <div className="aws-form-group" style={{ background: "#f2f4f4", padding: "10px 14px", borderRadius: "4px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", color: "#545b64", fontWeight: 600 }}>Root user</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#16191f" }}>{email}</span>
                    <button
                      type="button"
                      onClick={handleBackToUserType}
                      style={{ background: "none", border: "none", color: "#0073bb", fontSize: "12px", fontWeight: 600, cursor: "pointer", padding: 0 }}
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* demo credential helper */}
                <div
                  style={{
                    background: "#f2f8fc",
                    borderLeft: "4px solid #0073bb",
                    padding: "8px 12px",
                    borderRadius: "0 4px 4px 0",
                    fontSize: "11px",
                    color: "#545b64",
                    marginBottom: "16px",
                    textAlign: "left"
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "2px" }}>Demo Credentials</div>
                  <span>Root email: <strong>admin</strong> | Password: <strong>admin123</strong></span>
                </div>

                <div className="aws-form-group">
                  <label className="aws-label" htmlFor="root-pwd">Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="root-pwd"
                      className="aws-input"
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ paddingRight: "40px" }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#545b64",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "rgba(203,36,49,0.08)",
                      borderLeft: "4px solid var(--aws-red)",
                      fontSize: "12px",
                      color: "var(--aws-red)",
                      marginBottom: "16px",
                      textAlign: "left"
                    }}
                  >
                    {error}
                  </div>
                )}

                <button type="submit" className="aws-btn-orange" disabled={loading}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Loader2 size={15} style={{ animation: "spin 600ms linear infinite" }} />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>

                <div className="aws-divider">OR</div>

                <button type="button" className="aws-btn-secondary" onClick={handleBackToUserType}>
                  Sign in using a different account
                </button>
              </form>
            )}

            {/* Step 3: IAM User sign in */}
            {step === "iam_login" && (
              <form onSubmit={handleSubmit}>
                
                {/* Demo Credentials alert */}
                <div
                  style={{
                    background: "#f2f8fc",
                    borderLeft: "4px solid #0073bb",
                    padding: "8px 12px",
                    borderRadius: "0 4px 4px 0",
                    fontSize: "11px",
                    color: "#545b64",
                    marginBottom: "16px",
                    textAlign: "left"
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "2px" }}>Demo Credentials</div>
                  <span>IAM username: <strong>admin</strong> | Password: <strong>admin123</strong></span>
                </div>

                <div className="aws-form-group">
                  <label className="aws-label" htmlFor="iam-account">Account ID (12 digits) or account alias</label>
                  <input
                    id="iam-account"
                    className="aws-input"
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    required
                  />
                </div>

                <div className="aws-form-group">
                  <label className="aws-label" htmlFor="iam-user">IAM username</label>
                  <input
                    id="iam-user"
                    className="aws-input"
                    type="text"
                    placeholder="e.g. admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="aws-form-group">
                  <label className="aws-label" htmlFor="iam-pwd">Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="iam-pwd"
                      className="aws-input"
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#545b64",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#16191f", cursor: "pointer" }}>
                    <input type="checkbox" checked={showPwd} onChange={() => setShowPwd(!showPwd)} />
                    Show password
                  </label>
                  <span style={{ fontSize: "12px", color: "#0073bb", textDecoration: "underline", cursor: "pointer" }}>
                    Having trouble?
                  </span>
                </div>

                {error && (
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "rgba(203,36,49,0.08)",
                      borderLeft: "4px solid var(--aws-red)",
                      fontSize: "12px",
                      color: "var(--aws-red)",
                      marginBottom: "16px",
                      textAlign: "left"
                    }}
                  >
                    {error}
                  </div>
                )}

                <button type="submit" className="aws-btn-orange" disabled={loading}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Loader2 size={15} style={{ animation: "spin 600ms linear infinite" }} />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>

                <div className="aws-divider">OR</div>

                <button type="button" className="aws-btn-secondary" onClick={handleBackToUserType}>
                  Sign in using root user email
                </button>
              </form>
            )}

            {/* Step 4: Register account */}
            {step === "register" && (
              <form onSubmit={handleSubmit}>
                <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#545b64", textAlign: "left" }}>
                  Create a new AWS account login.
                </p>

                <div className="aws-form-group">
                  <label className="aws-label" htmlFor="reg-user">Username</label>
                  <input
                    id="reg-user"
                    className="aws-input"
                    type="text"
                    placeholder="e.g. admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="aws-form-group">
                  <label className="aws-label" htmlFor="reg-email">Email address</label>
                  <input
                    id="reg-email"
                    className="aws-input"
                    type="email"
                    placeholder="username@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="aws-form-group">
                  <label className="aws-label" htmlFor="reg-pwd">Password</label>
                  <input
                    id="reg-pwd"
                    className="aws-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "rgba(203,36,49,0.08)",
                      borderLeft: "4px solid var(--aws-red)",
                      fontSize: "12px",
                      color: "var(--aws-red)",
                      marginBottom: "16px",
                      textAlign: "left"
                    }}
                  >
                    {error}
                  </div>
                )}

                <button type="submit" className="aws-btn-orange" disabled={loading} style={{ marginTop: "8px" }}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Loader2 size={15} style={{ animation: "spin 600ms linear infinite" }} />
                      Creating account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>

                <div className="aws-divider">OR</div>

                <button
                  type="button"
                  className="aws-btn-secondary"
                  onClick={() => {
                    setError(null);
                    setStep("usertype");
                  }}
                >
                  Already have an account? Sign in
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Right Column: AWS Route 53 Console Information Panel */}
        <div className="auth-promo-card" style={{ background: "#f2f8fc", display: "flex", flexDirection: "column", padding: "28px", color: "#16191f", justifyContent: "space-between", height: "100%", border: "1px solid #d5dbdb", borderRadius: "4px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#16191f", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-block", width: "4px", height: "16px", backgroundColor: "#ec7211", borderRadius: "2px" }}></span>
              AWS Route 53 DNS Console Features
            </h3>
            
            <p style={{ fontSize: "12px", lineHeight: "1.5", color: "#545b64", margin: 0 }}>
              Amazon Route 53 is a highly available and scalable cloud Domain Name System (DNS) service. It connects user requests to endpoints running inside AWS or external networks.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
              {[
                { title: "High-Availability DNS", desc: "Global network of redundant servers resolves queries with minimal latency." },
                { title: "Health Check Monitors", desc: "Configure routing checks and automate DNS failovers when endpoints crash." },
                { title: "VPC Resolver & Zones", desc: "Provision private hosted zones to route traffic within Amazon VPC networks." },
                { title: "Traffic Policy Designer", desc: "Setup latency, geoproximity, and failover active-active DNS routing rules." }
              ].map((feat, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(236, 114, 17, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px"
                  }}>
                    <span style={{ color: "#ec7211", fontWeight: 700, fontSize: "10px" }}>✓</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#16191f", textAlign: "left" }}>{feat.title}</span>
                    <span style={{ fontSize: "11px", color: "#545b64", marginTop: "2px", lineHeight: "1.3", textAlign: "left" }}>{feat.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "16px", borderTop: "1px solid #eaeded", paddingTop: "12px" }}>
            <span style={{ fontSize: "10px", color: "#879596", display: "block", textAlign: "left" }}>
              Route 53 Clone Core DNS Console Engine
            </span>
          </div>
        </div>

      </div>

      {/* Footer disclaimer and agreement terms */}
      <footer className="aws-footer">
        <div>
          By continuing, you agree to the <span style={{ color: "#0073bb", textDecoration: "underline", cursor: "pointer" }}>AWS Customer Agreement</span> or other agreement for AWS services, and the <span style={{ color: "#0073bb", textDecoration: "underline", cursor: "pointer" }}>Privacy Notice</span>. This site uses essential cookies. See our <span style={{ color: "#0073bb", textDecoration: "underline", cursor: "pointer" }}>Cookie Notice</span> for more information.
        </div>
        <div className="aws-footer-links">
          <span className="aws-footer-link" style={{ cursor: "pointer" }}>Terms of Use</span>
          <span className="aws-footer-link" style={{ cursor: "pointer" }}>Privacy Policy</span>
          <span className="aws-footer-link" style={{ cursor: "pointer" }}>Feedback</span>
          <span style={{ color: "#545b64", marginLeft: "10px" }}>© 2026, Amazon Web Services, Inc. or its affiliates.</span>
        </div>
      </footer>
    </div>
  );
}
