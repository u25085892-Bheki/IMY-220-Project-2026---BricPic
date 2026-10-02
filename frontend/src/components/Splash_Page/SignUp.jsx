import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username === "" || password === "" || email === "") {
      setError("Please fill in all fields");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters long and contain at least one uppercase letter and one symbol."
      );
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        console.log("SignUp successful:", data);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        navigate("/home");
      } else {
        setError(data.message || data.error || "SignUp failed");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server (check backend)");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="lego-auth-form">
      <div className="form-field-group">
        <label htmlFor="username" className="form-field-label">Username</label>
        <input
          type="text"
          placeholder="Choose a username"
          id="username"
          className="form-text-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="form-field-group">
        <label htmlFor="email" className="form-field-label">Email</label>
        <input
          type="email"
          placeholder="Enter your email address"
          id="email"
          className="form-text-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-field-group">
        <label htmlFor="password" className="form-field-label">Password</label>
        <input
          type="password"
          placeholder="Choose a secure password"
          id="password"
          className="form-text-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="auth-error-banner" role="alert">{error}</p>}

      <button type="submit" className="btn-lego-auth-submit" id="signup-submit-btn">
        Sign Up
      </button>

      <div className="auth-switch-prompt">
        Already have an account? <Link to="/login" className="auth-inline-link">Log In</Link>
      </div>
    </form>
  );
}

export default SignUp;
