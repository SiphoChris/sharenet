import { db } from "../../config/index.js";
import { createToken } from "../middleware/auth.js";
import { hash, compare } from "bcrypt";
import { validateEmail } from "../utility/index.js";

// export const getUsers = async (req, res) => {
//   let query = "SELECT * FROM users"
//   try {
//     const [rows] = await db.query(query);
//     res.json(rows);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({ error: error });
//   }
// };

export const registerUser = async (req, res) => {
  let query = "SELECT user_id FROM users WHERE email = ?";
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  try {
    // Check if user exists first (alternative to ER_DUP_ENTRY)
    const [existing] = await db.query(query, [email]);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await hash(password, 12);

    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), email.toLowerCase().trim(), hashedPassword]
    );

    const token = createToken({
      id: result.insertId,
      name,
      email,
    });

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: result.insertId,
        name,
        email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      error: "Registration failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const [users] = await db.query(
      "SELECT user_id, name, email, password FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    const isValid = await compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = createToken({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    // dont include password in response
    const { password: _, ...userData } = user;

    return res.json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Login failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteUser = async (req, res) => {
  let query = "DELETE FROM users WHERE user_id = ?";

  // a user should be able to delete their own account
  if (req.user.id !== parseInt(req.params.id) && req.user.role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const [result] = await db.query(query, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({
      error: "Account deletion failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
