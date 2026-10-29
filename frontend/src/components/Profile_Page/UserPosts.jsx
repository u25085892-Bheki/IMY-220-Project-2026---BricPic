import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";

/**
 * UserPosts (Albums & Album Contents) —
 * Shows the user's albums in a grid.
 * Displays album hashtags directly.
 * Clicking an album drills down to show its posts.
 * Includes inputs to add/remove posts, and edit/delete the album.
 */
function UserPosts({ refreshKey }) {
  const { id } = useParams();
  const [view, setView] = useState("albums"); // "albums" | "detail"
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // States for adding post to album
  const [userPosts, setUserPosts] = useState([]);
  const [selectedPostToAdd, setSelectedPostToAdd] = useState("");
  const [manualPostId, setManualPostId] = useState("");
  const [albumActionMessage, setAlbumActionMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // States for editing album
  const [isEditingAlbum, setIsEditingAlbum] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  let currentUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored) currentUser = JSON.parse(stored);
  } catch (e) { /* ignore */ }

  const targetId = id || currentUser?._id;

  const fetchAlbums = useCallback(() => {
    if (!targetId) { setLoading(false); return; }
    setLoading(true);
    fetch(`http://localhost:3000/api/users/${targetId}/albums`)
      .then((r) => r.json())
      .then((data) => {
        setAlbums(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [targetId]);

  useEffect(() => {
    fetchAlbums();
    setView("albums");
    setSelectedAlbum(null);
  }, [fetchAlbums, refreshKey]);

  // Fetch target user's posts to populate the "add to album" dropdown
  useEffect(() => {
    if (!targetId) return;
    fetch(`http://localhost:3000/api/users/${targetId}/posts`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUserPosts(data);
      })
      .catch(() => {});
  }, [targetId]);

  const reloadAlbum = async (albumId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/albums/${albumId}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedAlbum(data);
      }
    } catch (err) {
      console.error("Failed to reload album:", err);
    }
  };

  const openAlbum = async (album) => {
    setDetailLoading(true);
    setAlbumActionMessage("");
    setSelectedPostToAdd("");
    setManualPostId("");
    setIsEditingAlbum(false);
    try {
      const res = await fetch(`http://localhost:3000/api/albums/${album._id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedAlbum(data);
        setView("detail");
      }
    } catch (err) {
      console.error("Failed to load album:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Add a post to the current album
  const handleAddPostToAlbum = async (e) => {
    e.preventDefault();
    if (!currentUser?._id || !selectedAlbum?._id) return;

    const postId = (selectedPostToAdd || manualPostId).trim();
    if (!postId) {
      setAlbumActionMessage("Please select or enter a post ID.");
      return;
    }

    setActionLoading(true);
    setAlbumActionMessage("");
    try {
      const res = await fetch(`http://localhost:3000/api/albums/${selectedAlbum._id}/posts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser._id,
          postId: postId,
          action: "add",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlbumActionMessage("Post added to album!");
        setSelectedPostToAdd("");
        setManualPostId("");
        await reloadAlbum(selectedAlbum._id);
        fetchAlbums();
      } else {
        setAlbumActionMessage(data.error || "Failed to add post to album.");
      }
    } catch (err) {
      setAlbumActionMessage("Could not connect to server.");
    } finally {
      setActionLoading(false);
    }
  };

  // Remove a post from the current album
  const handleRemovePostFromAlbum = async (postId) => {
    if (!currentUser?._id || !selectedAlbum?._id) return;

    setActionLoading(true);
    setAlbumActionMessage("");
    try {
      const res = await fetch(`http://localhost:3000/api/albums/${selectedAlbum._id}/posts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser._id,
          postId: postId,
          action: "remove",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlbumActionMessage("Post removed from album.");
        await reloadAlbum(selectedAlbum._id);
        fetchAlbums();
      } else {
        setAlbumActionMessage(data.error || "Failed to remove post.");
      }
    } catch (err) {
      setAlbumActionMessage("Could not connect to server.");
    } finally {
      setActionLoading(false);
    }
  };

  // Start editing album
  const startEditingAlbum = () => {
    setEditName(selectedAlbum.name || "");
    setEditDesc(selectedAlbum.description || "");
    const tags = selectedAlbum.hashtags
      ? (Array.isArray(selectedAlbum.hashtags) ? selectedAlbum.hashtags.join(" ") : selectedAlbum.hashtags)
      : "";
    setEditTags(tags);
    setIsEditingAlbum(true);
  };

  // Save album edits
  const handleSaveAlbumEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setEditLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/albums/${selectedAlbum._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser._id,
          name: editName.trim(),
          description: editDesc.trim(),
          hashtags: editTags.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditingAlbum(false);
        await reloadAlbum(selectedAlbum._id);
        fetchAlbums();
      } else {
        alert(data.error || "Failed to update album.");
      }
    } catch (err) {
      alert("Could not connect to server.");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete album
  const handleDeleteAlbum = async () => {
    if (!window.confirm("Are you sure you want to delete this album? The posts inside will not be deleted.")) {
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/albums/${selectedAlbum._id}?userId=${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setView("albums");
        setSelectedAlbum(null);
        fetchAlbums();
      } else {
        alert(data.error || "Failed to delete album.");
      }
    } catch (err) {
      alert("Could not connect to server.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const PlaceholderIcon = () => (
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

  if (loading) {
    return (
      <section className="profile-gallery-container" aria-label="User albums">
        <p style={{ color: "#888", padding: "1rem", fontSize: "0.9rem" }}>Loading albums…</p>
      </section>
    );
  }

  // --- Album detail view ---
  if (view === "detail" && selectedAlbum) {
    const posts = selectedAlbum.posts || [];
    const isOwner = currentUser && String(currentUser._id) === String(selectedAlbum.UserId);

    // Filter user's posts that are not yet in this album
    const existingPostIds = new Set(posts.map((p) => String(p._id)));
    const availableToAdd = userPosts.filter((p) => !existingPostIds.has(String(p._id)));

    const albumTags = selectedAlbum.hashtags
      ? (Array.isArray(selectedAlbum.hashtags) ? selectedAlbum.hashtags : String(selectedAlbum.hashtags).split(/[,\s]+/)).filter(Boolean)
      : [];

    return (
      <section className="profile-gallery-container" aria-label="Album contents">
        {/* Top header navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn-lego-cancel"
            onClick={() => {
              setView("albums");
              setIsEditingAlbum(false);
            }}
            style={{ fontSize: "0.8rem", padding: "4px 10px" }}
          >
            ← Back to Albums
          </button>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{selectedAlbum.name}</h3>
          {selectedAlbum.description && (
            <span style={{ fontSize: "0.85rem", color: "#666" }}>— {selectedAlbum.description}</span>
          )}
          {albumTags.length > 0 && (
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {albumTags.map((tag, idx) => (
                <span key={idx} style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "0.75rem", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}

          {/* Edit & Delete Album buttons (owner only) */}
          {isOwner && (
            <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
              <button
                type="button"
                className="btn-lego-submit"
                style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                onClick={() => setIsEditingAlbum(!isEditingAlbum)}
              >
                {isEditingAlbum ? "Close Edit" : "Edit Album"}
              </button>
              <button
                type="button"
                className="btn-lego-cancel"
                style={{ fontSize: "0.75rem", padding: "4px 10px", background: "#fee2e2", color: "#b91c1c" }}
                onClick={handleDeleteAlbum}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting…" : "Delete Album"}
              </button>
            </div>
          )}
        </div>

        {/* Edit Album Form */}
        {isOwner && isEditingAlbum && (
          <form onSubmit={handleSaveAlbumEdit} style={{
            background: "#ffffff",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "14px"
          }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "0.9rem", fontWeight: 700 }}>Edit Album</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="form-field-group">
                <label className="form-field-label">Album Name</label>
                <input
                  type="text"
                  className="form-text-input"
                  placeholder="Album Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Description</label>
                <textarea
                  className="form-text-area"
                  placeholder="Album Description"
                  rows="2"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>
              <div className="form-field-group">
                <label className="form-field-label">Hashtags</label>
                <input
                  type="text"
                  className="form-text-input"
                  placeholder="Hashtags (e.g. #lego #space)"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" className="btn-lego-submit" disabled={editLoading}>
                  {editLoading ? "Saving…" : "Save Album"}
                </button>
                <button type="button" className="btn-lego-cancel" onClick={() => setIsEditingAlbum(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Form to add a post to this album (album owner only) */}
        {isOwner && (
          <div style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "16px"
          }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "0.85rem", fontWeight: 600 }}>
              Add a Post to this Album
            </h4>
            <form onSubmit={handleAddPostToAlbum} style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <select
                value={selectedPostToAdd}
                onChange={(e) => {
                  setSelectedPostToAdd(e.target.value);
                  if (e.target.value) setManualPostId("");
                }}
                className="form-text-input"
                style={{ flex: 1, minWidth: "160px", padding: "6px 10px", fontSize: "0.85rem" }}
                disabled={actionLoading}
              >
                <option value="">-- Choose from your posts --</option>
                {availableToAdd.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Or paste Post ID"
                value={manualPostId}
                onChange={(e) => {
                  setManualPostId(e.target.value);
                  if (e.target.value) setSelectedPostToAdd("");
                }}
                className="form-text-input"
                style={{ width: "160px", padding: "6px 10px", fontSize: "0.85rem" }}
                disabled={actionLoading}
              />

              <button
                type="submit"
                className="btn-lego-submit"
                disabled={actionLoading || (!selectedPostToAdd && !manualPostId.trim())}
                style={{ padding: "6px 14px", fontSize: "0.85rem" }}
              >
                {actionLoading ? "Adding…" : "+ Add to Album"}
              </button>
            </form>

            {albumActionMessage && (
              <p style={{
                margin: "6px 0 0 0",
                fontSize: "0.8rem",
                color: albumActionMessage.includes("added") || albumActionMessage.includes("removed") ? "#16a34a" : "#dc2626"
              }}>
                {albumActionMessage}
              </p>
            )}
          </div>
        )}

        {/* Posts inside the album */}
        {posts.length === 0 ? (
          <p style={{ color: "#888", fontSize: "0.9rem", padding: "1rem" }}>
            No posts in this album yet. {isOwner && "Use the form above to add posts!"}
          </p>
        ) : (
          <div className="profile-wireframe-grid">
            {posts.map((post) => {
              const pid = post._id.toString();
              return (
                <article key={pid} className="grid-photo-tile" style={{ position: "relative" }}>
                  <Link to={`/post/${pid}`} className="grid-photo-link" aria-label={`View ${post.name}`}>
                    {post.postImage ? (
                      <img src={post.postImage} alt={post.name} className="grid-photo-img" />
                    ) : (
                      <div className="grid-photo-placeholder-box">
                        <PlaceholderIcon />
                      </div>
                    )}
                  </Link>

                  {/* Remove button (owner only) */}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemovePostFromAlbum(pid);
                      }}
                      title="Remove from this album"
                      aria-label="Remove post from album"
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        background: "rgba(220, 38, 38, 0.9)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        lineHeight: "24px",
                        textAlign: "center",
                        padding: 0,
                        zIndex: 2,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                      }}
                    >
                      ✕
                    </button>
                  )}

                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    padding: "3px 6px",
                    fontSize: "0.75rem",
                    textAlign: "center",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap"
                  }}>
                    {post.name}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  // --- Loading single album ---
  if (detailLoading) {
    return (
      <section className="profile-gallery-container">
        <p style={{ color: "#888", padding: "1rem", fontSize: "0.9rem" }}>Loading album…</p>
      </section>
    );
  }

  // --- Albums grid view ---
  return (
    <section className="profile-gallery-container" aria-label="User albums">
      {albums.length === 0 ? (
        <p style={{ color: "#888", padding: "1rem", fontSize: "0.9rem" }}>No albums yet.</p>
      ) : (
        <div className="profile-wireframe-grid">
          {albums.map((album) => {
            const albumTags = album.hashtags
              ? (Array.isArray(album.hashtags) ? album.hashtags : String(album.hashtags).split(/[,\s]+/)).filter(Boolean)
              : [];
            return (
              <article
                key={album._id.toString()}
                className="grid-photo-tile"
                style={{ cursor: "pointer" }}
                onClick={() => openAlbum(album)}
              >
                {album.coverImage ? (
                  <div className="grid-photo-link" style={{ position: "relative" }}>
                    <img src={album.coverImage} alt={album.name} className="grid-photo-img" />
                    <div style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "rgba(0,0,0,0.65)",
                      color: "#fff",
                      padding: "4px 6px",
                      fontSize: "0.75rem",
                      textAlign: "center"
                    }}>
                      <div>{album.name} ({album.postCount || 0})</div>
                      {albumTags.length > 0 && (
                        <div style={{ fontSize: "0.65rem", color: "#93c5fd", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {albumTags.join(" ")}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid-photo-placeholder-box" style={{ position: "relative" }}>
                    <PlaceholderIcon />
                    <div style={{
                      position: "absolute",
                      bottom: "8px",
                      left: 0,
                      right: 0,
                      color: "#fff",
                      fontSize: "0.75rem",
                      textAlign: "center",
                      padding: "0 4px"
                    }}>
                      <div>{album.name} ({album.postCount || 0})</div>
                      {albumTags.length > 0 && (
                        <div style={{ fontSize: "0.65rem", color: "#93c5fd", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                          {albumTags.join(" ")}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default UserPosts;
