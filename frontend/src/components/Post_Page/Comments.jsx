import { useState } from "react";

/**
 * Comments — Comment list + add-comment form.
 * Calls POST /api/posts/:postId/comments to persist each new comment.
 * @param {{ postId: string, initialComments: Array }} props
 */
function Comments({ postId, initialComments = [] }) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  let currentUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) currentUser = JSON.parse(stored);
  } catch (e) { /* ignore */ }

  const handleAddComment = async (e) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;

    if (!currentUser?._id) {
      setError("You must be logged in to comment.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser._id,
          username: currentUser.username,
          message: trimmed,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data.comment]);
        setNewComment("");
      } else {
        setError(data.error || "Failed to post comment.");
      }
    } catch (err) {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="polaroid-comments-container">
      <h4 className="comments-section-title">Comments ({comments.length})</h4>

      {/* Scrollable comment list */}
      <div className="comments-list-box" id="comments-list">
        {comments.length === 0 ? (
          <p className="comments-empty-notice">No comments yet. Be the first!</p>
        ) : (
          comments.map((c, i) => (
            <div key={c._id?.toString() || c.id || i} className="comment-item-row">
              <span className="comment-user-badge">{c.username}:</span>
              <span className="comment-text-body">{c.message || c.text}</span>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      <form className="comment-submit-form" onSubmit={handleAddComment} id="comment-form">
        <label htmlFor="comment-input" className="visually-hidden">Add a comment</label>
        <input
          type="text"
          id="comment-input"
          className="comment-text-input"
          placeholder="Add a comment…"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          maxLength={280}
          disabled={loading}
        />
        <button
          type="submit"
          id="comment-submit-btn"
          className="btn-comment-submit"
          disabled={loading}
        >
          {loading ? "…" : "Post"}
        </button>
      </form>

      {error && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "6px" }}>{error}</p>}
    </div>
  );
}

export default Comments;
