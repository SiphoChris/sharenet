import { db } from "../../config/index.js";
import { createToken } from "../middleware/auth.js";
import { hash, compare } from "bcrypt";
import { validateEmail } from "../utility/index.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false,
      error: "All fields are required" 
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ 
      success: false,
      error: "Invalid email format" 
    });
  }

  if (password.length < 8) {
    return res.status(400).json({ 
      success: false,
      error: "Password must be at least 8 characters" 
    });
  }

  try {
    // Checking if user exists
    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false,
        error: "Email already registered" 
      });
    }

    const hashedPassword = await hash(password, 12);

    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), email.toLowerCase().trim(), hashedPassword]
    );

    const token = createToken({
      user_id: result.insertId,
      name,
      email,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        user_id: result.insertId,
        name,
        email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      error: "Registration failed",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      error: "Email and password required" 
    });
  }

  try {
    const [users] = await db.query(
      "SELECT user_id, name, email, password FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials" 
      });
    }

    const user = users[0];
    const isValid = await compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials" 
      });
    }

    const token = createToken({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
    });

    // dont include password in response
    const { password: _, ...userData } = user;

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Login failed",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteUser = async (req, res) => {
  const { user_id } = req.params;
  const requestingUser = req.user;

  // a user can only delete their own account
  if (requestingUser.user_id !== parseInt(user_id)) {
    return res.status(403).json({ 
      success: false,
      error: "Unauthorized" 
    });
  }

  try {
    // delete user's watchlist items
    await db.query("DELETE FROM watchlist WHERE user_id = ?", [user_id]);
    
    // delete the user
    const [result] = await db.query(
      "DELETE FROM users WHERE user_id = ?",
      [user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    return res.json({ 
      success: true,
      message: "Account deleted successfully" 
    });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({
      success: false,
      error: "Account deletion failed",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};