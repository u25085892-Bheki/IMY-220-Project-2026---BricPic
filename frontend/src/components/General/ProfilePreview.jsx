import { Link } from "react-router-dom";

/**
 * ProfilePreview — Compact friend preview card used in the profile friends list.
 * @param {{ user: { id: number, username: string, avatar: string } }} props
 */
function ProfilePreview({ user }) {
  if (!user) return null;

  return (
    <div className="profile-friend-preview-item">
      <img
        src={user.profileImage || user.avatar || "/blank-profile-picturesvg.svg"}
        alt={user.username}
        className="friend-preview-avatar"
      />
      <Link
        to={`/profile/${user._id || user.id}`}
        className="friend-preview-name"
      >
        {user.username}
      </Link>
    </div>
  );
}

export default ProfilePreview;
