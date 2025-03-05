const express = require("express");
const { searchRestaurants } = require("../services/hotpepper");

const router = express.Router();

router.get("/search", async (req, res) => {
    const { keyword,lat, lng, range } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: "位置情報が必要です。" });
    }

    const restaurants = await searchRestaurants({ keyword, lat, lng, range });
    res.json({ restaurants });
});

module.exports = router;