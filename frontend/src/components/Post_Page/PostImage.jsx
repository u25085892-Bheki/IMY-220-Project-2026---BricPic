function PostImage({ src, alt }) {
  return (
    <div className="polaroid-img-frame">
      <img
        src={src || "/legoBuild1.jpg"}
        alt={alt || "LEGO Build"}
        className="polaroid-main-img"
      />
      {/* Wireframe 3: Expand icon in the bottom right corner of the image */}
      <button
        type="button"
        className="polaroid-expand-btn"
        title="View full size"
        aria-label="View full size photo"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 3H21V9M9 21H3V15M21 3L14 10M3 21L10 14" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export default PostImage;

