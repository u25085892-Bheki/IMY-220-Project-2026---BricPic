import { useState } from "react";

/**
 * CreatePost — A modal form for creating a new post.
 * Triggered by a button; shows a form with title, description, image URL, and hashtags.
 */
function CreatePost() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFeedback("Title and description are required.");
      return;
    }
    // In D1 (no backend), just show success feedback
    setFeedback("Post created! (D1 — not persisted)");
    setTimeout(() => {
      setIsOpen(false);
      setTitle("");
      setDescription("");
      setImageUrl("");
      setTags("");
      setFeedback("");
    }, 1200);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        id="create-post-btn"
        className="btn-lego-create-post"
        onClick={() => setIsOpen(true)}
      >
        + NEW POST
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          id="create-post-modal-overlay"
          className="lego-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            id="create-post-modal"
            className="lego-modal-dialog"
          >
            <div className="lego-modal-header">
              <h2 className="lego-modal-title">
                Create a Post
              </h2>
              <button
                type="button"
                id="create-post-close-btn"
                className="lego-modal-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="lego-form"
              id="create-post-form"
            >
              <div className="form-field-group">
                <label htmlFor="new-post-title" className="form-field-label">Title</label>
                <input
                  type="text"
                  id="new-post-title"
                  className="form-text-input"
                  placeholder="Give your build a name…"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="new-post-image" className="form-field-label">Image URL</label>
                <input
                  type="text"
                  id="new-post-image"
                  className="form-text-input"
                  placeholder="Paste an image URL (optional)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
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
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="new-post-tags" className="form-field-label">Hashtags</label>
                <input
                  type="text"
                  id="new-post-tags"
                  className="form-text-input"
                  placeholder="#lego #build #awesome"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              {feedback && (
                <p className="form-feedback-message">
                  {feedback}
                </p>
              )}

              <div className="lego-modal-actions">
                <button
                  type="submit"
                  id="create-post-submit-btn"
                  className="btn-lego-submit"
                >
                  Publish
                </button>
                <button
                  type="button"
                  className="btn-lego-cancel"
                  onClick={() => setIsOpen(false)}
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
