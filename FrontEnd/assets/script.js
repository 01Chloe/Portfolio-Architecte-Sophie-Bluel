const galleryContainer = document.querySelector(".gallery")
let allData = []
let currentCategoryId = "0" // Show all categories by default

const WORKS_API_URL = "http://localhost:5678/api/works"
const CATEGORIES_API_URL = "http://localhost:5678/api/categories"

// Utils fonction for call API
async function fetchData(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("Erreur")
    }
    return await response.json()
  } catch (error) {
    console.log(error)
    return null
  }
}

// Get initial images
async function callApi() {
  const data = await fetchData(WORKS_API_URL)
  if (data) {
    allData.push(data)
    addItemsInGallery("0") // Show all images by default
  }
}
callApi()

// Add items dynamically based on category
function addItemsInGallery(categoryId) {
  currentCategoryId = categoryId // Update category

  if (allData.length === 0) {
    return
  }

  // Filter data by category
  const filteredData = allData[0].filter((item) => {
    return categoryId == "0" || item.categoryId == categoryId
  })

  let galleryHTML = ""

  filteredData.forEach((item) => {
    galleryHTML += `
      <figure>
        <img src="${item.imageUrl}" alt="${item.title}">
        <figcaption>${item.title}</figcaption>
      </figure>
    `
  })

  galleryContainer.innerHTML = galleryHTML
}

// Add filters
async function addButtons() {
  const data = await fetchData(CATEGORIES_API_URL)
  if (data) {
    createButton("Tous", "0")
    data.forEach((category) => {
      createButton(category.name, category.id)
    })
  }
}
addButtons()

const filterBtnContainer = document.querySelector(".filters-btn-container")
let allBtnFilter = []

// Utils function for create filter button
function createButton(type, id) {
  let btn = document.createElement("button")
  btn.setAttribute("data-category", id)
  btn.classList.add("filter-btn")
  btn.textContent = type
  filterBtnContainer.appendChild(btn)

  let activeBtnFilter = filterBtnContainer.firstElementChild
  activeBtnFilter.classList.add("filter-active")

  allBtnFilter.push(btn)

  btn.addEventListener("click", () => {
    // Show active button
    allBtnFilter.forEach((button) => {
      button.classList.remove("filter-active")
    })
    btn.classList.add("filter-active")

    // Call the image filter function
    const categoryId = btn.getAttribute("data-category")
    addItemsInGallery(categoryId)
  })
}

// Show edtion mode if token true
const tokenUser = sessionStorage.getItem("token")
const editionBar = document.querySelector(".edition-bar")
const loginLink = document.querySelector(".login-link")
const portfolioEdtionMode = document.querySelector(".portfolio-edtion-mode")

if (tokenUser) {
  addEditionMode()
} else {
  editionBar.classList.remove("authorized")
  loginLink.textContent = "login"
  filterBtnContainer.style.display = "block"
  portfolioEdtionMode.classList.remove("authorized")
  document.body.classList.remove("login")
}

function addEditionMode() {
  editionBar.classList.add("authorized")
  loginLink.textContent = "logout"
  filterBtnContainer.style.display = "none"
  portfolioEdtionMode.classList.add("authorized")
  document.body.classList.add("login")
}
