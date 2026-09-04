import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div>
      <div>
        <h1>404 page not found</h1>
        <Link to="/home" className="btn-lego-submit not-found-btn">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
