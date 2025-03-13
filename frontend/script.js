document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const locationText = document.getElementById("location-text");
  const currentLocationBtn = document.getElementById("now-location-btn");
  const otherLocationBtn = document.getElementById("other-location-btn");
  const confirmRangeBtn = document.getElementById("confirm-range-btn");
  const rangeSelect = document.getElementById("range-select");
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

  currentLocationBtn.addEventListener("click", () => {
    const rangeModalEl = document.getElementById("rangeModal");
    const rangeModal = new bootstrap.Modal(rangeModalEl);
    rangeModal.show();
  });


  confirmRangeBtn.addEventListener("click", async () => {
    try {
      const range = rangeSelect.value;
      const { lat, lng } = await getCurrentLocationFromGoogle();
      updateLocationAndFetch(lat, lng, range);


      const rangeModalEl = document.getElementById("rangeModal");
      const rangeModal = bootstrap.Modal.getInstance(rangeModalEl);
      if (rangeModal) rangeModal.hide();

    } catch (error) {
      alert("🔴 位置情報を取得できませんでした。");
    }
  });

  
  otherLocationBtn.addEventListener("click", () => {
    renderLargeAreaSelection();

    const locationModalEl = document.getElementById("locationModal");
    let locationModal = bootstrap.Modal.getInstance(locationModalEl);
    
    if (!locationModal) {
      locationModal = new bootstrap.Modal(locationModalEl);
    }

    locationModal.show();
  });


  async function updateLocationAndFetch(lat, lng, range = 3) {
    currentLat = lat;
    currentLng = lng;
    const address = await getAddressFromCoords(lat, lng);
    locationText.textContent = `${address} グルメ`;
    fetchRestaurants(lat, lng, "", range);
  }


  async function getCurrentLocationFromGoogle() {
    try {
      const res = await axios.get("/api/google/geolocation");
      const data = res.data;
      if (data.error) throw new Error(data.error);
      return { lat: data.lat, lng: data.lng };
    } catch (err) {
      console.error("🔴 Google Geolocation エラー:", err);
      throw err;
    }
  }


  async function fetchRestaurants(lat, lng, keyword = "", range = 3) {
    try {
      const res = await axios.get("/api/restaurants/search", {
        params: { lat, lng, range, keyword }
      });
      const data = res.data;
      renderRestaurants(data.restaurants);
    } catch (error) {
      console.error("🔴 サーチエラー:", error);
    }
  }

  async function getAddressFromCoords(lat, lng) {
    try {
      const res = await axios.get("/api/google/geocode", {
        params: { lat, lng }
      });
      const data = res.data;
      return data.address || "不明なaddress";
    } catch (err) {
      console.error("🔴 addressエラー:", err);
      return "不明なaddress";
    }
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


  async function fetchLargeAreas() {
    try {
      const res = await axios.get('/api/large_area/v1/');
      const data = res.data;
      return data.results.large_area || [];
    } catch (err) {
      console.error("🔴 large_areaエラー:", err);
      return [];
    }
  }


  async function fetchMiddleAreas(largeAreaCode) {
    try {
      const res = await axios.get('/api/middle_area/v1/', {
        params: { large_area: largeAreaCode }
      });
      const data = res.data;
      return data.results.middle_area || [];
    } catch (err) {
      console.error("🔴 middle_areaエラー:", err);
      return [];
    }
  }


  async function fetchSmallAreas(middleAreaCode) {
    try {
      const res = await axios.get('/api/small_area/v1/', {
        params: { middle_area: middleAreaCode }
      });
      const data = res.data;
      return data.results.small_area || [];
    } catch (err) {
      console.error("🔴 small_areaエラー:", err);
      return [];
    }
  }

  async function renderLargeAreaSelection() {
    const container = document.getElementById("location-selection");
    container.innerHTML = "";
    const title = document.createElement("h5");
    title.textContent = "エリア選択";
    title.style.marginBottom = "15px";
    container.appendChild(title);
    const largeAreas = await fetchLargeAreas();
    if (largeAreas.length === 0) {
      container.innerHTML += "<p>エリア選択エラー</p>";
      return;
    }
    largeAreas.forEach(area => {
      const btn = document.createElement("button");
      btn.textContent = area.name;
      btn.className = "list-group-item list-group-item-action";
      btn.style.marginBottom = "10px";
      btn.addEventListener("click", () => {
        renderMiddleAreaSelection(area);
      });
      container.appendChild(btn);
    });
  }

  async function renderMiddleAreaSelection(largeArea) {
    const container = document.getElementById("location-selection");
    container.innerHTML = "";
    const backBtn = document.createElement("button");
    backBtn.textContent = "← ";
    backBtn.className = "btn btn-secondary mb-2";
    backBtn.addEventListener("click", renderLargeAreaSelection);
    container.appendChild(backBtn);
    const title = document.createElement("h5");
    title.textContent = `${largeArea.name} > `;
    title.style.marginBottom = "15px";
    container.appendChild(title);
    const middleAreas = await fetchMiddleAreas(largeArea.code);
    if (middleAreas.length === 0) {
      container.innerHTML += "<p>エリア選択エラー</p>";
      return;
    }
    middleAreas.forEach(area => {
      const btn = document.createElement("button");
      btn.textContent = area.name;
      btn.className = "list-group-item list-group-item-action";
      btn.style.marginBottom = "10px";
      btn.addEventListener("click", () => {
        renderSmallAreaSelection(largeArea, area);
      });
      container.appendChild(btn);
    });
  }


  async function renderSmallAreaSelection(largeArea, middleArea) {
    const container = document.getElementById("location-selection");
    container.innerHTML = "";
    const backBtn = document.createElement("button");
    backBtn.textContent = "← ";
    backBtn.className = "btn btn-secondary mb-2";
    backBtn.addEventListener("click", () => renderMiddleAreaSelection(largeArea));
    container.appendChild(backBtn);
    const title = document.createElement("h5");
    title.textContent = `${middleArea.name} > `;
    title.style.marginBottom = "15px";
    container.appendChild(title);
    const smallAreas = await fetchSmallAreas(middleArea.code);
    if (smallAreas.length === 0) {
      container.innerHTML += "<p>エリア選択エラー</p>";
      return;
    }
    smallAreas.forEach(area => {
      const btn = document.createElement("button");
      btn.textContent = area.name;
      btn.className = "list-group-item list-group-item-action";
      btn.style.marginBottom = "10px";
      btn.addEventListener("click", () => {
        updateLocationAndFetchByCode(area.code, area.name);
        const modalEl = document.getElementById("locationModal");
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();
      });
      container.appendChild(btn);
    });
  }

  async function updateLocationAndFetchByCode(smallAreaCode, smallAreaName) {
    locationText.textContent = `${smallAreaName} グルメ`;
    try {
      const res = await axios.get("/api/restaurants/search", {
        params: { small_area: smallAreaCode, range: 3 }
      });
      const data = res.data;
      if (data.restaurants && data.restaurants.length > 0) {
        renderRestaurants(data.restaurants);
      } else {
        fetchRestaurantsByKeyword(smallAreaName);
      }
    } catch (error) {
      console.error("🔴 グルメサーチ中エラー:", error);
    }
  }

  async function fetchRestaurantsByKeyword(keyword, range = 3) {
    try {
      const res = await axios.get("/api/restaurants/search", {
        params: { keyword, range }
      });
      const data = res.data;
      renderRestaurants(data.restaurants);
    } catch (error) {
      console.error("キーワードベースのレストラン検索エラー:", error);
    }
  }
});
