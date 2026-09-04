import { useState } from "react";

/**
 * Comments — Comment list + add-comment form for the Post page.
 * @param {{ initialComments: Array<{id: number, username: string, text: string}> }} props
 */
function Comments({ initialComments = [] }) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = (e) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;

    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        username: "You",
        text: trimmed,
      },
    ]);
    setNewComment("");
  };

  return (
    <div className="polaroid-comments-container">
      <h4 className="comments-section-title">Comments ({comments.length})</h4>

      {/* Scrollable comment list */}
      <div className="comments-list-box" id="comments-list">
        {comments.length === 0 ? (
          <p className="comments-empty-notice">No comments yet. Be the first!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment-item-row">
              <span className="comment-user-badge">{c.username}:</span>
              <span className="comment-text-body">{c.text}</span>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      <form className="comment-submit-form" onSubmit={handleAddComment}>
        <label htmlFor="comment-input" className="visually-hidden">Add a comment</label>
        <input
          type="text"
          id="comment-input"
          className="comment-text-input"
          placeholder="Add a comment…"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          maxLength={280}
        />
        <button type="submit" id="comment-submit-btn" className="btn-comment-submit">
          Post
        </button>
      </form>
    </div>
  );
}

export default Comments;
