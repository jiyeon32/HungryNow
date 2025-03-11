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
        console.error("🔴 Google Geolocation API 에러:", error);
        res.status(500).json({ error: "위치를 가져올 수 없습니다." });
    }
});

router.get("/geocode", async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "위도와 경도가 필요합니다." });
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=ko`);
        const address = response.data.results[0]?.formatted_address || "알 수 없는 위치";
        res.json({ address });
    } catch (error) {
        console.error("🔴 Google Geocoding API 에러:", error);
        res.status(500).json({ error: "주소를 변환할 수 없습니다." });
    }
});

module.exports = router;
