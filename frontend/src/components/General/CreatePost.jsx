import { useState } from "react";

/**
 * CreatePost — Modal form that calls POST /api/posts to persist a new post.
 * Accepts an optional onPostCreated callback so parents can refresh.
 */
function CreatePost({ onPostCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [postImage, setPostImage] = useState("");
  const [hastag, setHastag] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  let currentUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) currentUser = JSON.parse(stored);
  } catch (e) { /* ignore */ }

  const resetForm = () => {
    setName("");
    setDescription("");
    setPostImage("");
    setHastag("");
    setFeedback("");
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) {
      setFeedback("You must be logged in to post.");
      return;
    }
    if (!name.trim() || !description.trim() || !postImage.trim() || !hastag.trim()) {
      setFeedback("All fields are required.");
      return;
    }

    setLoading(true);
    setFeedback("");
    try {
      const res = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser._id,
          name: name.trim(),
          description: description.trim(),
          postImage: postImage.trim(),
          hastag: hastag.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error || "Failed to create post.");
        return;
      }

      setFeedback("Post created!");
      if (onPostCreated) onPostCreated(data.post);
      setTimeout(handleClose, 900);
    } catch (err) {
      setFeedback("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        id="create-post-btn"
        className="btn-lego-create-post"
        onClick={() => setIsOpen(true)}
      >
        + NEW POST
      </button>

      {isOpen && (
        <div
          id="create-post-modal-overlay"
          className="lego-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div id="create-post-modal" className="lego-modal-dialog">
            <div className="lego-modal-header">
              <h2 className="lego-modal-title">Create a Post</h2>
              <button
                type="button"
                id="create-post-close-btn"
                className="lego-modal-close-btn"
                onClick={handleClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="lego-form" id="create-post-form">
              <div className="form-field-group">
                <label htmlFor="new-post-title" className="form-field-label">Title</label>
                <input
                  type="text"
                  id="new-post-title"
                  className="form-text-input"
                  placeholder="Give your build a name…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="new-post-image" className="form-field-label">Image URL</label>
                <input
                  type="text"
                  id="new-post-image"
                  className="form-text-input"
                  placeholder="Paste an image URL or base64 data URL"
                  value={postImage}
                  onChange={(e) => setPostImage(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="new-post-desc" className="form-field-label">Description</label>
                <textarea
                  id="new-post-desc"
                  className="form-text-area"
                  placeholder="Tell us about your build…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="new-post-tags" className="form-field-label">Hashtag</label>
                <input
                  type="text"
                  id="new-post-tags"
                  className="form-text-input"
                  placeholder="#lego"
                  value={hastag}
                  onChange={(e) => setHastag(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {feedback && (
                <p className={`form-feedback-message ${feedback === "Post created!" ? "success" : ""}`}>
                  {feedback}
                </p>
              )}

              <div className="lego-modal-actions">
                <button
                  type="submit"
                  id="create-post-submit-btn"
                  className="btn-lego-submit"
                  disabled={loading}
                >
                  {loading ? "Publishing…" : "Publish"}
                </button>
                <button
                  type="button"
                  className="btn-lego-cancel"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreatePost;
