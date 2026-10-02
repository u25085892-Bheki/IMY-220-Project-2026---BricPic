import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostImage from "./PostImage";
import Comments from "./Comments";
import EditPost from "./EditPost";

function Post() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  let currentUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) currentUser = JSON.parse(stored);
  } catch (e) { /* ignore */ }

  // Fetch the post from the real API
  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:3000/api/posts/${id}`);
        const data = await res.json();
        if (res.ok) {
          setPostData(data);
          setLikes(data.likes || 0);
        } else {
          setError(data.error || "Post not found.");
        }
      } catch (err) {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = () => {
    if (hasLiked) {
      setLikes((l) => l - 1);
      setHasLiked(false);
    } else {
      setLikes((l) => l + 1);
      setHasLiked(true);
    }
  };

  // PUT /api/posts/:id — update description and/or hastag
  const handleSaveEdits = async (updated) => {
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: updated.description,
          hastag: updated.hastag,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPostData(data.post);
      }
    } catch (err) {
      console.error("Failed to save edits:", err);
    }
    setIsEditing(false);
  };

  // DELETE /api/posts/:id
  const handleDelete = async () => {
    if (!window.confirm("Delete this post permanently?")) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        navigate(-1); // go back after deletion
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete post.");
      }
    } catch (err) {
      alert("Could not connect to the server.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <article className="polaroid-post-card">
        <p style={{ padding: "2rem", color: "#888" }}>Loading post…</p>
      </article>
    );
  }

  if (error || !postData) {
    return (
      <article className="polaroid-post-card">
        <p style={{ padding: "2rem", color: "#e53e3e" }}>{error || "Post not found."}</p>
      </article>
    );
  }

  const isOwner =
    currentUser &&
    postData.userId &&
    (currentUser._id === postData.userId.toString() ||
      currentUser._id === postData.userId);

  return (
    <article className="polaroid-post-card" aria-label={`Post: ${postData.name}`}>
      {/* Top Row: title + edit/delete actions (owner only) */}
      <header className="polaroid-header">
        <div className="polaroid-friend-badge" title="Post">P</div>
        <h2 className="polaroid-title">{postData.name}</h2>
        {isOwner && (
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              className="polaroid-edit-btn"
              id="post-edit-trigger"
              onClick={() => setIsEditing(!isEditing)}
              title="Edit this post"
              aria-label="Edit post"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.50001C19.3284 1.67158 20.6716 1.67158 21.5 2.50001C22.3284 3.32844 22.3284 4.67157 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="polaroid-edit-btn"
              id="post-delete-btn"
              onClick={handleDelete}
              disabled={deleteLoading}
              title="Delete this post"
              aria-label="Delete post"
              style={{ background: "#fee2e2" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21M8 6V4H16V6M19 6L18 20C18 20.5523 17.5523 21 17 21H7C6.44772 21 6 20.5523 6 20L5 6" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </header>

      {/* Post Image */}
      <PostImage src={postData.postImage} alt={postData.name} />

      {/* Action Buttons */}
      <div className="polaroid-actions-row">
        <div className="polaroid-left-actions">
          <button
            type="button"
            className={`action-icon-btn ${hasLiked ? "liked" : ""}`}
            onClick={handleLike}
            title={hasLiked ? "Unlike" : "Like"}
            aria-label="Like post"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill={hasLiked ? "#e3000b" : "none"} xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="polaroid-likes-count">{likes}</span>

          <button
            type="button"
            className="action-icon-btn"
            title="Comments"
            aria-label="View comments"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="polaroid-right-actions">
          <button
            type="button"
            className={`action-icon-btn ${isSaved ? "saved" : ""}`}
            onClick={() => setIsSaved(!isSaved)}
            title="Save to Album"
            aria-label="Save post"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill={isSaved ? "#fdb813" : "none"} xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button type="button" className="action-icon-btn" title="Share" aria-label="Share post">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 6L12 2L8 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 2V15" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Caption */}
      <p className="polaroid-caption">{postData.description}</p>

      {/* Hashtag */}
      {postData.hastag && (
        <div className="polaroid-tags-row">
          <span className="polaroid-tag-badge">{postData.hastag}</span>
        </div>
      )}

      {/* Inline Edit Form */}
      {isEditing && (
        <EditPost
          initialDescription={postData.description}
          initialHastag={postData.hastag}
          onSave={handleSaveEdits}
          onClose={() => setIsEditing(false)}
        />
      )}

      {/* Comments */}
      <div className="polaroid-comments-wrapper">
        <Comments postId={id} initialComments={postData.comments || []} />
      </div>
    </article>
  );
}

export default Post;