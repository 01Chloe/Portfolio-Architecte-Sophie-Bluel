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
      let token = data.token

      // Store token in sessionStorage
      sessionStorage.setItem("token", token)

      // Redirect user to home page
      window.location.href = "../index.html"
    } else {
      // Show error message
      updateErrorMessage("Erreur dans l'identifiant ou le mot de passe")
      sessionStorage.clear()
    }
  } catch (error) {
    console.error(error)
    updateErrorMessage("Erreur dans l'identifiant ou le mot de passe")
    sessionStorage.clear()
  }
}

// listen submission
loginForm.addEventListener("submit", handleSubmit)

// clear error message
loginEmail.addEventListener("input", () => {
  updateErrorMessage("")
})

// clear error message
loginPwd.addEventListener("input", () => {
  updateErrorMessage("")
})
