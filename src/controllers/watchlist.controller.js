import { db } from "../../config/index.js";

export const getWatchlistsByUserId = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({ 
      success: false,
      error: "Valid user ID is required" 
    });
  }

  try {
    const [watchlists] = await db.query(
      `SELECT w.watchlist_id, w.share_code 
       FROM watchlist w
       JOIN users u ON w.user_id = u.user_id
       WHERE w.user_id = ?`,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      message: "Watchlist retrieved successfully",
      data: watchlists,
    });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch watchlist",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// Add to watchlist for authenticated user
export const addToWatchlist = async (req, res) => {
  const { share_code } = req.body;
  const { user_id } = req.user; 

  if (!share_code) {
    return res.status(400).json({ 
      success: false,
      error: "Share code is required" 
    });
  }

  try {
    // Checking if item already exists in user's watchlist
    const [existing] = await db.query(
      "SELECT watchlist_id FROM watchlist WHERE user_id = ? AND share_code = ?",
      [user_id, share_code]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Item already exists in your watchlist"
      });
    }

    const [result] = await db.query(
      "INSERT INTO watchlist (user_id, share_code) VALUES (?, ?)",
      [user_id, share_code]
    );

    return res.status(201).json({
      success: true,
      message: "Item added to watchlist successfully",
      data: {
        watchlist_id: result.insertId,
        user_id,
        share_code
      }
    });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to add to watchlist",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};



// a user can remove an item from their watchlist
export const removeOneFromWatchlist = async (req, res) => {
  const { share_code } = req.params;
  const { user_id } = req.user; 

  if (!share_code) {
    return res.status(400).json({ 
      success: false,
      error: "Share code is required" 
    });
  }

  try {
    const [result] = await db.query(
      "DELETE FROM watchlist WHERE user_id = ? AND share_code = ?",
      [user_id, share_code]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Item not found in your watchlist"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item removed from watchlist successfully"
    });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to remove from watchlist",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// a user can only clear their watchlist
export const clearWatchlist = async (req, res) => {
  const { user_id } = req.user; 

  try {
    const [result] = await db.query(
      "DELETE FROM watchlist WHERE user_id = ?",
      [user_id]
    );

    return res.status(200).json({
      success: true,
      message: "Watchlist cleared successfully",
      count: result.affectedRows
    });
  } catch (error) {
    console.error("Error clearing watchlist:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to clear watchlist",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};