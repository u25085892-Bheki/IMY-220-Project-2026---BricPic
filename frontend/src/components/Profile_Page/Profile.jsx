import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfilePreview from "../General/ProfilePreview";
import CreatePost from "../General/CreatePost";
import CreateAlbum from "./CreateAlbum";

function Profile({ onEditBioClick, onAlbumCreated }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFriendsOpen, setIsFriendsOpen] = useState(true);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  let currentUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) currentUser = JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse stored user", e);
  }

  const targetId = id || currentUser?._id;

  const fetchUserProfile = useCallback(async () => {
    if (!targetId) {
      setLoading(false);
      setError("No user specified. Please log in.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`http://localhost:3000/api/users/${targetId}`);
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        // If own profile, fetch details for each incoming friend request
        if (currentUser && String(currentUser._id) === String(data._id)) {
          const requests = data.friendRequests || [];
          if (requests.length > 0) {
            const reqUsers = await Promise.all(
              requests.map(rid =>
                fetch(`http://localhost:3000/api/users/${rid}`)
                  .then(r => r.json())
                  .catch(() => null)
              )
            );
            setPendingRequests(reqUsers.filter(u => u && u._id));
          } else {
            setPendingRequests([]);
          }
        }
      } else {
        setError(data.error || "User not found");
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setError("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  const handleSendRequest = async () => {
    await fetch(`http://localhost:3000/api/users/${user._id}/friend-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUserId: currentUser._id }),
    });
    fetchUserProfile();
  };

  const handleUnfriend = async () => {
    await fetch(`http://localhost:3000/api/users/${currentUser._id}/unfriend?friendId=${user._id}`, {
      method: "DELETE",
    });
    fetchUserProfile();
  };

  const handleAccept = async (fromUserId) => {
    await fetch(`http://localhost:3000/api/users/${currentUser._id}/accept-friend`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUserId }),
    });
    fetchUserProfile();
  };

  const handleDecline = async (fromUserId) => {
    await fetch(`http://localhost:3000/api/users/${currentUser._id}/decline-friend`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUserId }),
    });
    fetchUserProfile();
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

  const isOwnProfile = currentUser && String(currentUser._id) === String(user._id);

  // Friendship status for other profiles
  const friendsList = user.friendsList || [];
  const isFriend = !isOwnProfile && friendsList.some(f => String(f._id || f) === String(currentUser?._id));
  const sentRequest = !isOwnProfile && (user.friendRequests || []).some(r => String(r) === String(currentUser?._id));

  return (
    <div className="profile-sidebar-panel">
      {/* User Header */}
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
              {isOwnProfile ? "self" : isFriend ? "friend" : "not friends"}
            </span>
          </div>
        </div>
        <h3 className="profile-username-heading">
          {user.username}
          {user.pronouns ? ` (${user.pronouns})` : ""}
        </h3>

        {/* Friend action buttons — shown on other people's profiles */}
        {!isOwnProfile && currentUser && (
          <div style={{ marginTop: "8px" }}>
            {isFriend ? (
              <button
                type="button"
                className="btn-lego-cancel"
                onClick={handleUnfriend}
                style={{ fontSize: "0.8rem", padding: "4px 10px" }}
              >
                Remove Friend
              </button>
            ) : sentRequest ? (
              <span style={{ fontSize: "0.8rem", color: "#888" }}>Request Sent</span>
            ) : (
              <button
                type="button"
                className="btn-lego-submit"
                onClick={handleSendRequest}
                style={{ fontSize: "0.8rem", padding: "4px 10px" }}
              >
                Add Friend
              </button>
            )}
          </div>
        )}
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

      {/* Pending Friend Requests — own profile only */}
      {isOwnProfile && pendingRequests.length > 0 && (
        <div className="profile-section-card">
          <div className="profile-section-header">
            <span className="profile-section-title">Friend Requests ({pendingRequests.length})</span>
          </div>
          <div className="profile-friends-scroll-list">
            {pendingRequests.map(req => (
              <div key={req._id.toString()} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <img
                  src={req.profileImage || "/blank-profile-picturesvg.svg"}
                  alt={req.username}
                  style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                />
                <span style={{ flex: 1, fontSize: "0.85rem" }}>{req.username}</span>
                <button
                  type="button"
                  className="btn-lego-submit"
                  onClick={() => handleAccept(req._id)}
                  style={{ fontSize: "0.75rem", padding: "3px 8px" }}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="btn-lego-cancel"
                  onClick={() => handleDecline(req._id)}
                  style={{ fontSize: "0.75rem", padding: "3px 8px" }}
                >
                  Decline
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends Box */}
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

      {/* Create Post + Create Album (own profile) */}
      {isOwnProfile && (
        <div className="profile-actions-strip">
          <CreatePost />
          <CreateAlbum onAlbumCreated={onAlbumCreated} />
        </div>
      )}

      {/* Logout (own profile) */}
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
