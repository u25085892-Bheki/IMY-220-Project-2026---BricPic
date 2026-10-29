import { useState } from "react";

/**
 * CreatePost — Modal form that calls POST /api/posts to persist a new post.
 * Allows uploading images via multer (/api/upload, 10MB limit) or pasting a URL.
 * Supports multiple hashtags directly.
 */
function CreatePost({ onPostCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [postImage, setPostImage] = useState("");
  const [hastag, setHastag] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFeedback("Selected image is too large (max 10MB).");
      return;
    }

    setUploading(true);
    setFeedback("Uploading image…");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setPostImage(data.imageUrl);
        setFeedback("Image uploaded!");
      } else {
        setFeedback(data.error || "Failed to upload image.");
      }
    } catch (err) {
      setFeedback("Failed to connect to image upload service.");
    } finally {
      setUploading(false);
    }
  };

  // Multiple hashtags split directly
  const parsedTags = hastag
    ? hastag.split(/[,\s]+/).map(t => t.trim()).filter(Boolean).map(t => t.startsWith("#") ? t : `#${t}`)
    : [];

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
          hastag: parsedTags.join(" ") || hastag.trim(),
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
                <label htmlFor="new-post-image-file" className="form-field-label">Upload Image (Max 10MB)</label>
                <input
                  type="file"
                  id="new-post-image-file"
                  accept="image/*"
                  className="edit-file-input"
                  onChange={handleFileUpload}
                  disabled={loading || uploading}
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="new-post-image" className="form-field-label">Or Image URL</label>
                <input
                  type="text"
                  id="new-post-image"
                  className="form-text-input"
                  placeholder="Paste an image URL or base64 data URL"
                  value={postImage}
                  onChange={(e) => setPostImage(e.target.value)}
                  required
                  disabled={loading || uploading}
                />
              </div>

              {postImage && (
                <div style={{ textAlign: "center", marginBottom: "10px" }}>
                  <img
                    src={postImage}
                    alt="Preview"
                    style={{ maxHeight: "120px", maxWidth: "100%", borderRadius: "8px", objectFit: "contain" }}
                  />
                </div>
              )}

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
                <label htmlFor="new-post-tags" className="form-field-label">Hashtags</label>
                <input
                  type="text"
                  id="new-post-tags"
                  className="form-text-input"
                  placeholder="#lego #space #starwars"
                  value={hastag}
                  onChange={(e) => setHastag(e.target.value)}
                  required
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

              {feedback && (
                <p className={`form-feedback-message ${feedback.includes("created") || feedback.includes("uploaded") ? "success" : ""}`}>
                  {feedback}
                </p>
              )}

              <div className="lego-modal-actions">
                <button
                  type="submit"
                  id="create-post-submit-btn"
                  className="btn-lego-submit"
                  disabled={loading || uploading}
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
