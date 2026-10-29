import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";

import { connectDB, getDB } from './db.js';

import { ObjectId, ReturnDocument } from "mongodb";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(uploadDir));

const PORT = 3000;

await connectDB();
const db = getDB();
const userCollection = db.collection("users");
const postCollection = db.collection("posts");
const albumCollection = db.collection("albums");
const reportReasonsCollection = db.collection("reportReasons");

// Image upload endpoint (multer, 10MB limit)
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    res.status(200).json({
      message: "Image uploaded successfully",
      imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// Register a new user
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password || username.trim() === "" || email.trim() === "" || password.trim() === "") {
      return res.status(400).json({ error: "missing/empty fields" });
    }

    const existingUser = await userCollection.findOne({
      $or: [{ username: username.trim() }, { email: email.trim() }]
    });

    if (existingUser) {
      return res.status(400).json({ error: "email or username already exists" });
    }

    const result = await userCollection.insertOne({
      username: username.trim(),
      email: email.trim(),
      password: password,
      profileImage: "/blank-profile-picturesvg.svg",
      isAdmin: false,
      friendRequests: [],
      friendsList: [],
      bio: "",
      pronouns: ""
    });

    const newUser = {
      _id: result.insertedId,
      username: username.trim(),
      email: email.trim(),
      profileImage: "/blank-profile-picturesvg.svg",
      isAdmin: false,
      friendRequests: [],
      friendsList: [],
      bio: "",
      pronouns: ""
    };

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log in an existing user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "enter in both fields" });
    }

    const user = await userCollection.findOne({ username: username });

    if (!user || password !== user.password) {
      return res.status(401).json({ message: "invalid password or username" });
    }

    if (password === user.password) {
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({ message: "successfully logged in", user: userWithoutPassword });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Log out a user
app.post("/api/auth/logout", async (req, res) => {
  try {
    res.status(200).json({ message: "successfully logged out" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. USER & PROFILE ENDPOINTS
// ==========================================

// Get user profile by ID (view own or other user's profile)
app.get("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    let user = null;
    if (ObjectId.isValid(userId)) {
      user = await userCollection.findOne({ _id: new ObjectId(userId) });
    }
    if (!user) {
      user = await userCollection.findOne({ username: userId });
    }

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    // Populate friends with actual user details if friends array exists
    let populatedFriends = [];
    const friendsArray = user.friends || user.friendsList || [];
    if (Array.isArray(friendsArray) && friendsArray.length > 0) {
      const friendObjectIds = friendsArray
        .map((f) => {
          if (typeof f === "string" && ObjectId.isValid(f)) return new ObjectId(f);
          if (f && f.userId && ObjectId.isValid(f.userId)) return new ObjectId(f.userId);
          if (f && f._id && ObjectId.isValid(f._id)) return new ObjectId(f._id);
          if (f instanceof ObjectId) return f;
          return null;
        })
        .filter(Boolean);

      if (friendObjectIds.length > 0) {
        populatedFriends = await userCollection
          .find(
            { _id: { $in: friendObjectIds } },
            { projection: { password: 0 } }
          )
          .toArray();
      } else {
        // Fallback if friends contains string names or custom objects
        populatedFriends = friendsArray.map((f) => {
          if (typeof f === "string") return { username: f };
          return f;
        });
      }
    }

    user.friendsList = populatedFriends;
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit profile (bio, profileImage, pronouns)
app.put("/api/users/:id", async (req, res) => {
  try {
    const userID = req.params.id;
    const { bio, profileImage, pronouns, username } = req.body;

    if (!ObjectId.isValid(userID)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const update = {};
    if (bio !== undefined) update.bio = bio;
    if (profileImage !== undefined) update.profileImage = profileImage;
    if (pronouns !== undefined) update.pronouns = pronouns;
    if (username !== undefined) update.username = username;

    const result = await userCollection.findOneAndUpdate(
      { _id: new ObjectId(userID) },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: "user not found" });
    }

    const { password: _pw, ...userWithoutPassword } = result;
    return res.status(200).json({ message: "Profile updated successfully", user: userWithoutPassword });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user account
app.delete("/api/users/:id", async (req, res) => {
  try {
    const userID = req.params.id;
    if (!ObjectId.isValid(userID)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const result = await userCollection.deleteOne({ _id: new ObjectId(userID) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "user not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. FRIENDSHIP & INTERACTION ENDPOINTS
// ==========================================

// Send a friend request
app.post("/api/users/:id/friend-request", async (req, res) => {
  try {
    // Receiver comes from the URL, sender comes from the request body
    const receiverId = req.params.id;
    // req.body is undefined in Express 5 when no JSON body was sent, so default to {}
    const { fromUserId } = req.body || {};
    // 400: ids must exist and be valid ObjectIds (new ObjectId("abc") would throw)
    if (!fromUserId || !ObjectId.isValid(fromUserId) || !ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: "valid fromUserId and user id are required" });
    }
    // 400: you can't send a request to yourself
    if (fromUserId.toString() === receiverId) {
      return res.status(400).json({ error: "cannot send a friend request to yourself" });
    }
    // Look up both users
    const sender = await userCollection.findOne({ _id: new ObjectId(fromUserId) });
    const receiver = await userCollection.findOne({ _id: new ObjectId(receiverId) });
    // 404: either user doesn't exist
    if (!sender || !receiver) {
      return res.status(404).json({ error: "user not found" });
    }
    // 400: already friends (ids may be stored as ObjectId or string, so compare as strings)
    const alreadyFriends = (sender.friendsList || []).some(
      (f) => String(f) === receiverId
    );

    if (alreadyFriends) {
      return res.status(400).json({ error: "already friends" });
    }
    // 409: a request from this sender is already waiting on the receiver
    const alreadyRequested = (receiver.friendRequests || []).some(
      (r) => String(r) === fromUserId.toString()
    );

    if (alreadyRequested) {
      return res.status(409).json({ error: "friend request already sent" });
    }
    // $addToSet pushes the sender's id into the receiver's friendRequests, and does nothing if that id is already in the arra
    await userCollection.updateOne(

      { _id: new ObjectId(receiverId) },

      { $addToSet: { friendRequests: new ObjectId(fromUserId) } }

    );

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

// Accept a friend request
app.put("/api/users/:id/accept-friend", async (req, res) => {
  try {
    const accepterId = req.params.id;
    const { fromUserId } = req.body || {};
    if (!fromUserId || !ObjectId.isValid(fromUserId) || !ObjectId.isValid(accepterId)) {
      return res.status(400).json({ error: "valid fromUserId and user id are required" });
    }
    const accepter = await userCollection.findOne({ _id: new ObjectId(accepterId) });
    const sender = await userCollection.findOne({ _id: new ObjectId(fromUserId) });
    if (!accepter || !sender) {
      return res.status(404).json({ error: "user not found" });
    }
    // already friends (compare as strings, ids may be ObjectId or string)
    if ((accepter.friendsList || []).some((f) => String(f) === fromUserId.toString())) {
      return res.status(400).json({ error: "already friends" });
    }
    // there must be a pending request from the sender
    if (!(accepter.friendRequests || []).some((r) => String(r) === fromUserId.toString())) {
      return res.status(400).json({ error: "no friend request from this user" });
    }
    // accepter: remove the request and add the sender as a friend
    await userCollection.updateOne(
      { _id: new ObjectId(accepterId) },
      {
        $pull: { friendRequests: new ObjectId(fromUserId) },
        $addToSet: { friendsList: new ObjectId(fromUserId) }
      }
    );
    // sender: add the accepter as a friend
    await userCollection.updateOne(
      { _id: new ObjectId(fromUserId) },
      { $addToSet: { friendsList: new ObjectId(accepterId) } }
    );
    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Decline a friend request
app.put("/api/users/:id/decline-friend", async (req, res) => {
  try {
    const declinerId = req.params.id;
    const { fromUserId } = req.body || {};
    if (!fromUserId || !ObjectId.isValid(fromUserId) || !ObjectId.isValid(declinerId)) {
      return res.status(400).json({ error: "valid fromUserId and user id are required" });
    }
    const decliner = await userCollection.findOne({ _id: new ObjectId(declinerId) });
    if (!decliner) {
      return res.status(404).json({ error: "user not found" });
    }
    // there must be a pending request from the sender to decline
    if (!(decliner.friendRequests || []).some((r) => String(r) === fromUserId.toString())) {
      return res.status(400).json({ error: "no friend request from this user" });
    }
    // remove the sender's id from the decliner's friendRequests
    await userCollection.updateOne(
      { _id: new ObjectId(declinerId) },
      { $pull: { friendRequests: new ObjectId(fromUserId) } }
    );
    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfriend: remove each user from the other's friendsList
app.delete("/api/users/:id/unfriend", async (req, res) => {
  try {
    const myId = req.params.id;
    // DELETE bodies can get dropped, so prefer the query string (?friendId=...)
    const friendId = req.query.friendId || (req.body || {}).friendId;
    // 400: ids missing or malformed
    if (!friendId || !ObjectId.isValid(friendId) || !ObjectId.isValid(myId)) {
      return res.status(400).json({ error: "valid friendId and user id are required" });
    }
    const me = await userCollection.findOne({ _id: new ObjectId(myId) });
    const friend = await userCollection.findOne({ _id: new ObjectId(friendId) });
    // 404: either user doesn't exist
    if (!me || !friend) {
      return res.status(404).json({ error: "user not found" });
    }
    // 400: they aren't friends
    if (!(me.friendsList || []).some((f) => String(f) === friendId.toString())) {
      return res.status(400).json({ error: "not friends" });
    }
    // pull each user out of the other's friendsList
    await userCollection.updateOne({ _id: me._id }, { $pull: { friendsList: friend._id } });
    await userCollection.updateOne({ _id: friend._id }, { $pull: { friendsList: me._id } });
    res.status(200).json({ message: "Unfriended" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like / unlike a post (toggle)
app.post("/api/posts/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body || {};
    // 400: ids missing or malformed
    if (!ObjectId.isValid(id) || !userId || !ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "valid post id and userId are required" });
    }
    const post = await postCollection.findOne({ _id: new ObjectId(id) });
    // 404: post doesn't exist
    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }
    const userObjectId = new ObjectId(userId);
    // has this user already liked it? (likedBy holds ObjectIds, so compare as strings)
    const hasLiked = (post.likedBy || []).some((u) => String(u) === userId.toString());
    // already liked -> remove like and subtract 1; otherwise add like and add 1
    const update = hasLiked
      ? { $pull: { likedBy: userObjectId }, $inc: { likes: -1 } }
      : { $addToSet: { likedBy: userObjectId }, $inc: { likes: 1 } };
    const updated = await postCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      update,
      { returnDocument: "after" }
    );
    res.status(200).json({ likes: updated.likes, hasLiked: !hasLiked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =========================================
// 4. POSTS & COMMENTS ENDPOINTS
// ==========================================

// Create a new post
app.post("/api/posts", async (req, res) => {
  try {
    const { userId, name, description, postImage, hastag } = req.body;

    if (!userId || !name || !description || !postImage || !hastag) {
      return res.status(400).json({ error: "all fields are required" });
    }

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const newPost = {
      userId: new ObjectId(userId),
      name: name.trim(),
      description: description.trim(),
      postImage,
      hastag: hastag.trim(),
      comments: [],
      reports: [],
      createdAt: new Date()
    };

    const result = await postCollection.insertOne(newPost);
    res.status(201).json({ message: "Post created successfully", post: { ...newPost, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single post by ID (for dedicated post page)
app.get("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const post = await postCollection.findOne({ _id: new ObjectId(id) });
    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all posts by a specific user
app.get("/api/users/:id/posts", async (req, res) => {
  try {
    const { id } = req.params;
    let targetUserId = null;
    if (ObjectId.isValid(id)) {
      targetUserId = new ObjectId(id);
    } else {
      const foundUser = await userCollection.findOne({ username: id });
      if (foundUser) targetUserId = foundUser._id;
    }

    if (!targetUserId) {
      return res.status(200).json([]);
    }

    const posts = await postCollection
      .find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit post (description and hashtags only, creator only)
app.put("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description, hastag } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const update = {};
    if (description !== undefined) update.description = description.trim();
    if (hastag !== undefined) update.hastag = hastag.trim();

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const result = await postCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ error: "post not found" });
    }
    res.status(200).json({ message: "Post updated successfully", post: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete post (also removes comments — they are embedded in the post document)
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const result = await postCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a comment to a post
app.post("/api/posts/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, username, message } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }

    if (!userId || !username || !message || message.trim() === "") {
      return res.status(400).json({ error: "userId, username and message are required" });
    }

    const comment = {
      _id: new ObjectId(),
      userId: userId.toString(),
      username: username.trim(),
      message: message.trim(),
      createdAt: new Date()
    };

    const result = await postCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $push: { comments: comment } },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ error: "post not found" });
    }
    res.status(201).json({ message: "Comment added", comment, post: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report a post
app.post("/api/posts/:id/report", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, reasonId } = req.body || {};
    if (!ObjectId.isValid(id) || !userId || !ObjectId.isValid(userId) || !reasonId || !ObjectId.isValid(reasonId)) {
      return res.status(400).json({ error: "valid post id, userId and reasonId are required" });
    }
    const post = await postCollection.findOne({ _id: new ObjectId(id) });
    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }
    // 400: can't report your own post
    if (post.userId.toString() === userId.toString()) {
      return res.status(400).json({ error: "you cannot report your own post" });
    }
    const reason = await reportReasonsCollection.findOne({ _id: new ObjectId(reasonId) });
    if (!reason) {
      return res.status(404).json({ error: "report reason not found" });
    }
    // 409: this user already reported this post
    if ((post.reports || []).some((r) => String(r.userId) === userId.toString())) {
      return res.status(409).json({ error: "you already reported this post" });
    }
    // store who reported it and why (reason text is copied in so admins can read it directly)
    const report = {
      userId: new ObjectId(userId),
      reasonId: reason._id,
      reason: reason.reason,
      createdAt: new Date()
    };
    await postCollection.updateOne({ _id: new ObjectId(id) }, { $push: { reports: report } });
    res.status(201).json({ message: "Post reported", reportCount: (post.reports || []).length + 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. ALBUMS ENDPOINTS
// ==========================================

// Create an album (stored as UserId / postslist / hashtags to match the database)
app.post("/api/albums", async (req, res) => {
  try {
    const { userId, name, description, hashtags } = req.body || {};
    // 400: need a valid owner and a name
    if (!userId || !ObjectId.isValid(userId) || !name || name.trim() === "") {
      return res.status(400).json({ error: "valid userId and name are required" });
    }
    const newAlbum = {
      UserId: new ObjectId(userId),
      name: name.trim(),
      description: (description || "").trim(),
      postslist: [],
      hashtags: hashtags ? (Array.isArray(hashtags) ? hashtags : String(hashtags).split(/[,s]+/).map(t => t.trim()).filter(Boolean).map(t => t.startsWith("#") ? t : `#${t}`)) : [],
            createdAt: new Date()
    };
    const result = await albumCollection.insertOne(newAlbum);
    res.status(201).json({ message: "Album created", album: { ...newAlbum, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get one album with its full posts and owner details
app.get("/api/albums/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid album ID format" });
    }
    const album = await albumCollection.findOne({ _id: new ObjectId(id) });
    if (!album) {
      return res.status(404).json({ error: "album not found" });
    }
    // $in = "any post whose _id is in this list"
    const posts = await postCollection.find({ _id: { $in: album.postslist || [] } }).toArray();
    const owner = await userCollection.findOne(
      { _id: album.UserId },
      { projection: { username: 1, profileImage: 1 } }
    );
    res.status(200).json({ ...album, posts, author: owner?.username, authorAvatar: owner?.profileImage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all albums for a user (by ObjectId or username), with a cover image and post count
app.get("/api/users/:id/albums", async (req, res) => {
  try {
    const { id } = req.params;
    let user = null;
    if (ObjectId.isValid(id)) {
      user = await userCollection.findOne({ _id: new ObjectId(id) });
    }
    if (!user) {
      user = await userCollection.findOne({ username: id });
    }
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    const albums = await albumCollection.find({ UserId: user._id }).sort({ createdAt: -1 }).toArray();
    // cover = image of the first post in each album
    const result = await Promise.all(
      albums.map(async (a) => {
        const list = a.postslist || [];
        const cover = list.length > 0
          ? await postCollection.findOne({ _id: list[0] }, { projection: { postImage: 1 } })
          : null;
        return { ...a, postCount: list.length, coverImage: cover?.postImage || null };
      })
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit album name / description / hashtags (owner only)
app.put("/api/albums/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, name, description, hashtags } = req.body || {};
    if (!ObjectId.isValid(id) || !userId || !ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "valid album id and userId are required" });
    }
    const album = await albumCollection.findOne({ _id: new ObjectId(id) });
    if (!album) {
      return res.status(404).json({ error: "album not found" });
    }
    // 403: logged-in user isn't the owner
    if (album.UserId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "only the album owner can edit it" });
    }
    // only update the fields that were actually sent
    const updates = {};
    if (name !== undefined && name.trim() !== "") updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (hashtags !== undefined) updates.hashtags = Array.isArray(hashtags) ? hashtags : String(hashtags).split(/[,s]+/).map(t => t.trim()).filter(Boolean).map(t => t.startsWith("#") ? t : `#${t}`);
        if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "nothing to update" });
    }
    const updated = await albumCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );
    res.status(200).json({ message: "Album updated", album: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or remove a post from an album (owner only): body { userId, postId, action: "add" | "remove" }
app.put("/api/albums/:id/posts", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, postId, action } = req.body || {};
    if (!ObjectId.isValid(id) || !userId || !ObjectId.isValid(userId) || !postId || !ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "valid album id, userId and postId are required" });
    }
    if (action !== "add" && action !== "remove") {
      return res.status(400).json({ error: "action must be 'add' or 'remove'" });
    }
    const album = await albumCollection.findOne({ _id: new ObjectId(id) });
    if (!album) {
      return res.status(404).json({ error: "album not found" });
    }
    if (album.UserId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "only the album owner can change its posts" });
    }
    // when adding, make sure the post exists
    if (action === "add") {
      const post = await postCollection.findOne({ _id: new ObjectId(postId) });
      if (!post) {
        return res.status(404).json({ error: "post not found" });
      }
    }
    // $addToSet avoids duplicates, $pull removes the id
    const update = action === "add"
      ? { $addToSet: { postslist: new ObjectId(postId) } }
      : { $pull: { postslist: new ObjectId(postId) } };
    const updated = await albumCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      update,
      { returnDocument: "after" }
    );
    res.status(200).json({ message: "Album posts updated", album: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an album (owner only). The posts inside are not deleted.
app.delete("/api/albums/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || (req.body || {}).userId;
    if (!ObjectId.isValid(id) || !userId || !ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "valid album id and userId are required" });
    }
    const album = await albumCollection.findOne({ _id: new ObjectId(id) });
    if (!album) {
      return res.status(404).json({ error: "album not found" });
    }
    if (album.UserId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "only the album owner can delete it" });
    }
    await albumCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: "Album deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. ACTIVITY FEEDS ENDPOINTS
// ==========================================

// Global feed (activity from all users, reverse chronological)
app.get("/api/feed/global", async (req, res) => {
  try {
    const posts = await postCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Local feed (activity for the logged-in user + their friends)
app.get("/api/feed/local/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    const friends = user?.friends || [];
    const allowedUserIds = [
      new ObjectId(userId),
      ...friends.map((f) => new ObjectId(f.userId || f))
    ];

    const posts = await postCollection
      .find({ userId: { $in: allowedUserIds } })
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. ADMIN & REPORT REASONS ENDPOINTS
// ==========================================


// Get report reasons (seeds defaults if empty)
app.get("/api/reports/reasons", async (req, res) => {
  try {
    let reasons = await reportReasonsCollection.find({}).toArray();
    if (reasons.length === 0) {
      const defaultReasons = [
        { reason: "Spam or misleading" },
        { reason: "Harassment or bullying" },
        { reason: "Inappropriate or offensive content" },
        { reason: "Copyright violation" },
        { reason: "Other" }
      ];
      await reportReasonsCollection.insertMany(defaultReasons);
      reasons = await reportReasonsCollection.find({}).toArray();
    }
    res.status(200).json(reasons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: add a new report reason
app.post("/api/reports/reasons", async (req, res) => {
  try {
    const { userId, reason } = req.body || {};
    // 403: only admins
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: "admins only" });
    }
    if (!reason || reason.trim() === "") {
      return res.status(400).json({ error: "reason is required" });
    }
    const newReason = { reason: reason.trim() };
    const result = await reportReasonsCollection.insertOne(newReason);
    res.status(201).json({ message: "Reason added", reason: { ...newReason, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: list reported posts (most reported first)
app.get("/api/admin/reports", async (req, res) => {
  try {
    if (!(await isAdmin(req.query.userId))) {
      return res.status(403).json({ error: "admins only" });
    }
    // "reports.0 exists" = the reports array has at least one item
    const posts = await postCollection.find({ "reports.0": { $exists: true } }).toArray();
    posts.sort((a, b) => b.reports.length - a.reports.length);
    // look up all the authors' usernames in one query
    const authorIds = [...new Set(posts.map((p) => p.userId.toString()))].map((i) => new ObjectId(i));
    const authors = await userCollection
      .find({ _id: { $in: authorIds } }, { projection: { username: 1 } })
      .toArray();
    const nameById = {};
    authors.forEach((a) => { nameById[a._id.toString()] = a.username; });
    res.status(200).json(posts.map((p) => ({ ...p, author: nameById[p.userId.toString()] || "Unknown" })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: dismiss (clear) all reports on a post
app.put("/api/admin/reports/:postId/dismiss", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body || {};
    if (!(await isAdmin(userId))) {
      return res.status(403).json({ error: "admins only" });
    }
    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }
    const result = await postCollection.updateOne({ _id: new ObjectId(postId) }, { $set: { reports: [] } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "post not found" });
    }
    res.status(200).json({ message: "Reports dismissed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});