const loginForm = document.querySelector(".login-form")
const loginEmail = document.querySelector("#email")
const loginPwd = document.querySelector("#pwd")
const loginErrorMsg = document.querySelector(".login-error-msg")
const LOGIN_API_URL = "http://localhost:5678/api/users/login"

// Utils function update error message
function updateErrorMessage(message) {
  loginErrorMsg.textContent = message
}

// Utils function check inputs
async function handleSubmit(e) {
  e.preventDefault()

  const email = loginEmail.value
  const password = loginPwd.value

  try {
    const response = await fetch(`${LOGIN_API_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const data = await response.json()

      // Store token in sessionStorage
      sessionStorage.setItem("token", data.token)

      // Redirection to home page
      location.replace("../index.html")
    } else {
      updateErrorMessage("Erreur dans l'identifiant ou le mot de passe")
      sessionStorage.clear()
    }
  } catch (error) {
    console.error(error)
    updateErrorMessage("Problème de connexion")
    sessionStorage.clear()
  }
}

// Listen submission
loginForm.addEventListener("submit", handleSubmit)

// Clear error message
loginEmail.addEventListener("input", () => {
  updateErrorMessage("")
})

// Clear error message
loginPwd.addEventListener("input", () => {
  updateErrorMessage("")
})
