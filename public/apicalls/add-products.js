import { API_BASE_URL } from "../js/config.js";
console.log(API_BASE_URL);

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("addProduct");

  const inputs = {
    productName: document.getElementById("product_name"),
    productGrade: document.getElementById("product_grade"),
    unitType: document.getElementById("unit_type"),
    productPrice: document.getElementById("product_price"),
    origin: document.getElementById("origin"),
  };

  const submitBtn = document.getElementById("addProductButton");

  const translateApiError = (msg) => {
    const errorMap = {
      "Invalid price format": window.translations.invalid_price_format,
      "Server error": window.translations.server_error,
    };
    return errorMap[msg] || window.translations.registration_failed;
  };

  // Add on-blur validation
  inputs.productName.addEventListener("blur", () => {
    if (!inputs.productName.value.trim())
      showError(inputs.productName, translations.product_name_required);
  });

  inputs.unitType.addEventListener("blur", () => {
    if (!inputs.unitType.value)
      showError(inputs.unitType, translations.select_unit_type);
  });

  inputs.productPrice.addEventListener("blur", () => {
    if (!inputs.productPrice.value.trim())
      showError(inputs.productPrice, translations.product_price_req);
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

    const product_name = inputs.productName.value.trim();
    const product_grade = inputs.productGrade.value.trim();
    const unit_type = inputs.unitType.value;
    const product_price = inputs.productPrice.value;
    const origin = inputs.origin.value;
    const main_base = "energy_commodities";
    const category = "liquid";

    let hasError = false;

    if (!product_name)
      showError(inputs.productName, translations.product_name_required),
        (hasError = true);

    if (!unit_type)
      showError(inputs.unitType, translations.select_unit_type),
        (hasError = true);

    if (!product_price)
      showError(inputs.productPrice, translations.product_price_req),
        (hasError = true);

    if (hasError) return;

    submitBtn.textContent = translations.loading;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/products`,
        {
          product_name,
          unit_type,
          product_grade,
          product_price,
          origin,
          main_base,
          category,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        showFormAlert("success", translations.product_added);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed";
      const friendly = translateApiError(msg);
      showFormAlert("danger", friendly);
    }

    submitBtn.textContent = translations.save;
  });

  // Helpers
  function showFormAlert(type, message, targetButtonId = "addProductButton") {
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
