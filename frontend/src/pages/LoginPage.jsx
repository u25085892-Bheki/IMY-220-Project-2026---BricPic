import { Link } from "react-router-dom";
import Login from "../components/Splash_Page/Login";
import Logo from "../assets/BricPicLogo.svg";

function LoginPage() {
  return (
    <div className="auth-page-container">
      <header className="auth-top-banner">
        <Link to="/" className="auth-logo-link" title="Return to Splash Page">
          <img src={Logo} alt="BricPic Logo" className="auth-banner-logo" />
        </Link>
      </header>

      <main className="auth-main-content">
        <div className="auth-lego-card">
          <h1 className="auth-page-title">Welcome Back</h1>
          <p className="auth-page-subtitle">Log in to continue building and sharing</p>
          <Login />
        </div>
      </main>
    </div>
  );
}

export default LoginPage;

