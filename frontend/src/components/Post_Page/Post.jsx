import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostImage from "./PostImage";
import Comments from "./Comments";
import EditPost from "./EditPost";

function Post() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // States for album add/remove
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [userAlbums, setUserAlbums] = useState([]);
  const [albumFeedback, setAlbumFeedback] = useState("");

  // States for report reasons from /api/reports/reasons
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReasons, setReportReasons] = useState([]);
  const [selectedReasonId, setSelectedReasonId] = useState("");
  const [reportFeedback, setReportFeedback] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  let currentUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) currentUser = JSON.parse(stored);
  } catch (e) { /* ignore */ }

  // Load report reasons from the API endpoint on mount
  useEffect(() => {
    fetch("http://localhost:3000/api/reports/reasons")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setReportReasons(data);
          setSelectedReasonId(data[0]._id);
        }
      })
      .catch((err) => console.error("Failed to fetch report reasons:", err));
  }, []);

  const fetchUserAlbums = useCallback(async () => {
    if (!currentUser?._id) return;
    try {
      const res = await fetch(`http://localhost:3000/api/users/${currentUser._id}/albums`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setUserAlbums(data);
        const inAny = data.some((a) => (a.postslist || []).some((pid) => String(pid) === String(id)));
        setIsSaved(inAny);
      }
    } catch (err) {
      console.error("Failed to fetch user albums:", err);
    }
  }, [currentUser?._id, id]);

  // Fetch the post from the real API
  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:3000/api/posts/${id}`);
        const data = await res.json();
        if (res.ok) {
          setPostData(data);
          setLikes(data.likes || 0);
          if (currentUser?._id) {
            const liked = (data.likedBy || []).some((uid) => String(uid) === String(currentUser._id));
            setHasLiked(liked);
          }
        } else {
          setError(data.error || "Post not found.");
        }
      } catch (err) {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    fetchUserAlbums();
  }, [id, fetchUserAlbums, currentUser?._id]);

  // Call POST /api/posts/:id/like — toggles like on the server
  const handleLike = async () => {
    if (!currentUser?._id) return;
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser._id }),
      });
      const data = await res.json();
      if (res.ok) {
        setLikes(data.likes);
        setHasLiked(data.hasLiked);
      }
    } catch (err) {
      console.error("Failed to like:", err);
    }
  };

  // Add or remove this post from a specific album
  const handleToggleAlbum = async (albumId, action) => {
    if (!currentUser?._id || !id) return;
    try {
      const res = await fetch(`http://localhost:3000/api/albums/${albumId}/posts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser._id,
          postId: id,
          action,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlbumFeedback(action === "add" ? "Added to album!" : "Removed from album.");
        fetchUserAlbums();
      } else {
        setAlbumFeedback(data.error || "Failed to update album.");
      }
    } catch (err) {
      setAlbumFeedback("Connection error.");
    }
  };

  // Open report form and load reasons from endpoint
  const openReportModal = async () => {
    const nextState = !showReportModal;
    setShowReportModal(nextState);
    setShowAlbumPicker(false);
    setReportFeedback("");
    if (nextState) {
      try {
        const res = await fetch("http://localhost:3000/api/reports/reasons");
        const data = await res.json();
        if (res.ok && Array.isArray(data) && data.length > 0) {
          setReportReasons(data);
          if (!selectedReasonId) {
            setSelectedReasonId(data[0]._id);
          }
        }
      } catch (err) {
        console.error("Failed to load report reasons:", err);
      }
    }
  };

  // Submit report to POST /api/posts/:id/report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) {
      setReportFeedback("You must be logged in to report.");
      return;
    }
    if (!selectedReasonId) {
      setReportFeedback("Please choose a reason.");
      return;
    }

    setReportLoading(true);
    setReportFeedback("");
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser._id,
          reasonId: selectedReasonId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReportFeedback("Post reported. Thank you for your feedback.");
        setTimeout(() => setShowReportModal(false), 1200);
      } else {
        setReportFeedback(data.error || "Failed to submit report.");
      }
    } catch (err) {
      setReportFeedback("Could not connect to server.");
    } finally {
      setReportLoading(false);
    }
  };

  // PUT /api/posts/:id — update description and/or hastag
  const handleSaveEdits = async (updated) => {
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: updated.description,
          hastag: updated.hastag,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPostData(data.post);
      }
    } catch (err) {
      console.error("Failed to save edits:", err);
    }
    setIsEditing(false);
  };

  // DELETE /api/posts/:id
  const handleDelete = async () => {
    if (!window.confirm("Delete this post permanently?")) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/posts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        navigate(-1);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete post.");
      }
    } catch (err) {
      alert("Could not connect to the server.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <article className="polaroid-post-card">
        <p style={{ padding: "2rem", color: "#888" }}>Loading post…</p>
      </article>
    );
  }

  if (error || !postData) {
    return (
      <article className="polaroid-post-card">
        <p style={{ padding: "2rem", color: "#e53e3e" }}>{error || "Post not found."}</p>
      </article>
    );
  }

  const isOwner =
    currentUser &&
    postData.userId &&
    (String(currentUser._id) === String(postData.userId));

  // Split multiple hashtags directly
  const tags = postData.hastag
    ? (Array.isArray(postData.hastag) ? postData.hastag : String(postData.hastag).split(/[,\s]+/)).filter(Boolean)
    : [];

  return (
    <article className="polaroid-post-card" aria-label={`Post: ${postData.name}`}>
      {/* Top Row: title + edit/delete actions (owner only) */}
      <header className="polaroid-header">
        <div className="polaroid-friend-badge" title="Post">P</div>
        <h2 className="polaroid-title">{postData.name}</h2>
        {isOwner && (
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              className="polaroid-edit-btn"
              id="post-edit-trigger"
              onClick={() => setIsEditing(!isEditing)}
              title="Edit this post"
              aria-label="Edit post"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.50001C19.3284 1.67158 20.6716 1.67158 21.5 2.50001C22.3284 3.32844 22.3284 4.67157 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="polaroid-edit-btn"
              id="post-delete-btn"
              onClick={handleDelete}
              disabled={deleteLoading}
              title="Delete this post"
              aria-label="Delete post"
              style={{ background: "#fee2e2" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21M8 6V4H16V6M19 6L18 20C18 20.5523 17.5523 21 17 21H7C6.44772 21 6 20.5523 6 20L5 6" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </header>

      {/* Post Image */}
      <PostImage src={postData.postImage} alt={postData.name} />

      {/* Action Buttons */}
      <div className="polaroid-actions-row">
        <div className="polaroid-left-actions">
          <button
            type="button"
            className={`action-icon-btn ${hasLiked ? "liked" : ""}`}
            onClick={handleLike}
            title={hasLiked ? "Unlike" : "Like"}
            aria-label="Like post"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill={hasLiked ? "#e3000b" : "none"} xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="polaroid-likes-count">{likes}</span>

          <button
            type="button"
            className="action-icon-btn"
            title="Comments"
            aria-label="View comments"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="polaroid-right-actions">
          {/* Bookmark / Save to Album Button */}
          <button
            type="button"
            className={`action-icon-btn ${isSaved ? "saved" : ""}`}
            onClick={() => {
              setShowAlbumPicker(!showAlbumPicker);
              setShowReportModal(false);
              setAlbumFeedback("");
            }}
            title="Save / Manage Albums"
            aria-label="Save post to album"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill={isSaved ? "#fdb813" : "none"} xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Action icon for Report Form */}
          <button
            type="button"
            className="action-icon-btn"
            title="Report Post"
            aria-label="Report post"
            onClick={openReportModal}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V22" stroke="#b91c1c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Album Picker Panel */}
      {showAlbumPicker && (
        <div style={{
          background: "#f9fafb",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          padding: "10px 12px",
          margin: "10px 0"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Add or Remove from Your Albums:</span>
            <button
              type="button"
              onClick={() => setShowAlbumPicker(false)}
              style={{ border: "none", background: "none", cursor: "pointer", fontSize: "14px", color: "#666" }}
              aria-label="Close album picker"
            >
              ✕
            </button>
          </div>

          {!currentUser ? (
            <p style={{ fontSize: "0.8rem", color: "#888", margin: 0 }}>Please log in to manage albums.</p>
          ) : userAlbums.length === 0 ? (
            <p style={{ fontSize: "0.8rem", color: "#888", margin: 0 }}>You don't have any albums yet. Create one on your profile!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {userAlbums.map((album) => {
                const inAlbum = (album.postslist || []).some((pid) => String(pid) === String(postData._id));
                return (
                  <div
                    key={album._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "5px 8px",
                      background: inAlbum ? "#dcfce7" : "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "0.85rem"
                    }}
                  >
                    <span>
                      {album.name} {inAlbum ? "✓" : ""}
                    </span>
                    <button
                      type="button"
                      className={inAlbum ? "btn-lego-cancel" : "btn-lego-submit"}
                      style={{ fontSize: "0.75rem", padding: "2px 8px" }}
                      onClick={() => handleToggleAlbum(album._id, inAlbum ? "remove" : "add")}
                    >
                      {inAlbum ? "Remove" : "+ Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {albumFeedback && (
            <p style={{
              fontSize: "0.75rem",
              margin: "6px 0 0 0",
              fontWeight: 600,
              color: albumFeedback.includes("Added") ? "#16a34a" : "#dc2626"
            }}>
              {albumFeedback}
            </p>
          )}
        </div>
      )}

      {/* Report Form Panel */}
      {showReportModal && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          padding: "10px 12px",
          margin: "10px 0"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#991b1b" }}>Report this Post</span>
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              style={{ border: "none", background: "none", cursor: "pointer", fontSize: "14px", color: "#666" }}
              aria-label="Close report form"
            >
              ✕
            </button>
          </div>

          {!currentUser ? (
            <p style={{ fontSize: "0.8rem", color: "#888", margin: 0 }}>Please log in to report posts.</p>
          ) : isOwner ? (
            <p style={{ fontSize: "0.8rem", color: "#b91c1c", margin: 0 }}>You cannot report your own post.</p>
          ) : (
            <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 600 }}>Choose a reason:</label>
              {reportReasons.length === 0 ? (
                <p style={{ fontSize: "0.8rem", color: "#888", margin: 0 }}>Loading reasons from server…</p>
              ) : (
                <select
                  className="form-text-input"
                  style={{ fontSize: "0.85rem", padding: "6px 8px" }}
                  value={selectedReasonId}
                  onChange={(e) => setSelectedReasonId(e.target.value)}
                  disabled={reportLoading}
                  required
                >
                  {reportReasons.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.reason}
                    </option>
                  ))}
                </select>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button
                  type="submit"
                  className="btn-lego-submit"
                  disabled={reportLoading || reportReasons.length === 0}
                  style={{ fontSize: "0.8rem", padding: "4px 12px", background: "#b91c1c" }}
                >
                  {reportLoading ? "Reporting…" : "Submit Report"}
                </button>
                <button
                  type="button"
                  className="btn-lego-cancel"
                  style={{ fontSize: "0.8rem", padding: "4px 10px" }}
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {reportFeedback && (
            <p style={{
              fontSize: "0.75rem",
              margin: "6px 0 0 0",
              fontWeight: 600,
              color: reportFeedback.includes("reported") ? "#16a34a" : "#dc2626"
            }}>
              {reportFeedback}
            </p>
          )}
        </div>
      )}

      {/* Caption */}
      <p className="polaroid-caption">{postData.description}</p>

      {/* Multiple Hashtags row */}
      {tags.length > 0 && (
        <div className="polaroid-tags-row" style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "8px 0" }}>
          {tags.map((tag, idx) => (
            <span key={idx} className="polaroid-tag-badge">
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {/* Inline Edit Form */}
      {isEditing && (
        <EditPost
          initialDescription={postData.description}
          initialHastag={postData.hastag}
          onSave={handleSaveEdits}
          onClose={() => setIsEditing(false)}
        />
      )}

      {/* Comments */}
      <div className="polaroid-comments-wrapper">
        <Comments postId={id} initialComments={postData.comments || []} />
      </div>
    </article>
  );
}

export default Post;
