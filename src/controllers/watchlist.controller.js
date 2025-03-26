import { db } from "../../config";

export const getWatchlistsByUserId = async (req, res) => {
    const { id } = req.params;
    let query = "SELECT * FROM watchlist WHERE user_id = ?"
    try {
        const [rows] = await db.query(
            query,
            [id]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error fetching watchlist:", error);
        res.status(500).json({ error: error });
    }
};

export const addToWatchlist = async (req, res) => {
    const { user_id, movie_id } = req.body;
    let query = "INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)";
    try {
        const [rows] = await db.query(
            query,
            [user_id, movie_id]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error adding to watchlist:", error);
        res.status(500).json({ error: error });
    }
};

export const removeOneFromWatchlist = async (req, res) => {
    const { user_id, movie_id } = req.body;
    let query = "DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?";
    try {
        const [rows] = await db.query(
            query,
            [user_id, movie_id]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error removing from watchlist:", error);
        res.status(500).json({ error: error });
    }
};

export const clearWatchlist = async (req, res) => {
    const { user_id } = req.body;
    let query = "DELETE FROM watchlist WHERE user_id = ?";
    try {
        const [rows] = await db.query(
            query,
            [user_id]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error clearing watchlist:", error);
        res.status(500).json({ error: error });
    }
};

