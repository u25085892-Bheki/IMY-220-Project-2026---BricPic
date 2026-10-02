import { useState, useEffect, useCallback } from "react";
import PostPreview from "../General/PostPreview";

/**
 * Feed — fetches from the real API.
 * Global feed: GET /api/feed/global (all posts, newest first)
 * Friends feed: GET /api/feed/local/:userId (user + friends posts)
 * Falls back to global if no user is logged in.
 */
function Feed({ searchQuery }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedType, setFeedType] = useState("all");
  const [activeIdx, setActiveIdx] = useState(0);

  let currentUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) currentUser = JSON.parse(stored);
  } catch (e) { /* ignore */ }

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let url = "http://localhost:3000/api/feed/global";
      if (feedType === "friends" && currentUser?._id) {
        url = `http://localhost:3000/api/feed/local/${currentUser._id}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
        setActiveIdx(0);
      } else {
        setError(data.error || "Failed to load feed.");
      }
    } catch (err) {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [feedType, currentUser?._id]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Client-side search filter across name, description, hastag
  const filteredPosts = searchQuery
    ? posts.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.hastag && p.hastag.toLowerCase().includes(q))
        );
      })
    : posts;

  const total = filteredPosts.length;
  const safeIdx = total > 0 ? Math.min(activeIdx, total - 1) : 0;
  const prevIdx = (safeIdx - 1 + total) % total;
  const nextIdx = (safeIdx + 1) % total;

  const handlePrev = () => setActiveIdx((i) => (i - 1 + total) % total);
  const handleNext = () => setActiveIdx((i) => (i + 1) % total);

  const toggleFeed = () => {
    setFeedType((t) => (t === "all" ? "friends" : "all"));
    setActiveIdx(0);
  };

  if (loading) {
    return (
      <section className="feed-section" aria-label="Post feed">
        <div className="feed-loading">
          <div className="feed-spinner" />
          <p>Loading posts…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="feed-section" aria-label="Post feed">
        <p style={{ color: "#f87171", padding: "2rem", textAlign: "center" }}>{error}</p>
      </section>
    );
  }

  if (total === 0) {
    return (
      <section className="feed-section" aria-label="Post feed">
        <p style={{ color: "#888", padding: "2rem", textAlign: "center" }}>
          {feedType === "friends" ? "No posts from friends yet." : "No posts to show."}
        </p>
        <div className="feed-swap-container">
          <button
            type="button"
            id="feed-swap-btn"
            className="btn-feed-swap"
            onClick={toggleFeed}
          >
            <img src="/feedSwapButton.svg" alt="Feed Swap Icon" className="feed-swap-icon-img" />
            <span className="feed-swap-label">FEED SWAP</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="feed-section" aria-label="Post feed">
      <h2 className="feed-title">
        {feedType === "friends" ? "FRIENDS' POSTS" : "NEW POST"}
      </h2>

      {/* Coverflow Stage */}
      <div className="coverflow-stage">
        {/* Left side card */}
        {total > 1 && (
          <button
            type="button"
            className="coverflow-card coverflow-card-left"
            onClick={handlePrev}
            id="feed-prev-card"
            aria-label="Previous post"
          >
            <div className="coverflow-img-wrapper">
              <img
                src={filteredPosts[prevIdx].postImage}
                alt={filteredPosts[prevIdx].name}
                className="coverflow-side-img"
              />
            </div>
          </button>
        )}

        {/* Center active card */}
        <div className="coverflow-center-card" id="feed-active-card">
          <PostPreview post={filteredPosts[safeIdx]} />

          {total > 1 && (
            <div className="feed-dots-indicator">
              {filteredPosts.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`feed-dot-btn ${i === safeIdx ? "active" : ""}`}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Go to post ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right side card */}
        {total > 1 && (
          <button
            type="button"
            className="coverflow-card coverflow-card-right"
            onClick={handleNext}
            id="feed-next-card"
            aria-label="Next post"
          >
            <div className="coverflow-img-wrapper">
              <img
                src={filteredPosts[nextIdx].postImage}
                alt={filteredPosts[nextIdx].name}
                className="coverflow-side-img"
              />
            </div>
          </button>
        )}
      </div>

      {/* Feed Swap button */}
      <div className="feed-swap-container">
        <button
          type="button"
          id="feed-swap-btn"
          className="btn-feed-swap"
          onClick={toggleFeed}
          title={`Active: ${feedType === "all" ? "Global" : "Friends"}. Click to switch.`}
        >
          <img src="/feedSwapButton.svg" alt="Feed Swap Icon" className="feed-swap-icon-img" />
          <span className="feed-swap-label">FEED SWAP</span>
        </button>
      </div>
    </section>
  );
}

export default Feed;
