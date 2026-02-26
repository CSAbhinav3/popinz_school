import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Sparkles } from "lucide-react";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "teacher") {
        navigate("/dashboard");
      } else if (user.role === "parent") {
        navigate("/activity");
      }
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    setErrorMessage("");
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      const isNetworkError = err.message === "Failed to fetch" || err.name === "TypeError";
      if (isNetworkError) {
        setErrorMessage("Can't reach the server. Is the backend running? Start it with: cd backend then py -m uvicorn app.main:app --reload --port 8000");
      } else {
        const msg = err?.message;
        setErrorMessage(typeof msg === "string" ? msg : "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1rem",
        background: "linear-gradient(160deg, #f0f9ff 0%, #fef7f5 50%, #f7fff7 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--card-bg, #ffffff)",
          borderRadius: "24px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08), 0 4px 12px rgba(255,107,107,0.06)",
          padding: "2.5rem 2rem",
          border: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <Sparkles size={28} color="white" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: "1.5rem", color: "var(--text)", marginBottom: "0.35rem", fontWeight: 800 }}>
            Welcome back
          </h1>
          <p style={{ color: "#666", fontSize: "0.95rem" }}>
            Sign in to your Poppinz account
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              marginBottom: "1.25rem",
              padding: "0.85rem 1rem",
              borderRadius: "12px",
              background: "rgba(255, 107, 107, 0.12)",
              border: "1px solid rgba(255, 107, 107, 0.3)",
              color: "var(--primary)",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>
            Email
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0 1rem",
              borderRadius: "14px",
              border: "2px solid #e8e8e8",
              background: "#fafafa",
              transition: "border-color 0.2s, background 0.2s",
            }}
            className="login-input-wrap"
          >
            <Mail size={20} color="#999" style={{ flexShrink: 0 }} />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: "1.75rem" }}>
          <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>
            Password
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0 1rem",
              borderRadius: "14px",
              border: "2px solid #e8e8e8",
              background: "#fafafa",
              transition: "border-color 0.2s, background 0.2s",
            }}
            className="login-input-wrap"
          >
            <Lock size={20} color="#999" style={{ flexShrink: 0 }} />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "1rem 1.25rem",
            borderRadius: "14px",
            background: "linear-gradient(135deg, var(--primary) 0%, #e85555 100%)",
            color: "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            fontSize: "1.05rem",
            fontWeight: 700,
            boxShadow: "0 6px 20px rgba(255,107,107,0.35)",
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading ? (
            "Logging in..."
          ) : (
            <>
              Sign in <ArrowRight size={20} />
            </>
          )}
        </motion.button>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "#888" }}>
          <Link to="/" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            ← Back to home
          </Link>
        </p>
      </motion.div>

      <style>{`
        .login-input-wrap:focus-within {
          border-color: var(--primary) !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(255,107,107,0.15);
        }
        .login-input-wrap input::placeholder {
          color: #aaa;
        }
      `}</style>
    </div>
  );
};

const inputStyle = {
  flex: 1,
  padding: "1rem 0",
  border: "none",
  background: "transparent",
  fontSize: "1rem",
  outline: "none",
  color: "var(--text)",
};

export default Login;
