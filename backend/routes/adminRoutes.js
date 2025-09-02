const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users
router.get("/users", authMiddleware, async (req, res) => {
  const users = await User.getAllUsers();
  res.json(users);
});

// Create user
router.post("/users", authMiddleware, async (req, res) => {
  const { name, username, password, role } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: "Name, username, and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.createUser({
      name,
      username,
      password: hashedPassword,
      role
    });
    res.json(newUser);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error while creating user" });
  }
});


// Delete users
router.delete("/users", authMiddleware, async (req, res) => {
  const { ids } = req.body;
  await User.deleteUsers(ids);
  res.json({ message: "Users deleted" });
});

module.exports = router;
