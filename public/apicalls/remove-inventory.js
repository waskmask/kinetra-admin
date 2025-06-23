import { API_BASE_URL } from "../js/config.js";

// Interpolation helper for {{placeholders}}
const interpolate = (template, data) =>
  template.replace(/\{\{(.*?)\}\}/g, (_, key) => data[key.trim()] ?? "");

window.softDeleteInventory = async function (
  storageId,
  productId,
  inventoryId,
  quantity
) {
  console.log(
    "Confirm text:",
    interpolate(translations.messages.confirm_text, { quantity })
  );
  console.log("Quantity value:", quantity);
  const result = await Swal.fire({
    title: translations.messages.confirm_title,
    text: interpolate(translations.messages.confirm_text, { quantity }),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: translations.messages.confirm_yes,
    cancelButtonText: translations.messages.confirm_cancel,
    reverseButtons: true,
    preConfirm: async () => {
      try {
        const url = `${API_BASE_URL}/inventory/storage/${storageId}/product/${productId}/inventory/${inventoryId}`;
        const res = await axios.delete(url);

        if (res.data.success) {
          return true;
        } else {
          const key = res.data.message || "delete_failed";
          Swal.showValidationMessage(
            translations.messages[key] || translations.messages.delete_failed
          );
          return false;
        }
      } catch (error) {
        const messageKey = error?.response?.data?.message;
        Swal.showValidationMessage(
          translations.messages[messageKey] ||
            translations.messages.error_server
        );
        return false;
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  });

  if (result.isConfirmed) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: translations.messages.toast_success,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });

    setTimeout(() => location.reload(), 2200);
  }
};
