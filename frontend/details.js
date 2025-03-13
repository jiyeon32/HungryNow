document.addEventListener("DOMContentLoaded", () => {
    const data = localStorage.getItem("selectedRestaurant");
    if (!data) {
        window.location.href = "results.html";
        return;
    }

    const restaurant = JSON.parse(data);
    const container = document.getElementById("restaurant-list"); 

    const genre = restaurant.genre?.name || "情報なし";
    const budget = restaurant.budget?.name || "情報なし";
const wifi = restaurant.wifi === "1" ? "使用可能" : restaurant.wifi === "0" ? "なし" : "未確認";

container.innerHTML = `
<div class="restaurant-card">
        <img src="${restaurant.photo?.pc?.l || restaurant.photo?.pc?.m || 'placeholder.jpg'}" alt="${restaurant.name}" class="restaurant-detail-img">
        <div class="restaurant-info">
            <h2 class="restaurant-detail-name">${restaurant.name}</h2>
            <div class="restaurant-detail-address">
              <span>${restaurant.address}</span>
              <button class="map-button" data-bs-toggle="modal" data-bs-target="#mapModal" onclick="loadMap('${restaurant.lat}', '${restaurant.lng}')">地図を見る</button>
            </div>
            <p class="restaurant-detail-hours">⏰ 営業時間: ${restaurant.open || "情報なし"}</p>
            <p class="restaurant-detail-category">🏷️ ジャンル: ${genre}</p>
            <p class="restaurant-detail-wifi">📶 WiFi: ${wifi || "未確認"}</p>
            <p class="restaurant-detail-budget">💰 予算: ${budget}</p>      
        </div>
</div>
    `;
});

async function loadMap(lat, lng) {
    if (lat && lng) {
        try {
            const response = await fetch(`/api/google/map?lat=${lat}&lng=${lng}`);
            if (!response.ok) {
                throw new Error("サーバー応答エラー");
            }
            const data = await response.json();
            document.getElementById("mapFrame").src = data.url;
        } catch (error) {
            console.error("🔴 地図の読み込みエラー:", error);
            alert("地図を読み込めませんでした。");
        }
    } else {
        alert("位置情報がありません。");
    }
}

