document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get("keyword") || "";
    const restaurantList = document.getElementById("restaurant-list-results");
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");

    console.log(`🔍 検索キーワード: ${keyword}`);

    if (!keyword) {
        console.error("🔴 検索キーワードがありません。");
        restaurantList.innerHTML = "<p>検索キーワードを入力してください。</p>";
    } else {
        restoreSelectedFilters();
        await updateRestaurantList();
    }

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const newKeyword = searchInput.value.trim();
            if (newKeyword) {
                console.log(`🔍 新規検索実行: ${newKeyword}`);
                window.location.href = `results.html?keyword=${encodeURIComponent(newKeyword)}`;
            }
        });
    }
});

let allRestaurants = [];
let currentPage = 1;
const itemsPerPage = 8;
const maxPageButtons = 5;

async function updateRestaurantList() {
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get("keyword") || "";
    const lat = urlParams.get("lat");
    const lng = urlParams.get("lng");

    const selectedFilters = Array.from(document.querySelectorAll("#selected-filters .selected-filter")).map(filter => {
        return { category: filter.getAttribute("data-category"), code: filter.getAttribute("data-code") };
    });
    const filterGroups = {};
    selectedFilters.forEach(f => {
        if (!filterGroups[f.category]) {
            filterGroups[f.category] = [];
        }
        filterGroups[f.category].push(f.code);
    });


    let params = { keyword: keyword, range: 3, count: 50 };
    if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
    }
    if (filterGroups["genre"]) {
        params.genre = filterGroups["genre"].join(",");
    }
    if (filterGroups["budget"]) {
        params.budget = filterGroups["budget"].join(",");
    }
    if (filterGroups["wifi"]) {
        params.wifi = filterGroups["wifi"].join(",");
    }
    if (filterGroups["area"]) {
        params.small_area = filterGroups["area"].join(",");
    }

    try {
        const res = await axios.get("/api/restaurants/search", { params });
        const data = res.data;
        if (!data.restaurants || data.restaurants.length === 0) {
            console.warn("🔴 検索結果なし");
            document.getElementById("restaurant-list-results").innerHTML = "<p>検索結果がありません。</p>";
            allRestaurants = [];
            renderPagination();
            return;
        }
        allRestaurants = data.restaurants;
        currentPage = 1;
        renderPage(currentPage);
        renderPagination();
    } catch (error) {
        console.error("🔴 飲食店検索エラー:", error);
        document.getElementById("restaurant-list-results").innerHTML = "<p>検索中にエラーが発生しました。</p>";
    }
}

