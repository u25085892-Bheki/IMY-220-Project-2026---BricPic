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

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    //convert string param to ObjectID for mongo
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

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
    
    const deletedUser = await User.findByIdAndDelete(userId);

    if(!deletedUser){
      return res.status(404).json({error: "user not found"});
    }
    res.json({ message: 'User deleted successfully', deletedUser });
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
    // req.params.id: Target user to receive the request
    // req.body: { senderId }
    res.status(501).json({ message: "Send friend request stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept a friend request
app.put("/api/users/:id/accept-friend", async (req, res) => {
  try {
    // req.params.id: Current user accepting the request
    // req.body: { requesterId }
    res.status(501).json({ message: "Accept friend request stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decline a friend request
app.put("/api/users/:id/decline-friend", async (req, res) => {
  try {
    // req.params.id: Current user declining the request
    // req.body: { requesterId }
    res.status(501).json({ message: "Decline friend request stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfriend a user
app.delete("/api/users/:id/unfriend", async (req, res) => {
  try {
    // req.params.id: Current user
    // req.body: { friendId }
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
    // req.body: { userId, name, description, postImage, hashtag }
    res.status(501).json({ message: "Create post stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single post by ID (for dedicated post page)
app.get("/api/posts/:id", async (req, res) => {
  try {
    // req.params.id: Post ObjectId
    res.status(501).json({ message: "Get post stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit post (description and hashtags only, creator only)
app.put("/api/posts/:id", async (req, res) => {
  try {
    // req.params.id: Post ObjectId
    // req.body: { description, hashtag }
    res.status(501).json({ message: "Edit post stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete post (also removes comments)
app.delete("/api/posts/:id", async (req, res) => {
  try {
    // req.params.id: Post ObjectId
    res.status(501).json({ message: "Delete post stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a comment to a post
app.post("/api/posts/:id/comments", async (req, res) => {
  try {
    // req.params.id: Post ObjectId
    // req.body: { userId, username, message }
    res.status(501).json({ message: "Add comment stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report a post
app.post("/api/posts/:id/report", async (req, res) => {
  try {
    // req.params.id: Post ObjectId
    // req.body: { userId, reason }
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
    // req.body: { UserId, name, description, hashtags, postslist }
    res.status(501).json({ message: "Create album stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single album by ID
app.get("/api/albums/:id", async (req, res) => {
  try {
    // req.params.id: Album ObjectId
    res.status(501).json({ message: "Get album stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all albums belonging to a specific user
app.get("/api/users/:id/albums", async (req, res) => {
  try {
    // req.params.id: User ObjectId
    res.status(501).json({ message: "Get user albums stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit album details (name, description, hashtags)
app.put("/api/albums/:id", async (req, res) => {
  try {
    // req.params.id: Album ObjectId
    // req.body: { name, description, hashtags }
    res.status(501).json({ message: "Edit album stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or remove posts from an album
app.put("/api/albums/:id/posts", async (req, res) => {
  try {
    // req.params.id: Album ObjectId
    // req.body: { postId, action: "add" | "remove" }
    res.status(501).json({ message: "Update album posts stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an album
app.delete("/api/albums/:id", async (req, res) => {
  try {
    // req.params.id: Album ObjectId
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
    res.status(501).json({ message: "Global feed stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Local feed (activity for the logged-in user + their friends)
app.get("/api/feed/local/:userId", async (req, res) => {
  try {
    // req.params.userId: Logged in user ObjectId
    res.status(501).json({ message: "Local feed stub" });
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
    res.status(501).json({ message: "Get report reasons stub" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Add a new report reason
app.post("/api/reports/reasons", async (req, res) => {
  try {
    // req.body: { reason }
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