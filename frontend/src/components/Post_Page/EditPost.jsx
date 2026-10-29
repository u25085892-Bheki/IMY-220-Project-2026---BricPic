import { useState } from "react";

/**
 * EditPost — inline form for editing a post's description and multiple hashtags.
 * Handles hashtag splitting directly.
 */
function EditPost({ initialDescription = "", initialHastag = "", onSave, onClose }) {
  const [description, setDescription] = useState(initialDescription);
  const [hastag, setHastag] = useState(initialHastag);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const parsedTags = hastag
    ? hastag.split(/[,\s]+/).map(t => t.trim()).filter(Boolean).map(t => t.startsWith("#") ? t : `#${t}`)
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setFeedback("Description is required.");
      return;
    }
    setLoading(true);
    setFeedback("");
    await onSave({ description: description.trim(), hastag: parsedTags.join(" ") || hastag.trim() });
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
          <label htmlFor="edit-post-hastag-input" className="form-field-label">Hashtags</label>
          <input
            type="text"
            id="edit-post-hastag-input"
            className="form-text-input"
            value={hastag}
            onChange={(e) => setHastag(e.target.value)}
            placeholder="#lego #space #starwars"
            disabled={loading}
          />
          {parsedTags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
              {parsedTags.map((t, idx) => (
                <span key={idx} style={{
                  background: "#f3f4f6",
                  color: "#374151",
                  fontSize: "0.75rem",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontWeight: 600
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}
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
