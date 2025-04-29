import { API_BASE_URL } from "../js/config.js";
console.log(API_BASE_URL);

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerAdmin");

  const inputs = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    role: document.getElementById("role"),
    country: document.getElementById("country"),
    password: document.getElementById("password"),
    isActive: document.getElementById("isActive"),
  };

  const submitBtn = document.getElementById("addUserButton");

  const translateApiError = (msg) => {
    const errorMap = {
      "Email already exists": window.translations.email_already_exists,
    };
    return errorMap[msg] || window.translations.registration_failed;
  };

  // Remove space on paste or typing
  inputs.password.addEventListener("keydown", (e) => {
    if (e.key === " ") e.preventDefault();
  });
  inputs.password.addEventListener("input", () => {
    inputs.password.value = inputs.password.value.replace(/\s/g, "");
    removeError(inputs.password);
  });

  // Add on-blur validation
  inputs.name.addEventListener("blur", () => {
    if (!inputs.name.value.trim())
      showError(inputs.name, translations.name_required);
  });

  inputs.email.addEventListener("blur", () => {
    const value = inputs.email.value.trim();
    if (!value) showError(inputs.email, translations.email_required);
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      showError(inputs.email, translations.error_invalid_email);
  });

  inputs.phone.addEventListener("blur", () => {
    if (!inputs.phone.value.trim())
      showError(inputs.phone, translations.phone_required);
  });

  inputs.password.addEventListener("blur", () => {
    if (!inputs.password.value.trim())
      showError(inputs.password, translations.password_required);
  });

  inputs.role.addEventListener("blur", () => {
    if (!inputs.role.value) showError(inputs.role, translations.role_required);
  });

  inputs.country.addEventListener("blur", () => {
    if (!inputs.country.value)
      showError(inputs.country, translations.country_required);
  });

  // Real-time remove error on input/change
  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", () => removeError(input));
    input.addEventListener("change", () => removeError(input));
  });

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormAlert();

    const name = inputs.name.value.trim();
    const email = inputs.email.value.trim();
    const phone = inputs.phone.value.trim();
    const role = inputs.role.value;
    const country = inputs.country.value;
    const password = inputs.password.value.replace(/\s/g, "");
    const isActive = inputs.isActive.checked;

    let hasError = false;

    if (!name)
      showError(inputs.name, translations.name_required), (hasError = true);
    if (!email)
      showError(inputs.email, translations.email_required), (hasError = true);
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      showError(inputs.email, translations.error_invalid_email),
        (hasError = true);
    if (!phone)
      showError(inputs.phone, translations.phone_required), (hasError = true);
    if (!role)
      showError(inputs.role, translations.role_required), (hasError = true);
    if (!country)
      showError(inputs.country, translations.country_required),
        (hasError = true);
    if (!password)
      showError(inputs.password, translations.password_required),
        (hasError = true);

    if (hasError) return;

    submitBtn.textContent = translations.loading;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/register`,
        { name, email, phone, password, role, country, isActive },
        { withCredentials: true }
      );

      if (res.data.success) {
        showFormAlert("success", translations.registration_success);
        setTimeout(() => (window.location.href = "/admin-users"), 1500);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed";
      const friendly = translateApiError(msg);
      showFormAlert("danger", friendly);
    }

    submitBtn.textContent = translations.save;
  });

  // Helpers
  function showFormAlert(type, message, targetButtonId = "addUserButton") {
    const oldAlert = document.querySelector(".form-alert");
    if (oldAlert) oldAlert.remove();

    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} form-alert mt-3`;
    alertDiv.role = "alert";
    alertDiv.textContent = message;

    const targetButton = document.getElementById(targetButtonId);
    targetButton.parentNode.insertBefore(alertDiv, targetButton);

    setTimeout(() => alertDiv.remove(), 5000);
  }

  function clearFormAlert() {
    const alert = document.querySelector(".form-alert");
    if (alert) alert.remove();
  }

  function showError(input, message) {
    removeError(input);
    const error = document.createElement("p");
    error.className = "fieldset-label text-error";
    error.textContent = message;
    input.insertAdjacentElement("afterend", error);
  }

  function removeError(input) {
    const next = input.nextElementSibling;
    if (next?.classList.contains("text-error")) next.remove();
  }
});
