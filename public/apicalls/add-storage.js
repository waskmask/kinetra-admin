import { API_BASE_URL } from "../js/config.js";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("addStorageForm");

  const inputs = {
    name: document.getElementById("storage_name"),
    street: document.getElementById("street_address"),
    postal: document.getElementById("postal_code"),
    city: document.getElementById("city"),
    country: document.getElementById("country"),
    users: document.getElementById("users"),
  };

  const submitBtn = document.getElementById("addStorageButton");

  const translations = window.translations;

  const translateApiError = (msg) => {
    const errorMap = {
      "Missing required fields.": translations.storage_required_fields,
      "Server error": translations.server_error,
    };
    return errorMap[msg] || translations.registration_failed;
  };

  const cleanString = (str) => str.trim().replace(/\s+/g, " ");

  // Blur validation
  Object.entries(inputs).forEach(([key, input]) => {
    if (key === "users") return; // Skip for now, validate on submit
    input.addEventListener("blur", () => {
      if (!cleanString(input.value)) {
        showError(
          input,
          translations[`${key}_required`] || translations.field_required
        );
      }
    });
  });

  // Real-time remove error
  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", () => removeError(input));
    input.addEventListener("change", () => removeError(input));
  });

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormAlert();

    const name = cleanString(inputs.name.value);
    const street_address = cleanString(inputs.street.value);
    const postal_code = cleanString(inputs.postal.value);
    const city = cleanString(inputs.city.value);
    const country = cleanString(inputs.country.value);
    const users = [...inputs.users.selectedOptions].map((opt) => opt.value);

    let hasError = false;

    if (!name)
      showError(inputs.name, translations.name_required), (hasError = true);
    if (!street_address)
      showError(inputs.street, translations.street_address_required),
        (hasError = true);
    if (!postal_code)
      showError(inputs.postal, translations.postal_code_required),
        (hasError = true);
    if (!city)
      showError(inputs.city, translations.city_required), (hasError = true);
    if (!country)
      showError(inputs.country, translations.country_required),
        (hasError = true);
    if (!users.length)
      showError(inputs.users, translations.users_required), (hasError = true);

    if (hasError) return;

    submitBtn.textContent = translations.loading;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/storage`,
        {
          name,
          address: { street_address, postal_code, city, country },
          users,
        },
        { withCredentials: true }
      );

      showFormAlert("success", translations.storage_created);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Server error";
      const friendly = translateApiError(msg);
      showFormAlert("danger", friendly);
    }

    submitBtn.textContent = translations.save;
  });

  // Helpers
  function showFormAlert(type, message, targetButtonId = "addStorageButton") {
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
