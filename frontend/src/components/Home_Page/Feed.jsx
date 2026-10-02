import { useState } from "react";
import { dummyPosts } from "../../dummyData";
import PostPreview from "../General/PostPreview";

function Feed({ filter, searchQuery }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [feedType, setFeedType] = useState(filter || "all");

  // Derive displayed posts from external filter prop + internal feedType toggle
  const activeFeed = filter || feedType;
  let posts = dummyPosts;
  if (activeFeed === "friends") posts = dummyPosts.filter((p) => p.isFriend);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))) ||
        p.description.toLowerCase().includes(q)
    );
  }

  const total = posts.length;
  const safeIdx = total > 0 ? Math.min(activeIdx, total - 1) : 0;

  const prevIdx = (safeIdx - 1 + total) % total;
  const nextIdx = (safeIdx + 1) % total;

  const handlePrev = () => setActiveIdx((i) => (i - 1 + total) % total);
  const handleNext = () => setActiveIdx((i) => (i + 1) % total);

  const toggleFeed = () =>
    setFeedType((t) => {
      const next = t === "all" ? "friends" : "all";
      setActiveIdx(0);
      return next;
    });

  if (total === 0) {
    return (
      <div>
        <p>No posts to show for this filter.</p>
      </div>
    );
  }

  return (
    <section className="feed-section" aria-label="Post feed">
      {/* Heading */}
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
                src={posts[prevIdx].image}
                alt={posts[prevIdx].title}
                className="coverflow-side-img"
              />
            </div>
          </button>
        )}

        {/* Center active card */}
        <div className="coverflow-center-card" id="feed-active-card">
          <PostPreview post={posts[safeIdx]} />

          {/* Dot indicators */}
          {total > 1 && (
            <div className="feed-dots-indicator">
              {posts.map((_, i) => (
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
                src={posts[nextIdx].image}
                alt={posts[nextIdx].title}
                className="coverflow-side-img"
              />
            </div>
          </button>
        )}
      </div>

      {/* Feed Swap button — bottom right matching Wireframe 1 */}
      <div className="feed-swap-container">
        <button
          type="button"
          id="feed-swap-btn"
          className="btn-feed-swap"
          onClick={toggleFeed}
          title={`Active feed: ${feedType === "all" ? "All" : "Friends"}. Click to switch.`}
        >
          <img src="/feedSwapButton.svg" alt="Feed Swap Icon" className="feed-swap-icon-img" />
          <span className="feed-swap-label">FEED SWAP</span>
        </button>
      </div>
    </section>
  );
}

export default Feed;
