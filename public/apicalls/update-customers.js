import { API_BASE_URL } from "../js/config.js";

const inputs = {
  company_name: document.getElementById("company_name"),
  email: document.getElementById("email"),
  phone: document.getElementById("phone"),
  street: document.getElementById("street"),
  city: document.getElementById("city"),
  postalCode: document.getElementById("postalCode"),
  country: document.getElementById("country"),
  tax_id: document.getElementById("tax_idx"),
  representative: document.getElementById("representative"),
};

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("updateCustomerProfile");
  const submitBtn = document.getElementById("updateCustomerButton");
  const isActiveInput = document.getElementById("isActive");
  const translations = window.translations;
  const customerId = form.dataset.id;

  // Blur validation
  Object.entries(inputs).forEach(([key, input]) => {
    input.addEventListener("blur", () => {
      const val = input.value.trim();
      if (!val && key !== "tax_id" && key !== "representative") {
        showError(
          input,
          translations[`${key}_required`] || translations.field_required
        );
      }
    });
  });

  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", () => removeError(input));
    input.addEventListener("change", () => removeError(input));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormAlert();

    let hasError = false;

    Object.entries(inputs).forEach(([key, input]) => {
      const val = input.value.trim();
      if (!val && key !== "tax_id" && key !== "representative") {
        showError(
          input,
          translations[`${key}_required`] || translations.field_required
        );
        hasError = true;
      }
    });

    if (hasError) return;

    const payload = {
      company_name: inputs.company_name.value.trim(),
      email: inputs.email.value.trim(),
      phone: inputs.phone.value.trim(),
      tax_id: inputs.tax_id.value.trim() || undefined,
      representative: inputs.representative.value.trim() || undefined,
      isActive: isActiveInput.checked,
      address: {
        street: inputs.street.value.trim(),
        postalCode: inputs.postalCode.value.trim(),
        city: inputs.city.value.trim(),
        country: inputs.country.value,
      },
    };

    submitBtn.innerText = translations.loading;
    submitBtn.disabled = true;

    try {
      const res = await axios.put(
        `${API_BASE_URL}/customers/update/${customerId}`,
        payload,
        { withCredentials: true }
      );

      if (res.data.success) {
        submitBtn.innerText = translations.saved;
        let timer = 3;
        const interval = setInterval(() => {
          showFormAlert(
            "success",
            translations.customer_updated.replace("{timer}", timer)
          );
          timer--;
          if (timer < 0) {
            clearInterval(interval);
            window.location.href = "/customers"; // or your customer list URL
          }
        }, 1000);
      } else {
        const msg = res.data.message || "server_error";
        showFormAlert("danger", translations[msg] || msg);
        submitBtn.innerText = translations.save;
        submitBtn.disabled = false;
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "server_error";
      showFormAlert("danger", translations[msg] || msg);
      submitBtn.innerText = translations.save;
      submitBtn.disabled = false;
    }
  });

  // Helpers
  function showFormAlert(
    type,
    message,
    targetButtonId = "updateCustomerButton"
  ) {
    const oldAlert = document.querySelector(".form-alert");
    if (oldAlert) oldAlert.remove();

    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} form-alert mt-3`;
    alertDiv.role = "alert";
    alertDiv.textContent = message;

    const targetButton = document.getElementById(targetButtonId);
    targetButton.parentNode.insertBefore(alertDiv, targetButton);
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

    if (input.tagName === "SELECT") {
      input.parentElement.insertAdjacentElement("beforeend", error);
    } else {
      input.insertAdjacentElement("afterend", error);
    }
  }

  function removeError(input) {
    const next = input.nextElementSibling;
    if (next?.classList.contains("text-error")) next.remove();

    if (input.tagName === "SELECT") {
      const parentErrors = input.parentElement.querySelectorAll(".text-error");
      parentErrors.forEach((el) => el.remove());
    }
  }
});
