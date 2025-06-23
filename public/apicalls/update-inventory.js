// public/js/add-inventory.js
import { API_BASE_URL } from "../js/config.js";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("updateInventory");
  const storageId = form.dataset.id;

  const inputs = {
    productId: document.getElementById("products"),
    quantity: document.getElementById("quantity"),
  };

  const submitBtn = document.getElementById("addInventoryButton");

  const translateApiError = (msg) => {
    const errorMap = {
      invalid_input: translations.invalid_input,
      storage_not_found: translations.storage_not_found,
      product_not_found: translations.product_not_found,
      not_enough_stock_to_hold: translations.not_enough_stock_to_hold,
      not_enough_stock_to_remove: translations.not_enough_stock_to_remove,
      not_enough_held_stock_to_dispatch:
        translations.not_enough_held_stock_to_dispatch,
      not_enough_held_stock_to_release:
        translations.not_enough_held_stock_to_release,
    };
    return errorMap[msg] || translations.api.unknown_error;
  };

  // Prevent non-numeric input
  inputs.quantity.addEventListener("keydown", (e) => {
    if (
      !["Backspace", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key) &&
      !/\d/.test(e.key)
    ) {
      e.preventDefault();
    }
  });

  // On-blur validation
  inputs.productId.addEventListener("blur", () => {
    if (!inputs.productId.value)
      showError(inputs.productId, translations.select_product);
  });

  inputs.quantity.addEventListener("blur", () => {
    if (!inputs.quantity.value.trim())
      showError(inputs.quantity, translations.quantity_required);
  });

  // Real-time remove error on input/change
  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", () => removeError(input));
    input.addEventListener("change", () => removeError(input));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormAlert();

    const product_id = inputs.productId.value;
    const quantity = parseInt(inputs.quantity.value, 10);
    const action = "added";

    let hasError = false;

    if (!product_id) {
      showError(inputs.productId, translations.select_product);
      hasError = true;
    }

    if (!quantity || quantity <= 0) {
      showError(inputs.quantity, translations.quantity_required);
      hasError = true;
    }

    if (hasError) return;

    submitBtn.textContent = translations.loading;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/inventory/storage/${storageId}/add-inventory`,
        {
          product_id,
          quantity,
          action,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        showFormAlert("success", translations.inventory_added);
        alert();
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "unknown_error";
      const friendly = translateApiError(msg);
      showFormAlert("danger", friendly);
    }

    submitBtn.textContent = translations.save;
  });

  function showFormAlert(type, message) {
    const oldAlert = document.querySelector(".form-alert");
    if (oldAlert) oldAlert.remove();

    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} form-alert mt-3`;
    alertDiv.role = "alert";
    alertDiv.textContent = message;

    submitBtn.parentNode.insertBefore(alertDiv, submitBtn);

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
