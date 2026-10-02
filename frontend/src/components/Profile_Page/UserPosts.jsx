import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

/**
 * UserPosts — fetches the profile owner's posts from GET /api/users/:id/posts
 * and renders them in a 2×2 (or more) photo grid.
 */
function UserPosts() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Resolve whose posts to show (URL param, or fall back to logged-in user)
  let currentUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) currentUser = JSON.parse(stored);
  } catch (e) { /* ignore */ }

  const targetId = id || currentUser?._id;

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:3000/api/users/${targetId}/posts`);
        const data = await res.json();
        if (res.ok) {
          setPosts(data);
        } else {
          setError(data.error || "Failed to load posts.");
        }
      } catch (err) {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [targetId]);

  // Placeholder icon for empty tiles
  const WireframePhotoIcon = () => (
    <svg
      className="wireframe-placeholder-icon"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="8" y="10" width="48" height="44" rx="8" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="20" cy="22" r="3.5" stroke="#ffffff" strokeWidth="2.5" />
      <path d="M12 48L26 34L40 48" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 42L44 32L52 40" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (loading) {
    return (
      <section className="profile-gallery-container" aria-label="User photo gallery">
        <p style={{ color: "#888", padding: "1rem", fontSize: "0.9rem" }}>Loading posts…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="profile-gallery-container" aria-label="User photo gallery">
        <p style={{ color: "#e53e3e", padding: "1rem", fontSize: "0.9rem" }}>{error}</p>
      </section>
    );
  }

  const postsToShow = posts.slice(0, 4);
  const placeholderCount = Math.max(0, 4 - postsToShow.length);

  return (
    <section className="profile-gallery-container" aria-label="User photo gallery">
      <div className="profile-wireframe-grid">
        {postsToShow.map((post) => {
          const pid = post._id.toString();
          return (
            <article key={pid} className="grid-photo-tile">
              <Link to={`/post/${pid}`} className="grid-photo-link" aria-label={`View ${post.name}`}>
                {post.postImage ? (
                  <img src={post.postImage} alt={post.name} className="grid-photo-img" />
                ) : (
                  <div className="grid-photo-placeholder-box">
                    <WireframePhotoIcon />
                  </div>
                )}
              </Link>
            </article>
          );
        })}

        {/* Fill remaining tiles with placeholders */}
        {Array.from({ length: placeholderCount }).map((_, idx) => (
          <article key={`placeholder-${idx}`} className="grid-photo-tile">
            <div className="grid-photo-placeholder-box">
              <WireframePhotoIcon />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default UserPosts;
