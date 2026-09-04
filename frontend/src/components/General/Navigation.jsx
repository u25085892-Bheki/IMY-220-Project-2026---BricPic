import { Link, useLocation } from "react-router-dom";
import Logo from "../../assets/BricPicLogo.svg";

function Navigation() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <header className="bric-navbar" role="banner">
      <nav className="bric-nav-links" aria-label="Main Navigation">
        <Link
          to="/home"
          className={`nav-item ${path.startsWith("/home") ? "active" : ""}`}
          id="nav-home"
        >
          <span className="nav-label">HOME</span>
        </Link>
        <Link
          to="/profile/1"
          className={`nav-item ${path.startsWith("/profile") ? "active" : ""}`}
          id="nav-profile"
        >

          <span className="nav-label">PROFILE</span>
        </Link>
        <Link
          to="/post/1"
          className={`nav-item ${path.startsWith("/post") ? "active" : ""}`}
          id="nav-posts"
        >
         
          <span className="nav-label">POSTS</span>
        </Link>
      </nav>
      <div className="bric-nav-logo">
        <Link to="/home" title="Go to BricPic Home">
          <img src={Logo} alt="BricPic Logo" className="logo-img" />
        </Link>
      </div>
    </header>
  );
}

export default Navigation;