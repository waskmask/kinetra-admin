import { API_BASE_URL } from "../js/config.js";

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("updateAdmin");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const roleInput = document.getElementById("role");
  const countryInput = document.getElementById("country");
  const submitBtn = document.getElementById("addUserButton");

  const adminId = window.adminUserId; // You must define this in your EJS page

  // Initial values to detect changes
  const original = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
    role: roleInput.value,
    country: countryInput.value,
  };

  // Error translation mapping
  const translateApiError = (msg) => {
    const map = {
      "Email already exists": window.translations.email_already_exists,
    };
    return map[msg] || window.translations.update_failed;
  };

  // Validation
  const validateField = () => {
    let hasError = false;

    if (!nameInput.value.trim()) {
      showError(nameInput, window.translations.name_required);
      hasError = true;
    }

    if (!emailInput.value.trim()) {
      showError(emailInput, window.translations.email_required);
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      showError(emailInput, window.translations.error_invalid_email);
      hasError = true;
    }

    if (!phoneInput.value.trim()) {
      showError(phoneInput, window.translations.phone_required);
      hasError = true;
    }

    if (!roleInput.value) {
      showError(roleInput, window.translations.role_required);
      hasError = true;
    }

    if (!countryInput.value) {
      showError(countryInput, window.translations.country_required);
      hasError = true;
    }

    return !hasError;
  };

  // Remove error on input/select change
  [nameInput, emailInput, phoneInput, roleInput, countryInput].forEach(
    (input) => {
      input.addEventListener("input", () => removeError(input));
      input.addEventListener("change", () => removeError(input));
      input.addEventListener("blur", () => removeError(input));
    }
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateField()) return;

    const updated = {};
    if (nameInput.value.trim() !== original.name)
      updated.name = nameInput.value.trim();
    if (emailInput.value.trim() !== original.email)
      updated.email = emailInput.value.trim();
    if (phoneInput.value.trim() !== original.phone)
      updated.phone = phoneInput.value.trim();
    if (roleInput.value !== original.role) updated.role = roleInput.value;
    if (countryInput.value !== original.country)
      updated.country = countryInput.value;

    if (Object.keys(updated).length === 0) {
      showFormAlert("info", window.translations.no_changes);
      return;
    }

    submitBtn.textContent = window.translations.loading;

    try {
      const res = await axios.patch(
        `${API_BASE_URL}/admin-users/update/${adminId}`,
        updated,
        { withCredentials: true }
      );

      submitBtn.disabled = true;

      if (res.data.success) {
        showFormAlert("success", window.translations.update_success);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showFormAlert("danger", translateApiError(res.data.message));
        submitBtn.disabled = false;
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Update failed";
      showFormAlert("danger", translateApiError(msg));
      submitBtn.disabled = false;
    }

    submitBtn.textContent = window.translations.updated;
  });

  // Toggle isActive status
  const statusCheckbox = document.getElementById(adminId);

  const toastElement = document.getElementById("statusToast");
  const toastMessage = document.getElementById("toastMessage");

  if (statusCheckbox) {
    statusCheckbox.addEventListener("change", async (e) => {
      const isChecked = e.target.checked;

      try {
        const res = await axios.patch(
          `${API_BASE_URL}/admin-users/update/${adminId}`,
          { isActive: isChecked },
          { withCredentials: true }
        );

        if (res.data.success) {
          showToast(
            "success",
            window.translations.status_updated || "Status updated"
          );
          setTimeout(() => window.location.reload(), 2500);
        }
      } catch (err) {
        e.target.checked = !isChecked; // revert back
        showToast(
          "danger",
          window.translations.update_failed || "Update failed"
        );
      }
    });
  }

  function showToast(type, message) {
    const toast = new bootstrap.Toast(toastElement);
    toastElement.classList.remove("text-bg-success", "text-bg-danger");
    toastElement.classList.add(`text-bg-${type}`);
    toastMessage.textContent = message;
    toast.show();

    setTimeout(() => {
      toast.hide();
    }, 2000);
  }

  // Change Password Logic
  const changePassForm = document.getElementById("changeAdminPassword");
  const passwordInput = document.getElementById("newPassword");
  const changeBtn = document.getElementById("chanePasswordButton");

  // Prevent spaces in password
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === " ") e.preventDefault();
  });

  // Remove error on input/change
  passwordInput.addEventListener("input", () => removeError(passwordInput));
  passwordInput.addEventListener("blur", () => removeError(passwordInput));

  // Submit handler
  changePassForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = passwordInput.value.trim();

    if (!newPassword) {
      showError(
        passwordInput,
        window.translations.password_required || "Password is required"
      );
      return;
    }

    if (/\s/.test(newPassword)) {
      showError(
        passwordInput,
        window.translations.no_spaces_allowed ||
          "Password cannot contain spaces"
      );
      return;
    }

    changeBtn.textContent = window.translations.loading || "Saving...";
    changeBtn.disabled = true;

    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/change-password`,
        {
          userId: adminId,
          newPassword,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        showFormAlert(
          "success",
          window.translations.password_changed || res.data.message,
          changeBtn
        );

        setTimeout(() => window.location.reload(), 2000);
      } else {
        showFormAlert(
          "danger",
          res.data.message || window.translations.update_failed,
          changeBtn
        );

        changeBtn.disabled = false;
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Update failed";
      showFormAlert(
        "danger",
        res.data.message || window.translations.update_failed,
        changeBtn
      );

      changeBtn.disabled = false;
    }

    changeBtn.textContent = window.translations.updated || "Updated";
  });

  function showFormAlert(type, message, targetBtn = submitBtn) {
    const oldAlert = document.querySelector(".form-alert");
    if (oldAlert) oldAlert.remove();

    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} form-alert mt-3`;
    alertDiv.role = "alert";
    alertDiv.textContent = message;

    targetBtn.parentNode.insertBefore(alertDiv, targetBtn);

    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
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
