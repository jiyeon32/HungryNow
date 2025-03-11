const axios = require("axios");

const HOTPEPPER_API_KEY = process.env.HOTPEPPER_API_KEY;
const BASE_URL = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/";

async function searchRestaurants({ keyword = "", lat, lng, range = 3 }) {
    try {
        const params = {
            key: HOTPEPPER_API_KEY,
            format: "json",
            keyword,
            range,
            count: 10,
        };

        if (keyword) {
            params.keyword = keyword; 
        }

        if (lat && lng) {
            params.lat = lat;
            params.lng = lng;
        }

        const response = await axios.get(BASE_URL, { params });
        return response.data.results.shop || [];
    } catch (error) {
        console.error("🔴 HotPepper API 오류:", error);
        return [];
    }
}

module.exports = { searchRestaurants };