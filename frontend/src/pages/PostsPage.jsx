import { Link, useParams } from "react-router-dom";
import Navigation from "../components/General/Navigation";
import Post from "../components/Post_Page/Post";
import { dummyPosts } from "../dummyData";

function PostsPage() {
  const { id } = useParams();
  const currentPostId = parseInt(id) || 1;

  return (
    <div className="posts-page-container app-page">
      <Navigation />
      <main className="posts-page-layout">
        {/* Left Sidebar: List of all posts / authors */}
        <aside className="posts-sidebar-list">
          {dummyPosts.map((p) => (
            <Link
              key={p.id}
              to={`/post/${p.id}`}
              className={`sidebar-post-item ${p.id === currentPostId ? "active" : ""}`}
            >
              <img
                src={p.authorAvatar || "/blank-profile-picturesvg.svg"}
                alt={p.author}
                className="sidebar-avatar"
              />
              <div className="sidebar-info">
                <h4>{p.author}</h4>
                <p>{p.description}</p>
              </div>
            </Link>
          ))}
        </aside>

        {/* Right Main Column: Detailed Polaroid Post Card */}
        <section className="posts-main-col">
          <Post />
        </section>
      </main>
    </div>
  );
}

export default PostsPage;
