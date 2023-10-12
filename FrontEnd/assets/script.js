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
    console.error(error)
    return null
  }
}

// Get initial images
async function callApi() {
  const data = await fetchData(WORKS_API_URL)
  if (data) {
    allData = data
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
  const filteredData = allData.filter((item) => {
    return categoryId == "0" || item.categoryId == categoryId
  })

  let galleryHTML = ""

  filteredData.forEach((item) => {
    galleryHTML += `
      <figure class="project-container" data-id="${item.id}">
        <img src="${item.imageUrl}" alt="${item.title}">
        <figcaption>${item.title}</figcaption>
      </figure>
    `
  })

  galleryContainer.innerHTML = galleryHTML
}

// Add filters
async function callCategories() {
  const data = await fetchData(CATEGORIES_API_URL)
  if (data) {
    createButton("Tous", "0")
    data.forEach((category) => {
      createButton(category.name, category.id)
    })
    createCategorySelection(data)
  }
}
callCategories()

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

// Toggle edtion mode and logout
const editionBar = document.querySelector(".edition-bar")
const loginLink = document.querySelector(".login-link")
const portfolioEdtionMode = document.querySelector(".portfolio-edtion-mode")

let logoutBtn
logoutBtn = document.createElement("button")

logoutBtn.addEventListener("click", removeEditionMode)

if (sessionStorage.getItem("token")) {
  addEditionMode()
}

function addEditionMode() {
  editionBar.classList.add("authorized")
  loginLink.style.display = "none"
  logoutBtn.textContent = "logout"
  logoutBtn.classList.add("logout-btn")
  loginLink.parentNode.insertBefore(logoutBtn, loginLink)
  filterBtnContainer.style.display = "none"
  portfolioEdtionMode.classList.add("authorized")
  document.body.classList.add("login")
}

function removeEditionMode() {
  sessionStorage.removeItem("token")
  editionBar.classList.remove("authorized")
  loginLink.parentNode.removeChild(logoutBtn)
  loginLink.style.display = "block"
  filterBtnContainer.style.display = "block"
  portfolioEdtionMode.classList.remove("authorized")
  document.body.classList.remove("login")
  location.reload()
}

// Modal management
const openModalBtn = document.querySelector(".open-modal-btn")
const modalGalleryContainer = document.querySelector(".modal-gallery-container")
let modalContainer

openModalBtn.addEventListener("click", openModal)

function openModal(e) {
  e.preventDefault()
  modalContainer = document.querySelector("#modal-container")
  modalContainer.style.display = "flex"
  modalContainer.removeAttribute("aria-hidden")
  modalContainer.addEventListener("click", closeModal)
  modalContainer
    .querySelector(".close-modal-btn")
    .addEventListener("click", closeModal)
  modalContainer
    .querySelector(".modal")
    .addEventListener("click", stopPropagation)

  addProjectToModal()
}

// Call API and get data
function addProjectToModal() {
  callApi().then(() => {
    const data = allData
    let modalHTML = ""

    data.forEach((item) => {
      modalHTML += `
          <figure class="modal-project-container project-container" data-id="${item.id}">
            <img src="${item.imageUrl}" alt="${item.title}" class="modal-img" >
            <button class="modal-trash-btn">
              <img src="./assets/icons/trashBtn.svg" alt="supprimer la photo de la galerie" data-id="${item.id}" >
            </button>
          </figure>
        `
    })

    modalGalleryContainer.innerHTML = modalHTML

    // Add event listener to trash buttons
    const trashButtons =
      modalGalleryContainer.querySelectorAll(".modal-trash-btn")
    trashButtons.forEach((trashButton) => {
      trashButton.addEventListener("click", handleDeleteImage)
    })
  })
}

function closeModal(e) {
  e.preventDefault()
  modalContainer.style.display = "none"
  modalContainer.setAttribute("aria-hidden", "true")
  modalContainer.removeEventListener("click", closeModal)
  modalContainer
    .querySelector(".close-modal-btn")
    .removeEventListener("click", closeModal)
  modalContainer
    .querySelector(".modal")
    .removeEventListener("click", stopPropagation)

  // Remove event listener to trash buttons
  const trashButtons =
    modalGalleryContainer.querySelectorAll(".modal-trash-btn")
  trashButtons.forEach((trashButton) => {
    trashButton.removeEventListener("click", handleDeleteImage)
  })
}

function stopPropagation(e) {
  e.stopPropagation()
}

const token = sessionStorage.getItem("token")
// Function for detele images
async function handleDeleteImage(e) {
  const imageId = e.target.getAttribute("data-id")

  if (!token) {
    console.error("Merci de vous connecter")
    return
  }

  const headers = new Headers({
    Authorization: `Bearer ${token}`,
  })

  // Send DELETE request to API
  const deleteUrl = `${WORKS_API_URL}/${imageId}`

  try {
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: headers,
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la suppression du projet")
    }

    // Remove image from the DOM
    document
      .querySelectorAll(`.project-container[data-id="${imageId}"`)
      .forEach((item) => {
        item.remove()
      })
  } catch (error) {
    console.error(error)
  }
}

