import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navigation from "../components/General/Navigation";
import Post from "../components/Post_Page/Post";

/**
 * PostsPage — Main page for viewing detailed post posts & browsing recent posts.
 * Fetches real post list from GET /api/feed/global for sidebar navigation.
 * Automatically routes to the first post if no valid post ID is provided in URL.
 */
function PostsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/feed/global");
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setPosts(data);
          // If current ID is invalid/placeholder (like '1') and we have real posts, navigate to the first real post
          if ((!id || id === "1") && data.length > 0) {
            navigate(`/post/${data[0]._id}`, { replace: true });
          }
        }
      } catch (err) {
        console.error("Failed to fetch posts for sidebar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [id, navigate]);

  return (
    <div className="posts-page-container app-page">
      <Navigation />
      <main className="posts-page-layout">
        {/* Left Sidebar: List of all posts from API */}
        <aside className="posts-sidebar-list">
          {loading ? (
            <p style={{ padding: "1.5rem", color: "var(--color-text-muted)" }}>Loading posts…</p>
          ) : posts.length === 0 ? (
            <p style={{ padding: "1.5rem", color: "var(--color-text-muted)" }}>No posts available.</p>
          ) : (
            posts.map((p) => {
              const pid = p._id ? p._id.toString() : p.id;
              return (
                <Link
                  key={pid}
                  to={`/post/${pid}`}
                  className={`sidebar-post-item ${pid === id ? "active" : ""}`}
                >
                  <img
                    src={p.postImage || "/blank-profile-picturesvg.svg"}
                    alt={p.name || "Post Image"}
                    className="sidebar-avatar"
                  />
                  <div className="sidebar-info">
                    <h4>{p.name}</h4>
                    <p>{p.description}</p>
                  </div>
                </Link>
              );
            })
          )}
        </aside>

        {/* Right Main Column: Detailed Polaroid Post Card */}
        <section className="posts-main-col">
          <Post />
        </section>
      </main>
    </div>
  );
}

export default PostsPage;
