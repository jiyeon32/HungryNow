const express = require("express");
const { searchRestaurants } = require("../services/hotpepper");

const router = express.Router();

router.get("/search", async (req, res) => {
    const { keyword,lat, lng, range } = req.query;

    if (!keyword && (!lat || !lng)) {
        return res.status(400).json({ error: "位置情報が必要です。" });
    }

    try {
        const restaurants = await searchRestaurants({ keyword, lat, lng, range });
        res.json({ restaurants });
    } catch (error) {
        console.error("🔴 음식점 검색 API 오류:", error);
        res.status(500).json({ error: "음식점 정보를 가져올 수 없습니다." });
    }

});

module.exports = router;