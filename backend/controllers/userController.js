const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findUserByUsername(username);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
