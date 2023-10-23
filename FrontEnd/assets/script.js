const galleryContainer = document.querySelector(".gallery")
let allData = []
let currentCategoryId = "0" // Show all categories by default

const WORKS_API_URL = "http://localhost:5678/api/works"

// Utils fonction send request to API
async function fetchData(url, method = "GET", headers = {}, body = null) {
  try {
    const options = {
      method: method,
      headers: headers ? headers : {},
      body: body ? body : null,
    }

    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error("Erreur lors de l'envoie de la requête")
    }

    const responseData = await response.text()
    if (responseData) {
      return JSON.parse(responseData)
    } else {
      return {} // Return an empty object if response is empty
    }
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

// Get initial projetcs
let categoryList = new Set()
async function getProjects() {
  const data = await fetchData(WORKS_API_URL)
  if (data) {
    allData = data
    addProjectsInGallery("0")
  }
  allData.forEach((project) => {
    if (project.category.id && project.category.name) {
      let categoryInfo = {
        name: project.category.name,
        id: project.category.id,
      }
      let isDuplicate = false
      for (let item of categoryList) {
        if (item.name === categoryInfo.name && item.id === categoryInfo.id) {
          isDuplicate = true
          break
        }
      }
      if (!isDuplicate) {
        categoryList.add(categoryInfo)
      }
    }
  })
  createButtons("Tous", "0")
  if (categoryList && categoryList.size > 0) {
    for (let item of categoryList.values()) {
      createButtons(item.name, item.id)
    }
  } else {
    console.log("L'objet set est vide ou non défini")
  }
  createCategorySelection(categoryList)
}
getProjects()

// Add projects dynamically based on category
function addProjectsInGallery(categoryId) {
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

const filterBtnContainer = document.querySelector(".filters-btn-container")
let allBtnFilter = []

// Utils function for create filter button
function createButtons(type, id) {
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
    document.querySelector(".filter-active").classList.remove("filter-active")

    btn.classList.add("filter-active")

    // Call filtered projects
    const categoryId = btn.getAttribute("data-category")
    addProjectsInGallery(categoryId)
  })
}

// Toggle edtion mode and logout
const editionBar = document.querySelector(".edition-bar")
const loginLink = document.querySelector(".login-link")
const portfolioEditionMode = document.querySelector(".portfolio-edition-mode")

let logoutBtn
logoutBtn = document.createElement("button")

logoutBtn.addEventListener("click", removeEditionMode)

if (sessionStorage.getItem("token")) {
  addEditionMode()
}

function addEditionMode() {
  editionBar.classList.add("authorized")
  loginLink.classList.add("hidden")
  logoutBtn.textContent = "logout"
  logoutBtn.classList.add("logout-btn")
  loginLink.parentNode.insertBefore(logoutBtn, loginLink)
  filterBtnContainer.classList.add("hidden")
  portfolioEditionMode.classList.add("authorized")
  document.body.classList.add("login")
}

