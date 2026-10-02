import { useState } from "react";

/**
 * EditPost — inline form for editing a post's description and hashtag.
 * Calls the parent's onSave({ description, hastag }) which handles the API call.
 */
function EditPost({ initialDescription = "", initialHastag = "", onSave, onClose }) {
  const [description, setDescription] = useState(initialDescription);
  const [hastag, setHastag] = useState(initialHastag);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setFeedback("Description is required.");
      return;
    }
    setLoading(true);
    setFeedback("");
    await onSave({ description: description.trim(), hastag: hastag.trim() });
    setFeedback("Post updated!");
    setLoading(false);
    setTimeout(() => { if (onClose) onClose(); }, 600);
  };

  return (
    <div className="edit-post-card">
      <div className="edit-post-header">
        <h4 className="edit-post-title">Edit Post</h4>
        {onClose && (
          <button type="button" className="btn-close-edit" onClick={onClose} aria-label="Close edit post">
            ✕
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="lego-form" id="edit-post-form">
        <div className="form-field-group">
          <label htmlFor="edit-post-desc-input" className="form-field-label">Description</label>
          <textarea
            id="edit-post-desc-input"
            className="form-text-area"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            required
            disabled={loading}
          />
        </div>

        <div className="form-field-group">
          <label htmlFor="edit-post-hastag-input" className="form-field-label">Hashtag</label>
          <input
            type="text"
            id="edit-post-hastag-input"
            className="form-text-input"
            value={hastag}
            onChange={(e) => setHastag(e.target.value)}
            placeholder="#lego"
            disabled={loading}
          />
        </div>

        {feedback && <p className="form-feedback-message success">{feedback}</p>}

        <div className="edit-post-actions">
          <button type="submit" className="btn-lego-submit" id="edit-post-save-btn" disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </button>
          {onClose && (
            <button type="button" className="btn-lego-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditPost;
