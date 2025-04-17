import { API_BASE_URL } from "../js/config.js";
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("loginButton");
  function translateApiError(apiMessage) {
    const errorMap = {
      "Incorrect password": window.translations.incorrect_password,
      "User not found": window.translations.user_not_found,
      "Account is inactive": window.translations.inactive_account,
    };

    return errorMap[apiMessage] || window.translations.login_failed;
  }

  // Prevent spaces in password field
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === " ") e.preventDefault();
  });

  // Email format validation on blur
  emailInput.addEventListener("blur", () => {
    removeError(emailInput);
    const email = emailInput.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      showError(emailInput, translations.error_invalid_email);
    }
  });

  // Remove error on input for both fields
  [emailInput, passwordInput].forEach((input) => {
    input.addEventListener("input", () => {
      removeError(input);
    });
    input.addEventListener("blur", () => {
      removeError(input);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Basic validation
    let hasError = false;

    if (!email) {
      showError(emailInput, translations.email_required);
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError(emailInput, translations.error_invalid_email);
      hasError = true;
    }

    if (!password) {
      showError(passwordInput, translations.password_required);
      hasError = true;
    }

    if (hasError) return; // ❌ Skip API call if there's any error
    loginButton.textContent = translations.loading;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );
      console.log("🔍 Response from login API:", res.data);

      if (res.data.success) {
        console.log("✅ Login successful, redirecting...");
        window.location.href = "/dashboard";
      } else {
        const friendlyMessage = translateApiError(res.data.message);
        showRelevantError(friendlyMessage);
        loginButton.textContent = translations.login;
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Login failed";
      showRelevantError(msg);
      loginButton.textContent = translations.login;
    }
  });

  function showRelevantError(message) {
    if (message === "User not found") {
      showError(emailInput, translateApiError(message));
    } else if (message === "Incorrect password") {
      showError(passwordInput, translateApiError(message));
    } else if (message === "Account is inactive") {
      showError(emailInput, translateApiError(message));
    }
  }

  function showError(input, message) {
    removeError(input);
    const errorTag = document.createElement("p");
    errorTag.className = "fieldset-label text-error";
    errorTag.innerText = message;
    input.insertAdjacentElement("afterend", errorTag);
  }

  function removeError(input) {
    const next = input.nextElementSibling;
    if (next?.classList.contains("text-error")) {
      next.remove();
    }
  }
});
