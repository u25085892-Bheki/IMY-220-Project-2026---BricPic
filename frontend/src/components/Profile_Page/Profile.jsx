import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfilePreview from "../General/ProfilePreview";
import CreatePost from "../General/CreatePost";

function Profile({ onEditBioClick }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFriendsOpen, setIsFriendsOpen] = useState(true);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  let currentUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) currentUser = JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse stored user", e);
  }

  const targetId = id || currentUser?._id;

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      setError("No user specified. Please log in.");
      return;
    }

    const fetchUserProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`http://localhost:3000/api/users/${targetId}`);
        const data = await response.json();
        if (response.ok) {
          setUser(data);
        } else {
          setError(data.error || "User not found");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [targetId]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="profile-sidebar-panel">
        <p style={{ padding: "1.5rem", color: "#666" }}>Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-sidebar-panel">
        <p style={{ padding: "1.5rem", color: "#e53e3e" }}>{error || "User not found"}</p>
      </div>
    );
  }

  const isOwnProfile = currentUser && (currentUser._id === user._id || currentUser.id === user._id);
  const friendStatus = isOwnProfile ? "self" : "friend";

  return (
    <div className="profile-sidebar-panel">
      {/* User Header with avatar, friend status indicator, and username */}
      <div className="profile-header-card">
        <div className="profile-avatar-status-row">
          <img
            src={user.profileImage || "/blank-profile-picturesvg.svg"}
            alt={user.username}
            className="profile-user-avatar"
          />
          <div className="profile-friend-status-indicator">
            <span className="friend-status-dot" aria-hidden="true"></span>
            <span className="friend-status-text">
              {friendStatus}
            </span>
          </div>
        </div>
        <h3 className="profile-username-heading">
          {user.username}
          {user.pronouns ? ` (${user.pronouns})` : ""}
        </h3>
      </div>

      {/* Bio Box */}
      <div className="profile-section-card profile-bio-card">
        <div className="profile-section-header">
          <span className="profile-section-title">Bio</span>
          {isOwnProfile && (
            <button
              type="button"
              className="profile-bio-edit-btn"
              id="profile-edit-bio-btn"
              onClick={onEditBioClick}
            >
              edit
            </button>
          )}
        </div>
        <p className={`profile-bio-content ${isBioExpanded ? "expanded" : ""}`}>
          {user.bio || "No bio yet."}
        </p>
        <button
          type="button"
          className="profile-section-arrow-btn"
          onClick={() => setIsBioExpanded(!isBioExpanded)}
          aria-label="Toggle bio expansion"
        >
          <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L7 7L13 1" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Friends Box with friends list and down arrow at bottom */}
      <div className="profile-section-card profile-friends-card">
        <div className="profile-section-header">
          <span className="profile-section-title">friends</span>
        </div>
        {isFriendsOpen && (
          <div className="profile-friends-scroll-list">
            {(user.friendsList?.length > 0 || user.friends?.length > 0) ? (
              (user.friendsList || user.friends).map((friend, idx) => {
                const friendData = typeof friend === "string" ? { username: friend } : friend;
                return (
                  <ProfilePreview key={friendData._id || friendData.id || idx} user={friendData} />
                );
              })
            ) : (
              <p style={{ padding: "0.5rem 0", color: "#888", fontSize: "0.9rem" }}>No friends yet</p>
            )}
          </div>
        )}
        <button
          type="button"
          className="profile-section-arrow-btn"
          onClick={() => setIsFriendsOpen(!isFriendsOpen)}
          aria-label="Toggle friends list"
        >
          <svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L7 7L13 1" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Create Post Action Button (shown on own profile) */}
      {isOwnProfile && (
        <div className="profile-actions-strip">
          <CreatePost />
        </div>
      )}

      {/* Red Logout Button at bottom-left (shown on own profile) */}
      {isOwnProfile && (
        <div className="profile-logout-wrapper">
          <button
            type="button"
            id="profile-logout-btn"
            className="btn-wireframe-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;