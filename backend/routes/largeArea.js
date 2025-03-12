const express = require("express");
const axios = require("axios");
const router = express.Router();
const HOTPEPPER_API_KEY = process.env.HOTPEPPER_API_KEY;

router.get("/v1/", async (req, res) => {
  try {
    const response = await axios.get("https://webservice.recruit.co.jp/hotpepper/large_area/v1/", {
      params: {
        key: HOTPEPPER_API_KEY,
        format: "json"
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("🔴 大エリアエラー:", error);
    res.status(500).json({ error: "大エリアエラー" });
  }
});

module.exports = router;
