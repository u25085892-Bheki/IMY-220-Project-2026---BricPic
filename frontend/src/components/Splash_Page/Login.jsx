import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username === "" || password === "") {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Login successful:", data);
        navigate("/home");
      } else {
        setError(data.message || data.error || "Invalid username or password");
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
          placeholder="Enter your username"
          id="username"
          className="form-text-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="form-field-group">
        <label htmlFor="password" className="form-field-label">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          id="password"
          className="form-text-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="auth-error-banner" role="alert">{error}</p>}

      <button type="submit" className="btn-lego-auth-submit" id="login-submit-btn">
        Login
      </button>

      <div className="auth-switch-prompt">
        Don't have an account? <Link to="/signup" className="auth-inline-link">Sign Up</Link>
      </div>
    </form>
  );
}

export default Login;
