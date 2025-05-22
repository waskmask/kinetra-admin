import { API_BASE_URL } from "../js/config.js";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("createCompanyProfile");
  const imageInput = document.getElementById("logo");
  const toggleImage = document.getElementById("toggleLogoImage");
  const formImageDiv = form.querySelector(".form-image");
  const customImgInput = form.querySelector(".custom-img-input");
  const imagePreview = formImageDiv.querySelector("img");
  const removeImageBtn = formImageDiv.querySelector(".btn-removeImg");
  const submitBtn = document.getElementById("addUserButton");
  const translations = window.translations;

  const inputs = {
    company_name: document.getElementById("company_name"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    fax: document.getElementById("fax"),
    registry: document.getElementById("registry"),
    registry_no: document.getElementById("registry_no"),
    tax_id: document.getElementById("tax_idx"),
    vat_id: document.getElementById("vat_id"),
    representative: document.getElementById("representative"),
    street: document.getElementById("street"),
    city: document.getElementById("city"),
    postalCode: document.getElementById("postalCode"),
    country: document.getElementById("country"),
  };

  const cleanString = (str) => str.trim().replace(/\s+/g, " ");

  // 🌟 Blur validation
  Object.entries(inputs).forEach(([key, input]) => {
    if (["fax", "representative", "registry"].includes(key)) return;
    input.addEventListener("blur", () => {
      if (!cleanString(input.value)) {
        showError(
          input,
          translations[`${key}_required`] || translations.field_required
        );
      }
    });
  });

  // ✅ Remove error in real time
  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", () => removeError(input));
    input.addEventListener("change", () => removeError(input));
  });

  // 🖼️ Image handling
  toggleImage.addEventListener("click", () => imageInput.click());

  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 1 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        showError(imageInput, "Only JPEG, PNG, or WEBP allowed");
        imageInput.value = "";
        return;
      }

      if (file.size > maxSize) {
        showError(imageInput, "Image size must be less than 1MB");
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
  });

  // 🧾 Form Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormAlert();

    let hasError = false;

    // 🌐 Required field check
    [
      "company_name",
      "email",
      "phone",
      "street",
      "city",
      "postalCode",
      "country",
    ].forEach((key) => {
      if (!cleanString(inputs[key].value)) {
        showError(
          inputs[key],
          translations[`${key}_required`] || translations.field_required
        );
        hasError = true;
      }
    });

    // ❗ Tax ID or VAT ID required
    const taxId = cleanString(inputs.tax_id.value);
    const vatId = cleanString(inputs.vat_id.value);
    if (!taxId && !vatId) {
      showError(inputs.tax_id, translations.tax_or_vat_required);
      showError(inputs.vat_id, translations.tax_or_vat_required);
      hasError = true;
    }

    if (hasError) return;

    submitBtn.textContent = translations.loading;

    const formData = new FormData();
    formData.append("company_name", cleanString(inputs.company_name.value));
    formData.append("email", cleanString(inputs.email.value));
    formData.append("phone", cleanString(inputs.phone.value));
    formData.append("fax", cleanString(inputs.fax.value));
    formData.append("registry", cleanString(inputs.registry.value));
    formData.append("registry_no", cleanString(inputs.registry_no.value));
    formData.append("tax_id", taxId);
    formData.append("vat_id", vatId);
    formData.append("representative", cleanString(inputs.representative.value));
    formData.append("isActive", document.getElementById("isActive").checked);

    formData.append("address[street]", cleanString(inputs.street.value));
    formData.append(
      "address[postalCode]",
      cleanString(inputs.postalCode.value)
    );
    formData.append("address[city]", cleanString(inputs.city.value));
    formData.append("address[country]", cleanString(inputs.country.value));

    if (imageInput.files[0]) {
      formData.append("image", imageInput.files[0]);
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/company/profile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      const msg = res.data.message;
      showFormAlert("success", translations[msg] || msg);
      form.reset();
      imagePreview.src = "";
      formImageDiv.classList.add("d-none");
      customImgInput.parentElement.classList.remove("d-none");
    } catch (err) {
      const msg = err?.response?.data?.message || "server_error";
      showFormAlert("danger", translations[msg] || msg);
    }

    submitBtn.textContent = translations.save;
  });

  // ✅ Helpers
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
