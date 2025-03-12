const express = require("express");
const axios = require("axios");
const router = express.Router();
const HOTPEPPER_API_KEY = process.env.HOTPEPPER_API_KEY;

router.get("/v1/", async (req, res) => {
  const { middle_area } = req.query;
  try {
    const response = await axios.get("https://webservice.recruit.co.jp/hotpepper/small_area/v1/", {
      params: {
        key: HOTPEPPER_API_KEY,
        format: "json",
        middle_area: middle_area
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("🔴 小エリアエラ:", error);
    res.status(500).json({ error: "小エリアエラ" });
  }
});

module.exports = router;
