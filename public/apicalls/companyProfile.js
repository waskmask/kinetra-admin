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
  vat_id: document.getElementById("vat_id"),

  bank_name: document.getElementById("bank_name"),
  iban: document.getElementById("iban"),
  bic_swift: document.getElementById("bic_swift"),
};

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("createCompanyProfile");
  const imageInput = document.getElementById("logo");
  const toggleImage = document.getElementById("toggleLogoImage");
  const formImageDiv = form.querySelector(".form-image");
  const customImgInput = form.querySelector(".custom-img-input");
  const imagePreview = formImageDiv.querySelector("img");
  const removeImageBtn = formImageDiv.querySelector(".btn-removeImg");
  const submitBtn = document.getElementById("addCompanyButton");
  const translations = window.translations;

  // 🔍 Blur Validation
  Object.entries(inputs).forEach(([key, input]) => {
    input.addEventListener("blur", () => {
      const val = input.value.trim();

      // Only one of tax_id or vat_id is required
      if (
        (key === "tax_id" || key === "vat_id") &&
        !inputs.tax_id.value.trim() &&
        !inputs.vat_id.value.trim()
      ) {
        showError(inputs.tax_id, translations.tax_or_vat_required);
        showError(inputs.vat_id, translations.tax_or_vat_required);
      } else if (!val && key !== "tax_id" && key !== "vat_id") {
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

  imageInput.addEventListener("input", () => removeError(imageInput));
  imageInput.addEventListener("change", () => removeError(imageInput));

  toggleImage.addEventListener("click", () => imageInput.click());

  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    removeError(imageInput);

    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        showError(imageInput, translations.image_validation);
        imageInput.value = "";
        return;
      }

      const maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
        showError(
          imageInput,
          translations.image_size_limit || "Image size must be less than 1MB"
        );
        imageInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        imagePreview.src = event.target.result;
        customImgInput.parentElement.classList.add("d-none");
        formImageDiv.classList.remove("d-none");
      };
      reader.readAsDataURL(file);
    }
  });

  removeImageBtn.addEventListener("click", () => {
    imageInput.value = "";
    imagePreview.src = "";
    formImageDiv.classList.add("d-none");
    customImgInput.parentElement.classList.remove("d-none");
    removeError(imageInput);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormAlert();

    let hasError = false;
    const hasTax = inputs.tax_id.value.trim();
    const hasVat = inputs.vat_id.value.trim();

    Object.entries(inputs).forEach(([key, input]) => {
      const val = input.value.trim();

      if ((key === "tax_id" || key === "vat_id") && !hasTax && !hasVat) {
        if (!hasTax) showError(inputs.tax_id, translations.tax_or_vat_required);
        if (!hasVat) showError(inputs.vat_id, translations.tax_or_vat_required);
        hasError = true;
      } else if (!val && key !== "tax_id" && key !== "vat_id") {
        showError(
          input,
          translations[`${key}_required`] || translations.field_required
        );
        hasError = true;
      }
    });

    if (hasError) return;

    const formData = new FormData();
    formData.append("company_name", inputs.company_name.value);
    formData.append("email", inputs.email.value);
    formData.append("phone", inputs.phone.value);
    formData.append("fax", document.getElementById("fax").value);
    formData.append("registry", document.getElementById("registry").value);
    formData.append(
      "registry_no",
      document.getElementById("registry_no").value
    );
    formData.append("tax_id", inputs.tax_id.value);
    formData.append("vat_id", inputs.vat_id.value);
    formData.append(
      "representative",
      document.getElementById("representative").value
    );
    formData.append("isActive", document.getElementById("isActive").checked);

    formData.append("address[street]", inputs.street.value);
    formData.append("address[postalCode]", inputs.postalCode.value);
    formData.append("address[city]", inputs.city.value);
    formData.append("address[country]", inputs.country.value);
    formData.append("bank_details[bank_name]", inputs.bank_name.value);
    formData.append("bank_details[iban]", inputs.iban.value);
    formData.append("bank_details[bic_swift]", inputs.bic_swift.value);
    formData.append(
      "bank_details[bank_address]",
      document.getElementById("bank_address").value
    );

    if (imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
    }
    submitBtn.innerText = translations.loading;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/company/profile`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        submitBtn.innerText = translations.saved;
        submitBtn.disabled = true;
        let timer = 3;

        form.reset();
        imagePreview.src = "";
        formImageDiv.classList.add("d-none");
        customImgInput.parentElement.classList.remove("d-none");
        const interval = setInterval(() => {
          showFormAlert(
            "success",
            translations.company_created_successfully.replace("{timer}", timer)
          );
          timer--;
          if (timer < 0) {
            clearInterval(interval);
            window.location.href = "/company-profile";
          }
        }, 1000);
      } else {
        const msg = res.data.message || "server_error";
        showFormAlert("danger", translations[msg] || msg);
        submitBtn.innerText = translations.save;
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "server_error";
      showFormAlert("danger", translations[msg] || msg);
      submitBtn.innerText = translations.save;
    }
  });

  // 🧠 Helpers
  function showFormAlert(type, message, targetButtonId = "addCompanyButton") {
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
