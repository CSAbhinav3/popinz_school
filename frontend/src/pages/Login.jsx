import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock } from "lucide-react";

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "teacher" || user.role === "admin") {
        navigate("/dashboard");
      } else if (user.role === "parent") {
        navigate("/activity");
      }
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    console.log("LOGIN BUTTON CLICKED"); // 👈 ADD THIS LINE

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }

    try {
        setLoading(true);
        await login(email, password);
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        const isNetworkError = err.message === 'Failed to fetch' || err.name === 'TypeError';
        if (isNetworkError) {
            alert("Can't reach the server. Is the backend running? Start it with:\n\ncd backend\npy -m uvicorn app.main:app --reload --port 8000");
        } else {
            alert(err.message || "Invalid email or password.\n\nUse: parent@poppinz.com / Parent123 (capital P, then 123)");
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        padding: "4rem 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1 style={{ marginBottom: "0.5rem" }}>
        Welcome to Poppinz Preschool and Daycare
      </h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Login with your registered account
      </p>

      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Email */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label>Email</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Mail size={20} />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: "2rem" }}>
          <label>Password</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Lock size={20} />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Login Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "1rem",
            borderRadius: "14px",
            background: "var(--primary)",
            color: "white",
            border: "none",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            fontSize: "1.1rem",
          }}
        >
          {loading ? (
            "Logging in..."
          ) : (
            <>
              Login <ArrowRight size={20} />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "0.9rem",
  borderRadius: "10px",
  border: "2px solid var(--primary)20",
  fontSize: "1rem",
  outline: "none",
};

export default Login;
