import { Link } from "react-router-dom";
import SignUp from "../components/Splash_Page/SignUp";
import Logo from "../assets/BricPicLogo.svg";

function SignUpPage() {
  return (
    <div className="auth-page-container">
      <header className="auth-top-banner">
        <Link to="/" className="auth-logo-link" title="Return to Splash Page">
          <img src={Logo} alt="BricPic Logo" className="auth-banner-logo" />
        </Link>
      </header>

      <main className="auth-main-content">
        <div className="auth-lego-card">
          <h1 className="auth-page-title">Join Bric-Pic</h1>
          <p className="auth-page-subtitle">Create an account and show off your brick builds</p>
          <SignUp />
        </div>
      </main>
    </div>
  );
}

export default SignUpPage;

