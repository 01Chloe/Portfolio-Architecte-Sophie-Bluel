const loginForm = document.querySelector(".login-form")
const loginEmail = document.querySelector("#email")
const loginPwd = document.querySelector("#pwd")
const loginErrorMsg = document.querySelector(".login-error-msg")

// Utils function for update error message
function updateErrorMessage(message) {
  loginErrorMsg.textContent = message
}

// Utils function for check inputs
async function handleSubmit(e) {
  e.preventDefault()

  const email = loginEmail.value
  const password = loginPwd.value

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const data = await response.json()

      // Store token in sessionStorage
      sessionStorage.setItem("token", data.token)

      // Redirect user to home page
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
