const express = require("express");
const axios = require("axios");
const router = express.Router();
const HOTPEPPER_API_KEY = process.env.HOTPEPPER_API_KEY;

router.get("/v1/", async (req, res) => {
  try {
    const response = await axios.get("https://webservice.recruit.co.jp/hotpepper/budget/v1/", {
      params: {
        key: HOTPEPPER_API_KEY,
        format: "json"
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("🔴 予算 API エラー:", error);
    res.status(500).json({ error: "予算情報を取得できませんでした。" });
  }
});

module.exports = router;
