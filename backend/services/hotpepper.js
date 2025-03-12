const axios = require("axios");

const HOTPEPPER_API_KEY = process.env.HOTPEPPER_API_KEY;
const BASE_URL = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/";

async function searchRestaurants({ keyword = "", lat, lng, range = 3, small_area }) {
    try {
        const params = {
            key: HOTPEPPER_API_KEY,
            format: "json",
            range,
            count: 10
        };
        if (keyword) {
            params.keyword = keyword;
        }

        if (small_area) {
            params.small_area = small_area;
        } else if (lat && lng) {
            params.lat = lat;
            params.lng = lng;
        }
        const response = await axios.get(BASE_URL, { params });
        return response.data.results.shop || [];
    } catch (error) {
        console.error("🔴 searchRestaurantsアエラ:", error);
        return [];
    }
}

module.exports = { searchRestaurants };