// Handle form to add projects
const modal = document.querySelector(".modal")
const addImgForm = document.querySelector(".add-project-form")
const addImgBtn = document.querySelector(".modal-add-project-btn")
const goBackBtn = document.querySelector(".go-back-btn")
const closeFormBtn = document.querySelector(".close-form-btn")

addImgForm.addEventListener("click", stopPropagation)
addImgBtn.addEventListener("click", handleAddImgForm)
goBackBtn.addEventListener("click", handleAddImgForm)
closeFormBtn.addEventListener("click", closeModal)

function handleAddImgForm() {
  addImgForm.classList.toggle("hidden")
  modal.classList.toggle("hidden")
}

// Add select in form
const selectContainer = document.querySelector(".input-group:nth-child(3)")
let select

function createCategorySelection(data) {
  select = document.createElement("select")
  select.setAttribute("id", "category")

  let defaultOption = document.createElement("option")
  defaultOption.setAttribute("value", "")
  defaultOption.textContent = ""
  select.appendChild(defaultOption)

  data.forEach((option) => {
    let options = document.createElement("option")
    options.setAttribute("value", `${option.id}`)
    options.textContent = option.name
    select.appendChild(options)
  })

  selectContainer.appendChild(select)

  select.addEventListener("change", checkFields)
}

// Show image in file input
const inputFileContainer = document.querySelector(".input-group:nth-child(1)")
const preview = document.querySelector(".add-project-icon")
const file = document.querySelector("#add-project-input")
const addProjectLabelBtn = document.querySelector(".add-project-label-btn")
const addProjectParag = document.querySelector(".add-project-parag")

file.addEventListener("change", previewFile)

function previewFile() {
  const reader = new FileReader()

  reader.addEventListener("load", () => {
    preview.src = reader.result
    preview.style.height = "130px"
  })

  if (file.files[0]) {
    reader.readAsDataURL(file.files[0])
    addProjectLabelBtn.style.display = "none"
    addProjectParag.style.display = "none"
    inputFileContainer.style.paddingTop = "0"
    inputFileContainer.style.paddingBottom = "0"
  } else {
    addProjectLabelBtn.style.display = "block"
    addProjectParag.style.display = "block"
    inputFileContainer.style.paddingLeft = "123px"
    inputFileContainer.style.paddingRight = "123px"
  }
}

// Check if all fields are completed
const projectTitleInput = document.querySelector("#title")
const submitProjectBtn = document.querySelector(".form-add-project-btn")
const formErrorMsg = document.querySelector(".form-error-msg")

let selectedFile
let projectTitle
let selectedCategory

file.addEventListener("change", checkFields)
projectTitleInput.addEventListener("input", checkFields)

function checkFields() {
  selectedFile = file.files[0]
  projectTitle = projectTitleInput.value
  selectedCategory = select.value

  const fileFilled =
    selectedFile &&
    selectedFile.size <= 4000000 &&
    (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")

  const categoryFilled =
    selectedCategory !== undefined && selectedCategory !== ""

  const titleInputFilled = projectTitle.trim() !== ""

  if (categoryFilled && fileFilled && titleInputFilled) {
    submitProjectBtn.removeAttribute("disabled")
    formErrorMsg.classList.add("hidden")
  } else {
    submitProjectBtn.setAttribute("disabled", "true")
    formErrorMsg.classList.remove("hidden")
  }
}

// Send form data to API
let formData = new FormData()

submitProjectBtn.addEventListener("click", handleFormData)

function handleFormData(e) {
  e.preventDefault()
  formData.set("image", selectedFile)
  formData.set("title", projectTitle)
  formData.set("category", parseInt(selectedCategory))

  sendFormData()
}

// Send request to API and add new project in gallery
async function sendFormData() {
  if (!token) {
    console.error("Merci de vous connecter")
    return
  }

  try {
    const response = await fetch(`${WORKS_API_URL}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    if (response.ok) {
      const data = await response.json()
      allData = data
      callApi()
      addProjectToModal()
      resetForm()
    } else {
      throw new Error("Erreur lors de l'ajout du projet")
    }
  } catch (error) {
    console.error(error)
  }
}

const successPopUp = document.querySelector(".success-popup")

// Reset form value
function resetForm() {
  file.value = ""
  projectTitleInput.value = ""
  select.value = ""

  submitProjectBtn.setAttribute("disabled", "true")

  preview.src = "./assets/icons/addProject.svg"
  preview.style.height = "76px"

  addProjectLabelBtn.style.display = "block"
  addProjectParag.style.display = "block"

  inputFileContainer.style.padding = "22px 123px 19px"

  successPopUp.classList.add("success")

  setTimeout(() => {
    successPopUp.classList.remove("success")
  }, 1500)
}
