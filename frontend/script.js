document.addEventListener("DOMContentLoaded", () => {
    const locationText = document.getElementById("location-text");
    const currentLocationBtn = document.getElementById("current-location-btn");
    const otherLocationBtn = document.getElementById("other-location-btn"); 
    const restaurantList = document.getElementById("restaurant-list");

    let currentLat = 35.6895; 
    let currentLng = 139.6917;

    fetchRestaurants(currentLat, currentLng);

 
    currentLocationBtn.addEventListener("click", () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;

                console.log(`📍 현재 위치: ${currentLat}, ${currentLng}`);

  
                const address = await getAddressFromCoords(currentLat, currentLng);
                locationText.textContent = `${address} 음식점`;


                fetchRestaurants(currentLat, currentLng);
            }, () => {
                alert("🔴 위치 정보를 가져올 수 없습니다.");
            });
        } else {
            alert("🔴 위치 서비스가 지원되지 않습니다.");
        }
    });

  
    otherLocationBtn.addEventListener("click", () => {
        currentLat = 35.6938;
        currentLng = 139.7034;
        fetchRestaurants(currentLat, currentLng);
    });


    
    async function fetchRestaurants(lat, lng, keyword = "", range = 3) {
        const res = await fetch(`/api/restaurants/search?lat=${lat}&lng=${lng}&range=${range}&keyword=${keyword}`);
        const data = await res.json();
        renderRestaurants(data.restaurants);
    }

   
    async function getAddressFromCoords(lat, lng) {
        const API_KEY = process.env.GOOGLE_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}&language=ko`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            return data.results[0]?.formatted_address || "알 수 없는 위치";
        } catch (error) {
            console.error("주소 변환 실패:", error);
            return "알 수 없는 위치";
        }
    }

   
    function renderRestaurants(restaurants) {
        restaurantList.innerHTML = ""; 
        const groupedByGenre = {};

      
        restaurants.forEach((r) => {
            const genre = r.genre.name;
            if (!groupedByGenre[genre]) {
                groupedByGenre[genre] = [];
            }
            groupedByGenre[genre].push(r);
        });

    
        Object.entries(groupedByGenre).forEach(([genre, shops]) => {
            const categoryBox = document.createElement("div");
            categoryBox.classList.add("category-box");

            categoryBox.innerHTML = `
                <h4 class="category-title">#${genre}</h4>
                <div class="carousel-container">
                    <button class="btn-category-arrow left"><i class="fa-solid fa-chevron-left"></i></button>
                    <div class="carousel">
                        ${shops.map((r) => `
                            <div class="restaurant-card">
                                <img src="${r.photo.pc.m}" alt="${r.name}" class="restaurant-img"/>
                                <p class="restaurant-name">${r.name}</p>
                            </div>
                        `).join("")}
                    </div>
                    <button class="btn-category-arrow right"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            `;

            restaurantList.appendChild(categoryBox);

           
            const carousel = categoryBox.querySelector(".carousel");
            categoryBox.querySelector(".left").addEventListener("click", () => {
                carousel.scrollBy({ left: -300, behavior: "smooth" });
            });
            categoryBox.querySelector(".right").addEventListener("click", () => {
                carousel.scrollBy({ left: 300, behavior: "smooth" });
            });
        });
    }
});