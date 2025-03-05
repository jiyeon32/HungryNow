const axios = require("axios");

const HOTPEPPER_API_KEY = process.env.HOTPEPPER_API_KEY;
const BASE_URL = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/";


async function searchRestaurants({ keyword = "", lat, lng, areaCode, range = 3}) {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                key : HOTPEPPER_API_KEY,
                format : "json",
                keyword,
                lat,
                lng,
                range,
                count : 10,
            },
        });

        return response.data.results.shop || [];
    } catch (error) {
        console.error("🔴 HotPepper API エラー:", error);
        return [];
    }
}

module.exports = { searchRestaurants };