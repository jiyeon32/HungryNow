const express = require("express");
const axios = require("axios");
const router = express.Router();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

router.get("/geolocation", async (req, res) => {
    try {
        const response = await axios.post(`https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`);
        const { lat, lng } = response.data.location;
        res.json({ lat, lng });
    } catch (error) {
        console.error("🔴 Google Geolocation API エラー:", error);
        res.status(500).json({ error: "場所を取得できません。" });
    }
});

router.get("/geocode", async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "緯度と経度が必要です。" });
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=ko`);
        const address = response.data.results[0]?.formatted_address || "不明な位置";
        res.json({ address });
    } catch (error) {
        console.error("🔴 Google Geocoding API エラー:", error);
        res.status(500).json({ error: "位置情報を取得できませんでした。" });
    }
});

router.get("/map", (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
        return res.status(400).json({ error: "緯度と経度が必要です。" });
    }

    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_API_KEY}&q=${lat},${lng}`;
    res.json({ url: mapUrl });
});

module.exports = router;
