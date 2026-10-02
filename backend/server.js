import express from "express";
import cors from "cors";

import { connectDB, getDB } from './db.js';

import { ObjectId, ReturnDocument } from "mongodb";
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const PORT = 3000;

await connectDB();
const db = getDB();
const userCollection = db.collection("users");
const postCollection = db.collection("posts");
const reportReasonsCollection = db.collection("reportReasons");

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

    return res.status(200).json({ message: "Profile updated successfully", result });

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

    res.status(501).json({ message: "Send friend request stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept a friend request
app.put("/api/users/:id/accept-friend", async (req, res) => {
  try {

    res.status(501).json({ message: "Accept friend request stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decline a friend request
app.put("/api/users/:id/decline-friend", async (req, res) => {
  try {

    res.status(501).json({ message: "Decline friend request stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfriend a user
app.delete("/api/users/:id/unfriend", async (req, res) => {
  try {

    res.status(501).json({ message: "Unfriend stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
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
    res.status(501).json({ message: "Report post stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. ALBUMS ENDPOINTS
// ==========================================

// Create a new album
app.post("/api/albums", async (req, res) => {
  try {
    res.status(501).json({ message: "Create album stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single album by ID
app.get("/api/albums/:id", async (req, res) => {
  try {

    res.status(501).json({ message: "Get album stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all albums belonging to a specific user
app.get("/api/users/:id/albums", async (req, res) => {
  try {
    res.status(501).json({ message: "Get user albums stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit album details (name, description, hashtags)
app.put("/api/albums/:id", async (req, res) => {
  try {
    res.status(501).json({ message: "Edit album stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or remove posts from an album
app.put("/api/albums/:id/posts", async (req, res) => {
  try {

    res.status(501).json({ message: "Update album posts stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an album
app.delete("/api/albums/:id", async (req, res) => {
  try {

    res.status(501).json({ message: "Delete album stub" });
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

// Get predefined report reasons
app.get("/api/reports/reasons", async (req, res) => {
  try {
    const reasons = await reportReasonsCollection.find({}).toArray();
    res.status(200).json(reasons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Add a new report reason
app.post("/api/reports/reasons", async (req, res) => {
  try {
    res.status(501).json({ message: "Add report reason stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: View all reported posts
app.get("/api/admin/reports", async (req, res) => {
  try {
    res.status(501).json({ message: "Admin view reports stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});