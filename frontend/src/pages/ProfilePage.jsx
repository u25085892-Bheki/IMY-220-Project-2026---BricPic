import { useState } from "react";
import Navigation from "../components/General/Navigation";
import Profile from "../components/Profile_Page/Profile";
import EditProfile from "../components/Profile_Page/EditProfile";
import UserPosts from "../components/Profile_Page/UserPosts";

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="profile-page-container app-page">
      <Navigation />
      <main className="profile-page-layout">
        <div className="profile-left-column">
          <Profile onEditBioClick={() => setIsEditing(!isEditing)} />
          {isEditing && <EditProfile onClose={() => setIsEditing(false)} />}
        </div>
        <div className="profile-right-column">
          <UserPosts />
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
