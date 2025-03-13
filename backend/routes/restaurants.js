const express = require("express");
const { searchRestaurants } = require("../services/hotpepper");

const router = express.Router();

router.get("/search", async (req, res) => {
    const { keyword, lat, lng, range, small_area,genre, budget, wifi } = req.query;

    if (!keyword && (!lat || !lng) && !small_area) {
        return res.status(400).json({ error: "位置情報が必要です。" });
    }

    try {
        
        const restaurants = await searchRestaurants({ keyword, lat, lng, range, small_area,genre, budget, wifi });
        res.json({ restaurants });
    } catch (error) {
        console.error("🔴 グルメサーチエラ:", error);
        res.status(500).json({ error: "グルメサーチエラ" });
    }

});

module.exports = router;