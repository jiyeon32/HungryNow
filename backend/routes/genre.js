const express = require("express");
const axios = require("axios");
const router = express.Router();
const HOTPEPPER_API_KEY = process.env.HOTPEPPER_API_KEY;

router.get("/v1/", async (req, res) => {
  try {
    const response = await axios.get("https://webservice.recruit.co.jp/hotpepper/genre/v1/", {
      params: {
        key: HOTPEPPER_API_KEY,
        format: "json"
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("🔴 ジャンル API エラー:", error);
    res.status(500).json({ error: "ジャンル情報を取得できませんでした。" });
  }
});

module.exports = router;
