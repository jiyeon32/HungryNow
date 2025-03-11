document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get("keyword") || ""; 
    const restaurantList = document.getElementById("restaurant-list-results");
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");

    console.log(`🔍 검색어: ${keyword}`);

    if (keyword) {
        console.log(`📡 API 요청 실행: ${keyword}`);
        await fetchRestaurants(keyword); 
    } else {
        console.error("🔴 검색어가 없습니다.");
        restaurantList.innerHTML = "<p>검색어를 입력해주세요.</p>";
    }

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const newKeyword = searchInput.value.trim();
            if (newKeyword) {
                console.log(`🔍 새로운 검색 실행: ${newKeyword}`);
                window.location.href = `results.html?keyword=${encodeURIComponent(newKeyword)}`;
            }
        });
    }
});

let allRestaurants = [];  
let currentPage = 1;       
const itemsPerPage = 7;     
const maxPageButtons = 5;   


async function fetchRestaurants(keyword) {
    try {
        const res = await fetch(`/api/restaurants/search?keyword=${encodeURIComponent(keyword)}`);
        const data = await res.json();

        if (!data.restaurants || data.restaurants.length === 0) {
            console.warn("🔴 검색 결과 없음");
            document.getElementById("restaurant-list-results").innerHTML = "<p>검색 결과가 없습니다.</p>";
            return;
        }

        allRestaurants = data.restaurants;
        currentPage = 1;
        renderPage(currentPage);
        renderPagination();
    } catch (error) {
        console.error("🔴 음식점 검색 오류:", error);
        document.getElementById("restaurant-list-results").innerHTML = "<p>검색 중 오류가 발생했습니다.</p>";
    }
}


function renderPage(page) {
    const restaurantList = document.getElementById("restaurant-list-results");
    restaurantList.innerHTML = "";

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = allRestaurants.slice(startIndex, endIndex);

    pageItems.forEach((r) => {
        const card = document.createElement("div");
        card.classList.add("restaurant-card");

        card.innerHTML = `
            <img src="${r.photo?.pc?.m || 'placeholder.jpg'}" alt="${r.name}" class="restaurant-img">
            <div class="restaurant-info">
                <p class="restaurant-name">${r.name}</p>
                <p class="restaurant-address">${r.address}</p>
                <p class="restaurant-hours">운영시간: ${r.open || "정보 없음"}</p>
            </div>
        `;

        restaurantList.appendChild(card);
    });

    console.log(`${allRestaurants.length}개의 음식점 검색 완료`);
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