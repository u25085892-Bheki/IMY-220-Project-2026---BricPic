import { useState } from "react";

function EditProfile({ onClose, onProfileUpdated }) {
  let currentUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) currentUser = JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse stored user", e);
  }

  const [username, setUsername] = useState(currentUser?.username || "");
  const [pronouns, setPronouns] = useState(currentUser?.pronouns || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage || "/blank-profile-picturesvg.svg");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setIsSuccess(false);
        setMessage("Selected image is too large (max 5MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setIsSuccess(false);
      setMessage("Username cannot be empty");
      return;
    }

    const userId = currentUser?._id;
    if (!userId) {
      setIsSuccess(false);
      setMessage("You must be logged in to edit your profile");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          pronouns: pronouns.trim(),
          bio: bio.trim(),
          profileImage: profileImage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = data.user || {
          ...currentUser,
          username: username.trim(),
          pronouns: pronouns.trim(),
          bio: bio.trim(),
          profileImage: profileImage,
        };

        // Update local session storage
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setIsSuccess(true);
        setMessage("Profile updated successfully!");

        if (onProfileUpdated) {
          onProfileUpdated(updatedUser);
        }

        setTimeout(() => {
          if (onClose) onClose();
        }, 800);
      } else {
        setIsSuccess(false);
        setMessage(data.error || data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setIsSuccess(false);
      setMessage("Failed to connect to the server");
    } finally {
      setIsSaving(false);
    }
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
        {/* Profile Picture Upload Field */}
        <div className="form-field-group">
          <label htmlFor="edit-profile-image-file" className="form-field-label">Profile Picture</label>
          <div className="edit-profile-avatar-row">
            <img
              src={profileImage || "/blank-profile-picturesvg.svg"}
              alt="Avatar Preview"
              className="edit-avatar-preview-img"
            />
            <input
              type="file"
              id="edit-profile-image-file"
              accept="image/*"
              className="edit-file-input"
              onChange={handleImageChange}
            />
          </div>
        </div>

        {/* Username Field */}
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

        {/* Pronouns Field */}
        <div className="form-field-group">
          <label htmlFor="edit-pronouns-input" className="form-field-label">Pronouns</label>
          <input
            type="text"
            id="edit-pronouns-input"
            className="form-text-input"
            placeholder="e.g. they/them, she/her, he/him"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
          />
        </div>

        {/* Bio Field */}
        <div className="form-field-group">
          <label htmlFor="edit-bio-input" className="form-field-label">Bio</label>
          <textarea
            id="edit-bio-input"
            className="form-text-area"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="3"
            placeholder="Tell us about yourself..."
          ></textarea>
        </div>

        {message && (
          <p className={`form-feedback-message ${isSuccess ? "success" : ""}`}>
            {message}
          </p>
        )}

        <div className="edit-profile-buttons">
          <button type="submit" className="btn-lego-submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          {onClose && (
            <button type="button" className="btn-lego-cancel" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
