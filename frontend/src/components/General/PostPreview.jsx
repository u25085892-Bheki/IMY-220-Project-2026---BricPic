import { Link } from "react-router-dom";

/**
 * PostPreview — card shown in the Home feed carousel matching Wireframe 1.
 * Features the square image above, and a light-grey card below with:
 * - by: [avatar] username on the left
 * - [Tag ✕] pills on the right
 * - description text below
 * @param {{ post: object }} props
 */
function PostPreview({ post }) {
  if (!post) return null;

  return (
    <div className="wireframe-feed-post">
      {/* Square Main Image */}
      <div className="feed-post-image-container">
        <Link to={`/post/${post.id}`} aria-label={`View ${post.title}`}>
          <img src={post.image} alt={post.title} className="feed-post-img" />
        </Link>
      </div>

      {/* Wireframe 1: Light grey container below post */}
      <div className="feed-post-info-box">
        <div className="feed-post-meta-row">
          <div className="feed-post-author-group">
            <span className="feed-post-by-prefix">by:</span>
            <img
              src={post.authorAvatar || "/blank-profile-picturesvg.svg"}
              alt={post.author}
              className="feed-post-author-avatar"
            />
            <Link to={`/profile/${post.id}`} className="feed-post-author-name">
              {post.author}
            </Link>
          </div>

          {/* Wireframe 1: Dark pill tags with 'x' */}
          {post.tags && post.tags.length > 0 && (
            <div className="feed-post-tags-row">
              {post.tags.map((tag, idx) => {
                const cleanTag = tag.startsWith("#") ? tag.slice(1) : tag;
                return (
                  <span key={idx} className="feed-tag-pill">
                    {cleanTag} <span className="feed-tag-close">✕</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Post description text */}
        <p className="feed-post-description">{post.description}</p>
      </div>
    </div>
  );
}

export default PostPreview;

