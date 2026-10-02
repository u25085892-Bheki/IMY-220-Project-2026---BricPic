import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyUser } from "../../dummyData";
import ProfilePreview from "../General/ProfilePreview";
import CreatePost from "../General/CreatePost";

function Profile({ onEditBioClick }) {
  const navigate = useNavigate();
  const [isFriendsOpen, setIsFriendsOpen] = useState(true);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

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

  return (
    <div className="profile-sidebar-panel">
      {/* Wireframe 2: User Header with avatar, friend status indicator, and username */}
      <div className="profile-header-card">
        <div className="profile-avatar-status-row">
          <img
            src={dummyUser.avatar}
            alt={dummyUser.username}
            className="profile-user-avatar"
          />
          <div className="profile-friend-status-indicator">
            <span className="friend-status-dot" aria-hidden="true"></span>
            <span className="friend-status-text">
              {dummyUser.friendStatus === "self" ? "friend status" : dummyUser.friendStatus}
            </span>
          </div>
        </div>
        <h3 className="profile-username-heading">{dummyUser.username}</h3>
      </div>

      {/* Wireframe 2: Bio Box with "edit" button at top right and down arrow at bottom */}
      <div className="profile-section-card profile-bio-card">
        <div className="profile-section-header">
          <span className="profile-section-title">Bio</span>
          <button
            type="button"
            className="profile-bio-edit-btn"
            id="profile-edit-bio-btn"
            onClick={onEditBioClick}
          >
            edit
          </button>
        </div>
        <p className={`profile-bio-content ${isBioExpanded ? "expanded" : ""}`}>
          {dummyUser.bio}
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

      {/* Wireframe 2: Friends Box with friends list and down arrow at bottom */}
      <div className="profile-section-card profile-friends-card">
        <div className="profile-section-header">
          <span className="profile-section-title">friends</span>
        </div>
        {isFriendsOpen && (
          <div className="profile-friends-scroll-list">
            {dummyUser.friends.map((friend) => (
              <ProfilePreview key={friend.id} user={friend} />
            ))}
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

      {/* Create Post Action Button */}
      <div className="profile-actions-strip">
        <CreatePost />
      </div>

      {/* Wireframe 2: Red Logout Button at bottom-left */}
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
    </div>
  );
}

export default Profile;