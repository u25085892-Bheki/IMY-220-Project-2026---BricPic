import { Link } from "react-router-dom";

/**
 * PostPreview — card shown in the Home feed carousel.
 * Handles hashtags directly without external utils.
 */
function PostPreview({ post }) {
  if (!post) return null;

  const postId = post._id?.toString() || post.id;
  const authorLink = post.authorName && post.authorName !== "Unknown"
    ? `/profile/${post.authorName}`
    : post.userId ? `/profile/${post.userId}` : "#";

  // Split multiple hashtags directly
  const tags = post.hastag
    ? (Array.isArray(post.hastag) ? post.hastag : String(post.hastag).split(/[,\s]+/)).filter(Boolean)
    : [];

  return (
    <div className="wireframe-feed-post">
      {/* Square Main Image */}
      <div className="feed-post-image-container">
        <Link to={`/post/${postId}`} aria-label={`View ${post.name}`}>
          <img
            src={post.postImage || "/blank-profile-picturesvg.svg"}
            alt={post.name || "Post"}
            className="feed-post-img"
          />
        </Link>
      </div>

      {/* Info box below image */}
      <div className="feed-post-info-box">
        <div className="feed-post-meta-row">
          <div className="feed-post-author-group">
            <span className="feed-post-by-prefix">by:</span>
            <img
              src={post.authorAvatar || "/blank-profile-picturesvg.svg"}
              alt="Author"
              className="feed-post-author-avatar"
            />
            <Link to={authorLink} className="feed-post-author-name">
              {post.authorName || post.author || "Unknown"}
            </Link>
          </div>

          {/* Multiple Hashtags row */}
          {tags.length > 0 && (
            <div className="feed-post-tags-row" style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {tags.map((tag, idx) => (
                <span key={idx} className="feed-tag-pill">
                  {tag.replace(/^#/, "")}
                  <span className="feed-tag-close">✕</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Post title + description */}
        <p className="feed-post-title-text">{post.name}</p>
        <p className="feed-post-description">{post.description}</p>
      </div>
    </div>
  );
}

export default PostPreview;