function renderPage(page) {
    const tableBody = document.getElementById("restaurant-table-body");
    tableBody.innerHTML = ""; 
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = allRestaurants.slice(startIndex, endIndex);

    pageItems.forEach((r) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${r.photo?.pc?.m || 'placeholder.jpg'}" alt="${r.name}" class="restaurant-img"></td>
            <td>${r.name}</td>
            <td>${r.address}</td>
            <td>${r.open || "情報なし"}</td>
        `;
        row.addEventListener("click", () => {
            const selectedRestaurant = {
                name: r.name,
                address: r.address,
                photo: r.photo,
                open: r.open,
                genre: r.genre || { name: "情報なし" },
                budget: r.budget || { name: "情報なし" },
                wifi: r.wifi,
                lat: r.lat,
                lng: r.lng
            };
            localStorage.setItem("selectedRestaurant", JSON.stringify(selectedRestaurant));
            window.location.href = "details.html";
        });
        tableBody.appendChild(row);
    });

    console.log(`${allRestaurants.length}件の店舗を一覧形式で表示`);
}


function renderPagination() {
    let paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) {
        paginationContainer = document.createElement("div");
        paginationContainer.id = "pagination";
        paginationContainer.style.textAlign = "center";
        paginationContainer.style.marginTop = "20px";
        document.getElementById("restaurant-list-results").appendChild(paginationContainer);
    }
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(allRestaurants.length / itemsPerPage);
    const prevButton = document.createElement("button");
    prevButton.textContent = "<";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
            renderPagination();
        }
    });
    paginationContainer.appendChild(prevButton);
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = startPage + maxPageButtons - 1;
    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.disabled = true;
        }
        pageButton.addEventListener("click", () => {
            currentPage = i;
            renderPage(currentPage);
            renderPagination();
        });
        paginationContainer.appendChild(pageButton);
    }
    const nextButton = document.createElement("button");
    nextButton.textContent = ">";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage(currentPage);
            renderPagination();
        }
    });
    paginationContainer.appendChild(nextButton);
}

async function fetchCategoryOptions(category) {
    try {
        let res;
        switch (category) {
            case "genre":
                res = await axios.get("/api/genre/v1/");
                return res.data.results.genre || [];
            case "budget":
                res = await axios.get("/api/budget/v1/");
                return res.data.results.budget || [];
            case "wifi":
                return [{ code: "0", name: "WiFiなし" }, { code: "1", name: "WiFiあり" }];
            default:
                return [];
        }
    } catch (err) {
        console.error(`${category} オプション取得エラー:`, err);
        return [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const category = btn.getAttribute("data-category");
            if (category === "area") {
                renderLargeAreaSelection();
                const locationModalEl = document.getElementById("locationModal");
                const locationModal = new bootstrap.Modal(locationModalEl);
                locationModal.show();
            } else {
                openCategoryModal(category);
            }
        });
    });
});


async function openCategoryModal(category) {
    const modalTitle = document.getElementById("categoryModalLabel");
    modalTitle.textContent = getCategoryTitle(category);
    const optionsContainer = document.getElementById("category-options");
    optionsContainer.innerHTML = "";
    const options = await fetchCategoryOptions(category);
    options.forEach((option) => {
        const optionBtn = document.createElement("button");
        const displayText = typeof option === "object" ? option.name : option;
        optionBtn.textContent = displayText;
        optionBtn.addEventListener("click", () => {
            addSelectedFilter(category, displayText, typeof option === "object" ? option.code : displayText);
            const modalEl = document.getElementById("categoryModal");
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();
        });
        optionsContainer.appendChild(optionBtn);
    });
    const categoryModalEl = document.getElementById("categoryModal");
    const categoryModal = new bootstrap.Modal(categoryModalEl);
    categoryModal.show();
}

function getCategoryTitle(category) {
    switch (category) {
        case "genre":
            return "お店ジャンル選択";
        case "wifi":
            return "WiFi 有無選択";
        case "budget":
            return "ディナー予算選択";
        default:
            return "オプション選択";
    }
}

function saveSelectedFilters() {
    const selectedFiltersContainer = document.getElementById("selected-filters");
    const filters = [];
    selectedFiltersContainer.querySelectorAll(".selected-filter").forEach(filter => {
        filters.push({
            category: filter.getAttribute("data-category"),
            code: filter.getAttribute("data-code"),
            text: filter.querySelector(".filter-label").textContent
        });
    });
    localStorage.setItem("selectedFilters", JSON.stringify(filters));
}

function restoreSelectedFilters() {
    const filtersStr = localStorage.getItem("selectedFilters");
    if (filtersStr) {
        const filters = JSON.parse(filtersStr);
        filters.forEach(filter => {
            addSelectedFilter(filter.category, filter.text, filter.code, false);
        });
    }
}


function addSelectedFilter(category, optionText, optionCode, update = true) {
    const selectedFiltersContainer = document.getElementById("selected-filters");
    const existingFilter = selectedFiltersContainer.querySelector(`[data-category="${category}"][data-code="${optionCode}"]`);
    if (existingFilter) {
        return;
    }
    const filterTag = document.createElement("div");
    filterTag.className = "selected-filter";
    filterTag.setAttribute("data-category", category);
    filterTag.setAttribute("data-code", optionCode);
    filterTag.innerHTML = `<span class="filter-label">${optionText}</span> 
                           <button class="remove-filter">&times;</button>`;
    filterTag.querySelector(".remove-filter").addEventListener("click", () => {
        filterTag.remove();
        saveSelectedFilters();
        updateRestaurantList();
    });
    selectedFiltersContainer.appendChild(filterTag);
    saveSelectedFilters();
    if (update) {
        updateRestaurantList();
    }
}


async function fetchLargeAreas() {
    try {
        const res = await axios.get("/api/large_area/v1/");
        const data = res.data;
        return data.results.large_area || [];
    } catch (err) {
        console.error("大エリア取得エラー:", err);
        return [];
    }
}

async function fetchMiddleAreas(largeAreaCode) {
    try {
        const res = await axios.get("/api/middle_area/v1/", {
            params: { large_area: largeAreaCode }
        });
        const data = res.data;
        return data.results.middle_area || [];
    } catch (err) {
        console.error("中エリア取得エラー:", err);
        return [];
    }
}

async function fetchSmallAreas(middleAreaCode) {
    try {
        const res = await axios.get("/api/small_area/v1/", {
            params: { middle_area: middleAreaCode }
        });
        const data = res.data;
        return data.results.small_area || [];
    } catch (err) {
        console.error("小エリア取得エラー:", err);
        return [];
    }
}

async function renderLargeAreaSelection() {
    const container = document.getElementById("location-selection");
    container.innerHTML = "";
    const title = document.createElement("h5");
    title.textContent = "大エリア選択";
    title.style.marginBottom = "15px";
    container.appendChild(title);
    const largeAreas = await fetchLargeAreas();
    if (largeAreas.length === 0) {
        container.innerHTML += "<p>大エリア情報が取得できません。</p>";
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
    const locationModalEl = document.getElementById("locationModal");
    const locationModal = new bootstrap.Modal(locationModalEl);
    locationModal.show();
}

async function renderMiddleAreaSelection(largeArea) {
    const container = document.getElementById("location-selection");
    container.innerHTML = "";
    const backBtn = document.createElement("button");
    backBtn.textContent = "←";
    backBtn.className = "btn btn-secondary mb-2";
    backBtn.addEventListener("click", renderLargeAreaSelection);
    container.appendChild(backBtn);
    const title = document.createElement("h5");
    title.textContent = `${largeArea.name}内の中エリア選択`;
    title.style.marginBottom = "15px";
    container.appendChild(title);
    const middleAreas = await fetchMiddleAreas(largeArea.code);
    if (middleAreas.length === 0) {
        container.innerHTML += "<p>中エリア情報が取得できません。</p>";
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
    backBtn.textContent = "←";
    backBtn.className = "btn btn-secondary mb-2";
    backBtn.addEventListener("click", () => renderMiddleAreaSelection(largeArea));
    container.appendChild(backBtn);
    
    const title = document.createElement("h5");
    title.textContent = `${middleArea.name}内の小エリア選択`;
    title.style.marginBottom = "15px";
    container.appendChild(title);
    
    const smallAreas = await fetchSmallAreas(middleArea.code);
    if (smallAreas.length === 0) {
        container.innerHTML += "<p>小エリア情報が取得できません。</p>";
        return;
    }
    
    smallAreas.forEach(area => {
        const btn = document.createElement("button");
        btn.textContent = area.name;
        btn.className = "list-group-item list-group-item-action";
        btn.style.marginBottom = "10px";
        btn.addEventListener("click", async () => {
            try {
                addSelectedFilter("area", area.name, area.code);
                const coords = await getCoordinatesByRegionName(area.name);
                updateLocationAndFetch(coords.lat, coords.lng);
            } catch (error) {
                console.error("Google Geocoding API エラー:", error);
            }
            const modalEl = document.getElementById("locationModal");
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        });
        container.appendChild(btn);
    });
}

async function getCoordinatesByRegionName(regionName) {
    try {
        const res = await axios.get("/api/google/geocode_by_address", {
            params: { address: regionName }
        });
        const data = res.data;
        if (!data.lat || !data.lng) throw new Error("座標情報なし");
        return { lat: data.lat, lng: data.lng };
    } catch (error) {
        console.error("Google Geocoding API 呼び出しエラー:", error);
        throw error;
    }
}

function updateLocationAndFetch(lat, lng) {
    console.log(`Updating location to: ${lat}, ${lng}`);
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get("keyword") || "";

    saveSelectedFilters();
    window.location.href = `results.html?keyword=${encodeURIComponent(keyword)}&lat=${lat}&lng=${lng}`;
}
