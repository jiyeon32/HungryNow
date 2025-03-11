document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const locationText = document.getElementById("location-text");
    const currentLocationBtn = document.getElementById("now-location-btn");
    const otherLocationBtn = document.getElementById("other-location-btn");
    const restaurantList = document.getElementById("restaurant-list");


    let currentLat = null; 
    let currentLng = null;

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault(); 
            const keyword = searchInput.value.trim();
            if (keyword) {
                window.location.href = `results.html?keyword=${encodeURIComponent(keyword)}`;
            }
        });
    }

    currentLocationBtn.addEventListener("click", async () => {
        try {
            const { lat, lng } = await getCurrentLocationFromGoogle();
            updateLocationAndFetch(lat, lng);
        } catch (error) {
            alert("🔴 위치 정보를 가져올 수 없습니다.");
        }
    });
  
 
    otherLocationBtn.addEventListener("click", () => {
        const locationModalEl = document.getElementById("locationModal");
        const locationModal = new bootstrap.Modal(locationModalEl);
        locationModal.show();
    });

    
    const locationModalEl = document.getElementById("locationModal");
    if(locationModalEl){
        locationModalEl.addEventListener("click", (e) => {
            if(e.target && e.target.matches('.list-group-item')){
                const lat = e.target.getAttribute("data-lat");
                const lng = e.target.getAttribute("data-lng");
                updateLocationAndFetch(lat, lng);
                const modalInstance = bootstrap.Modal.getInstance(locationModalEl);
                modalInstance.hide();
            }
        });
    }

    async function updateLocationAndFetch(lat, lng) {
        currentLat = lat;
        currentLng = lng;
        const address = await getAddressFromCoords(lat, lng);
        locationText.textContent = `${address} グルメ`;
        fetchRestaurants(lat, lng);
    }

    async function getCurrentLocationFromGoogle() {
        const res = await fetch("/api/google/geolocation");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return { lat: data.lat, lng: data.lng };
    }

    async function fetchRestaurants(lat, lng, keyword = "", range = 3) {
        try {
            const res = await fetch(`/api/restaurants/search?lat=${lat}&lng=${lng}&range=${range}&keyword=${keyword}`);
            const data = await res.json();
            renderRestaurants(data.restaurants);
        } catch (error) {
            console.error("음식점 데이터를 가져오는 중 오류 발생:", error);
        }
    }

    async function getAddressFromCoords(lat, lng) {
        const res = await fetch(`/api/google/geocode?lat=${lat}&lng=${lng}`);
        const data = await res.json();
        return data.address || "알 수 없는 위치";
    }

    function renderRestaurants(restaurants) {
        restaurantList.innerHTML = ""; 
        const groupedByGenre = {};

        restaurants.forEach((r) => {
            const genre = r.genre.name;
            if (!groupedByGenre[genre]) groupedByGenre[genre] = [];
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
