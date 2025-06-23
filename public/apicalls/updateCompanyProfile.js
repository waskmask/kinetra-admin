import { API_BASE_URL } from "../js/config.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("updateCompanyProfile");
  const companyId = document.getElementById("companyId").value;
  const submitBtn = document.getElementById("updateCompanyButton");
  const translations = window.translations;

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

  const imageInput = document.getElementById("logo");
  const formImageDiv = document.querySelector(".form-image");
  const formImgBefore = document.querySelector(".form-img-before");
  const customImgInput = formImgBefore.querySelector(".custom-img-input");
  const imagePreview = formImageDiv?.querySelector("img");
  const removeImageBtn = formImageDiv?.querySelector(".btn-removeImg");
  const toggleImage = document.getElementById("toggleLogoImage");
  let removeLogoFlag = false;

  //signature input
  const signatureInput = document.getElementById("signature");
  const signatureImgBefore = signatureInput
    .closest(".mt-3.mb-4")
    .querySelector(".form-img-before");
  const signatureFormImageDiv = signatureInput
    .closest(".mt-3.mb-4")
    .querySelector(".form-image");
  const signaturePreview = document.getElementById("signaturePreview");
  const removeSignatureBtn = document.getElementById("removeSignatureBtn");
  const toggleSignatureImage = document.getElementById("toggleSignatureImage");
  let removeSignatureFlag = false;

  toggleSignatureImage?.addEventListener("click", () => signatureInput.click());

  toggleImage?.addEventListener("click", (e) => {
    e.stopPropagation();
    imageInput.click();
  });

  signatureInput.addEventListener("change", (e) => {
    removeError(signatureInput);
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showError(signatureInput, translations.image_validation);
      signatureInput.value = "";
      return;
    }

    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      showError(signatureInput, translations.image_size_limit);
      signatureInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      signaturePreview.src = event.target.result;
      signatureFormImageDiv.classList.remove("d-none");
      signatureImgBefore.classList.add("d-none");
    };
    document.getElementById("remove_signature").value = "false";
    reader.readAsDataURL(file);
    removeSignatureFlag = false;
  });

  removeSignatureBtn?.addEventListener("click", () => {
    signatureInput.value = "";
    signaturePreview.src = "";
    signatureFormImageDiv.classList.add("d-none");
    signatureImgBefore.classList.remove("d-none");
    document.getElementById("remove_signature").value = "true";
    removeSignatureFlag = true;
  });

  // signature logic end
  // 👇 Ensure image input opens when clicking camera icon
  // customImgInput?.addEventListener("click", () => imageInput.click());

  // 👇 Handle image preview
  imageInput.addEventListener("change", (e) => {
    removeError(imageInput);
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showError(imageInput, translations.image_validation);
      imageInput.value = "";
      return;
    }

    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      showError(imageInput, translations.image_size_limit);
      imageInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview.src = event.target.result;
      formImageDiv.classList.remove("d-none");
      formImgBefore.classList.add("d-none");
    };
    reader.readAsDataURL(file);
    removeLogoFlag = false;
  });

  // 👇 Remove image and allow re-upload
  removeImageBtn?.addEventListener("click", () => {
    imageInput.value = "";
    if (imagePreview) imagePreview.src = "";
    if (formImageDiv) formImageDiv.classList.add("d-none");
    if (formImgBefore) formImgBefore.classList.remove("d-none");
    removeError(imageInput);
    removeLogoFlag = true;
  });
  // Validate on blur
  Object.entries(inputs).forEach(([key, input]) => {
    input.addEventListener("blur", () => {
      const val = input.value.trim();
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

    input.addEventListener("input", () => removeError(input));
    input.addEventListener("change", () => removeError(input));
  });

  // Submit form
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
    formData.append("remove_logo", removeLogoFlag ? "true" : "false");
    formData.append("remove_signature", removeSignatureFlag ? "true" : "false");

    if (imageInput.files[0]) {
      formData.append("logo", imageInput.files[0]);
    }

    if (signatureInput.files[0]) {
      formData.append("signature", signatureInput.files[0]);
    }
    submitBtn.innerText = translations.loading;

    try {
      const res = await axios.patch(
        `${API_BASE_URL}/company/profile/${companyId}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        let timer = 3;
        submitBtn.disabled = true;
        const interval = setInterval(() => {
          showFormAlert(
            "success",
            translations.company_updated_successfully.replace("{timer}", timer)
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
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "server_error";
      showFormAlert("danger", translations[msg] || msg);
    } finally {
      submitBtn.innerText = translations.save;
    }
  });

  function showFormAlert(
    type,
    message,
    targetButtonId = "updateCompanyButton"
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
