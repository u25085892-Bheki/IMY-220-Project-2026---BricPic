import { useState } from "react";
import { dummyUser } from "../../dummyData";

// EditProfile updates the shared dummy user so changes are visible in this session.
function EditProfile({ onClose }) {
  const [username, setUsername] = useState(dummyUser.username);
  const [bio, setBio] = useState(dummyUser.bio);
  const [message, setMessage] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    dummyUser.username = username;
    dummyUser.bio = bio;
    setMessage("Profile updated!");
    setTimeout(() => {
      if (onClose) onClose();
    }, 800);
  };

  return (
    <div className="edit-profile-card">
      <div className="edit-profile-header">
        <h4 className="edit-profile-title">Edit Profile</h4>
        {onClose && (
          <button type="button" className="btn-close-edit" onClick={onClose} aria-label="Close edit profile">
            ✕
          </button>
        )}
      </div>
      <form onSubmit={handleSave} className="lego-form">
        <div className="form-field-group">
          <label htmlFor="edit-username-input" className="form-field-label">Username</label>
          <input
            type="text"
            id="edit-username-input"
            className="form-text-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-field-group">
          <label htmlFor="edit-bio-input" className="form-field-label">Bio</label>
          <textarea
            id="edit-bio-input"
            className="form-text-area"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="2"
          ></textarea>
        </div>

        {message && <p className="form-feedback-message success">{message}</p>}

        <div className="edit-profile-buttons">
          <button type="submit" className="btn-lego-submit">Save</button>
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

export default EditProfile;
