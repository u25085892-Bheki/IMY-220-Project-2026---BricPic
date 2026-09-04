import { useState } from "react";

// EditPost stores form values locally and sends the completed edit to its parent.
function EditPost({ initialTitle = "", initialDescription = "", initialTags = [], onSave, onClose }) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState(initialTags ? initialTags.join(" ") : "");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({ title, description, tags: tags.split(" ") });
    }
    setFeedback("Post updated!");
    setTimeout(() => {
      if (onClose) onClose();
    }, 600);
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
      <form onSubmit={handleSubmit} className="lego-form">
        <div className="form-field-group">
          <label htmlFor="edit-post-title-input" className="form-field-label">Title</label>
          <input
            type="text"
            id="edit-post-title-input"
            className="form-text-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-field-group">
          <label htmlFor="edit-post-desc-input" className="form-field-label">Description</label>
          <textarea
            id="edit-post-desc-input"
            className="form-text-area"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="2"
            required
          ></textarea>
        </div>

        <div className="form-field-group">
          <label htmlFor="edit-post-tags-input" className="form-field-label">Tags</label>
          <input
            type="text"
            id="edit-post-tags-input"
            className="form-text-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        {feedback && <p className="form-feedback-message success">{feedback}</p>}

        <div className="edit-post-actions">
          <button type="submit" className="btn-lego-submit">
            Save
          </button>
          {onClose && (
            <button type="button" className="btn-lego-cancel" onClick={onClose}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditPost;
