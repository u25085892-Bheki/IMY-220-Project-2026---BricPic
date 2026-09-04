import { Link } from "react-router-dom";
import { dummyPosts } from "../../dummyData";

function UserPosts() {
  // Wireframe 2: 2x2 grid of square dark cards with white borders and photo icons
  const postsToShow = dummyPosts.slice(0, 4);

  // Wireframe photo placeholder SVG
  const WireframePhotoIcon = () => (
    <svg
      className="wireframe-placeholder-icon"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="8" y="10" width="48" height="44" rx="8" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="20" cy="22" r="3.5" stroke="#ffffff" strokeWidth="2.5" />
      <path d="M12 48L26 34L40 48" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 42L44 32L52 40" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <section className="profile-gallery-container" aria-label="User photo gallery">
      <div className="profile-wireframe-grid">
        {postsToShow.map((post) => (
          <article key={post.id} className="grid-photo-tile">
            <Link to={`/post/${post.id}`} className="grid-photo-link" aria-label={`View ${post.title}`}>
              {post.image ? (
                <img src={post.image} alt={post.title} className="grid-photo-img" />
              ) : (
                <WireframePhotoIcon />
              )}
            </Link>
          </article>
        ))}

        {/* Fill up to 4 tiles if fewer posts exist, matching Wireframe 2 */}
        {Array.from({ length: Math.max(0, 4 - postsToShow.length) }).map((_, idx) => (
          <article key={`placeholder-${idx}`} className="grid-photo-tile">
            <div className="grid-photo-placeholder-box">
              <WireframePhotoIcon />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default UserPosts;

