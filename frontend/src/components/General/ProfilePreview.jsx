import { Link } from "react-router-dom";

/**
 * ProfilePreview — Compact friend preview card used in the profile friends list.
 * Displays the friend's avatar and username, linking to `/profile/${username}`.
 */
function ProfilePreview({ user }) {
  if (!user) return null;

  const username = typeof user === "string" ? user : (user.username || user.name || "Friend");
  const avatarSrc = typeof user === "object" ? (user.profileImage || user.avatar || "/blank-profile-picturesvg.svg") : "/blank-profile-picturesvg.svg";

  return (
    <div className="profile-friend-preview-item">
      <img
        src={avatarSrc}
        alt={username}
        className="friend-preview-avatar"
      />
      <Link
        to={`/profile/${username}`}
        className="friend-preview-name"
      >
        {username}
      </Link>
    </div>
  );
}

export default ProfilePreview;
