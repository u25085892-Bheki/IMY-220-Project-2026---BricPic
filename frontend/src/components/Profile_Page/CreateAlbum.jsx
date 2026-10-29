import { useState } from "react";

function CreateAlbum({ onAlbumCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  let currentUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) currentUser = JSON.parse(stored);
  } catch (e) { /* ignore */ }

  const handleClose = () => {
    setIsOpen(false);
    setName("");
    setDescription("");
    setHashtags("");
    setFeedback("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) { setFeedback("You must be logged in."); return; }
    if (!name.trim()) { setFeedback("Name is required."); return; }

    setLoading(true);
    setFeedback("");
    try {
      const res = await fetch("http://localhost:3000/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser._id,
          name: name.trim(),
          description: description.trim(),
          hashtags: hashtags.trim()
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback("Album created!");
        if (onAlbumCreated) onAlbumCreated(data.album);
        setTimeout(handleClose, 800);
      } else {
        setFeedback(data.error || "Failed to create album.");
      }
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
        id="create-album-btn"
        className="btn-lego-create-post"
        onClick={() => setIsOpen(true)}
      >
        + NEW ALBUM
      </button>

      {isOpen && (
        <div
          id="create-album-modal-overlay"
          className="lego-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div id="create-album-modal" className="lego-modal-dialog">
            <div className="lego-modal-header">
              <h2 className="lego-modal-title">Create Album</h2>
              <button
                type="button"
                className="lego-modal-close-btn"
                onClick={handleClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="lego-form" id="create-album-form">
              <div className="form-field-group">
                <label htmlFor="new-album-name" className="form-field-label">Name</label>
                <input
                  type="text"
                  id="new-album-name"
                  className="form-text-input"
                  placeholder="Album name…"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="new-album-desc" className="form-field-label">Description</label>
                <textarea
                  id="new-album-desc"
                  className="form-text-area"
                  placeholder="What is this album about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  disabled={loading}
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="new-album-tags" className="form-field-label">Hashtags</label>
                <input
                  type="text"
                  id="new-album-tags"
                  className="form-text-input"
                  placeholder="#lego #space #custom"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  disabled={loading}
                />
              </div>

              {feedback && (
                <p className={`form-feedback-message ${feedback === "Album created!" ? "success" : ""}`}>
                  {feedback}
                </p>
              )}

              <div className="lego-modal-actions">
                <button type="submit" id="create-album-submit-btn" className="btn-lego-submit" disabled={loading}>
                  {loading ? "Creating…" : "Create"}
                </button>
                <button type="button" className="btn-lego-cancel" onClick={handleClose} disabled={loading}>
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

export default CreateAlbum;
