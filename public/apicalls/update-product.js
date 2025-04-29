import { API_BASE_URL } from "../js/config.js";

document.addEventListener("DOMContentLoaded", function () {
  const updateProductForm = document.getElementById("updateProductForm");
  const updateProductButton = document.getElementById("updateProductButton");
  const updatePriceForm = document.getElementById("updatePriceForm");
  const updatePriceButton = document.getElementById("updatePriceButton");

  const productId = window.productId; // Set this in EJS

  // Inputs
  const inputs = {
    productName: document.getElementById("product_name"),
    productGrade: document.getElementById("product_grade"),
    unitType: document.getElementById("unit_type"),
    origin: document.getElementById("origin"),
    category: document.getElementById("category"),
    isActive: document.getElementById("isActiveCheckbox"),
    newPrice: document.getElementById("new_price"),
  };

  // --- Store original values to detect changes ---
  const original = {
    productName: inputs.productName?.value.trim(),
    productGrade: inputs.productGrade?.value.trim(),
    unitType: inputs.unitType?.value,
    origin: inputs.origin?.value,
    category: inputs.category?.value,
    isActive: inputs.isActive?.checked,
  };

  // Helpers
  function showFormAlert(type, message, targetButtonId) {
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

  // --- Add on-blur validation ---
  if (updateProductForm) {
    inputs.productName.addEventListener("blur", () => {
      if (!inputs.productName.value.trim()) {
        showError(inputs.productName, translations.product_name_required);
      }
    });
    inputs.unitType.addEventListener("blur", () => {
      if (!inputs.unitType.value) {
        showError(inputs.unitType, translations.select_unit_type);
      }
    });
    Object.values(inputs).forEach((input) => {
      if (input) {
        input.addEventListener("input", () => removeError(input));
        input.addEventListener("change", () => removeError(input));
      }
    });
  }

  // --- Submit updateProductForm ---
  if (updateProductForm) {
    updateProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFormAlert();

      let hasError = false;

      if (!inputs.productName.value.trim()) {
        showError(inputs.productName, translations.product_name_required);
        hasError = true;
      }
      if (!inputs.unitType.value) {
        showError(inputs.unitType, translations.select_unit_type);
        hasError = true;
      }

      if (hasError) return;

      // --- Prepare updated fields ---
      const updated = {};
      if (inputs.productName.value.trim() !== original.productName)
        updated.product_name = inputs.productName.value.trim();
      if (inputs.productGrade.value.trim() !== original.productGrade)
        updated.product_grade = inputs.productGrade.value.trim();
      if (inputs.unitType.value !== original.unitType)
        updated.unit_type = inputs.unitType.value;
      if (inputs.origin.value !== original.origin)
        updated.origin = inputs.origin.value;
      if (inputs.category.value !== original.category)
        updated.category = inputs.category.value;
      if (inputs.isActive.checked !== original.isActive)
        updated.isActive = inputs.isActive.checked;

      if (Object.keys(updated).length === 0) {
        showFormAlert(
          "info",
          window.translations.no_changes,
          "updateProductButton"
        );
        return;
      }

      updateProductButton.textContent = translations.loading;

      try {
        const res = await axios.patch(
          `${API_BASE_URL}/products/${productId}`,
          updated,
          { withCredentials: true }
        );

        if (res.data.success) {
          showFormAlert(
            "success",
            translations.product_updated,
            "updateProductButton"
          );
          updateProductButton.textContent = translations.updated;
          updateProductButton.disabled = true;
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (err) {
        const msg = err?.response?.data?.message || "Update failed";
        showFormAlert("danger", msg, "updateProductButton");
      }

      updateProductButton.textContent = translations.update;
    });
  }

  // --- Submit updatePriceForm ---
  if (updatePriceForm) {
    updatePriceForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFormAlert();

      const newPrice = inputs.newPrice?.value.trim();

      if (!newPrice) {
        showError(inputs.newPrice, translations.product_price_req);
        return;
      }

      updatePriceButton.textContent = translations.loading;

      try {
        const res = await axios.patch(
          `${API_BASE_URL}/products/update-price/${productId}`,
          { new_price: newPrice },
          { withCredentials: true }
        );

        if (res.data.success) {
          showFormAlert(
            "success",
            translations.price_updated,
            "updatePriceButton"
          );
          updatePriceButton.textContent = translations.updated;
          updatePriceButton.disabled = true;
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (err) {
        const msg = err?.response?.data?.message || "Update failed";
        showFormAlert("danger", msg, "updatePriceButton");
      }

      updatePriceButton.textContent = translations.update;
    });
  }
});