function removeEditionMode() {
  sessionStorage.removeItem("token")
  editionBar.classList.remove("authorized")
  loginLink.parentNode.removeChild(logoutBtn)
  loginLink.classList.remove("hidden")
  filterBtnContainer.classList.remove("hidden")
  portfolioEditionMode.classList.remove("authorized")
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
  modalContainer.classList.remove("hidden")
  modalContainer.classList.add("open")
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

// Add all projects to modal
function addProjectToModal() {
  let modalHTML = ""

  allData.forEach((item) => {
    modalHTML += `
          <figure class="modal-project-container project-container" data-id="${item.id}">
            <img src="${item.imageUrl}" alt="${item.title}" class="modal-img" >
            <button class="modal-trash-btn">
              <img src="./assets/icons/trashBtn.svg" alt="supprimer la photo ${item.title} de la galerie" data-id="${item.id}" >
            </button>
          </figure>
        `
  })

  modalGalleryContainer.innerHTML = modalHTML

  // Add event listener on trash buttons
  const trashButtons =
    modalGalleryContainer.querySelectorAll(".modal-trash-btn")
  trashButtons.forEach((trashButton) => {
    trashButton.addEventListener("click", handleDeleteProject)
  })
}

function closeModal(e) {
  e.preventDefault()
  modalContainer.classList.add("hidden")
  modalContainer.classList.remove("open")
  modalContainer.setAttribute("aria-hidden", "true")
  modalContainer.removeEventListener("click", closeModal)
  modalContainer
    .querySelector(".close-modal-btn")
    .removeEventListener("click", closeModal)
  modalContainer
    .querySelector(".modal")
    .removeEventListener("click", stopPropagation)

  // Remove event listener from trash buttons
  const trashButtons =
    modalGalleryContainer.querySelectorAll(".modal-trash-btn")
  trashButtons.forEach((trashButton) => {
    trashButton.removeEventListener("click", handleDeleteProject)
  })
}

function stopPropagation(e) {
  e.stopPropagation()
}

// Send DELETE request to API and remove project from gallery and modal
const token = sessionStorage.getItem("token")
const successPopUpDelete = document.querySelector(".success-popup-delete")

async function handleDeleteProject(e) {
  const projectId = e.target.getAttribute("data-id")

  if (!token) {
    console.error("Merci de vous connecter")
    return
  }

  const headers = new Headers({
    Authorization: `Bearer ${token}`,
  })

  // Send DELETE request to API
  const deleteUrl = `${WORKS_API_URL}/${projectId}`

  try {
    const response = await fetchData(deleteUrl, "DELETE", headers)

    if (Object.keys(response).length === 0) {
      // Remove project from table of data
      let idToDelete = allData.id
      let indexToDelete = allData.findIndex((item) => item.id === idToDelete)
      allData.splice(indexToDelete, 1)

      // Remove project from the DOM
      document
        .querySelectorAll(`.project-container[data-id="${projectId}"`)
        .forEach((item) => {
          item.remove()
        })

      // Show success message
      successPopUpDelete.classList.add("success")

      setTimeout(() => {
        successPopUpDelete.classList.remove("success")
      }, 2500)
    }
  } catch (error) {
    console.error(error)
  }
}

// Handle form to add projects
const modal = document.querySelector(".modal")
const adProjectForm = document.querySelector(".add-project-form")
const addProjectBtn = document.querySelector(".modal-add-project-btn")
const goBackBtn = document.querySelector(".go-back-btn")
const closeFormBtn = document.querySelector(".close-form-btn")

adProjectForm.addEventListener("click", stopPropagation)
addProjectBtn.addEventListener("click", handleAddProjectForm)
goBackBtn.addEventListener("click", handleAddProjectForm)
closeFormBtn.addEventListener("click", closeModal)

function handleAddProjectForm() {
  adProjectForm.classList.toggle("hidden")
  modal.classList.toggle("hidden")
}

// Add select and options in form
const select = document.querySelector("#category")

function createCategorySelection(categoryList) {
  let defaultOption = document.createElement("option")
  defaultOption.setAttribute("value", "")
  defaultOption.textContent = ""
  select.appendChild(defaultOption)

  categoryList.forEach((option) => {
    let options = document.createElement("option")
    options.setAttribute("value", `${option.id}`)
    options.textContent = option.name
    select.appendChild(options)
  })
}

// Show image in file input
const inputFileContainer = document.querySelector(".input-group:nth-child(1)")
const preview = document.querySelector(".add-project-icon")
const file = document.querySelector("#add-project-input")
const addProjectLabelBtn = document.querySelector(".add-project-label-btn")
const addProjectParag = document.querySelector(".add-project-parag")

file.addEventListener("change", previewFileImage)

function previewFileImage() {
  const reader = new FileReader()

  reader.addEventListener("load", () => {
    preview.src = reader.result
    preview.classList.add("preview")
  })

  if (file.files[0]) {
    reader.readAsDataURL(file.files[0])
    addProjectLabelBtn.classList.add("hidden")
    addProjectParag.classList.add("hidden")
    inputFileContainer.classList.add("resetPadding")
  } else {
    addProjectLabelBtn.classList.remove("hidden")
    addProjectParag.classList.remove("hidden")
    inputFileContainer.classList.remove("resetPadding")
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
select.addEventListener("change", checkFields)

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

// Send POST request to API and add new project in gallery and modal
async function sendFormData() {
  if (!token) {
    console.error("Merci de vous connecter")
    return
  }

  const headers = new Headers({
    Authorization: `Bearer ${token}`,
  })

  try {
    const response = await fetchData(
      `${WORKS_API_URL}`,
      "POST",
      headers,
      formData
    )

    if (response) {
      allData.push(response)

      addProjectsInGallery("0")
      addProjectToModal()
      resetForm()
    } else {
      console.log("Erreur lors de l'ajout du projet")
    }
  } catch (error) {
    console.error(error)
  }
}

const successPopUpAdd = document.querySelector(".success-popup-add")

// Reset form value and show succes message
function resetForm() {
  file.value = ""
  projectTitleInput.value = ""
  select.value = ""

  submitProjectBtn.setAttribute("disabled", "true")

  preview.src = "./assets/icons/addProject.svg"
  preview.classList.remove("preview")

  addProjectLabelBtn.classList.remove("hidden")
  addProjectParag.classList.remove("hidden")

  inputFileContainer.classList.remove("resetPadding")

  successPopUpAdd.classList.add("success")

  setTimeout(() => {
    successPopUpAdd.classList.remove("success")
  }, 2500)
}
