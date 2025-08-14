import { API_BASE_URL } from "../js/config.js";
function sanitizeNumber(str) {
  if (typeof str === "string") {
    return parseFloat(str.replace(/\./g, "").replace(",", "."));
  }
  return typeof str === "number" ? str : 0;
}

const translations = window.translations;

const offerBtn = document.getElementById("createOfferBtn");
const orderBtn = document.getElementById("createOrderBtn");

const form = document.getElementById("newOfferForm");

// Save original button text
offerBtn.setAttribute("data-original", offerBtn.innerText);
orderBtn.setAttribute("data-original", orderBtn.innerText);

// Helpers
function setLoadingState(button, isLoading) {
  button.disabled = isLoading;
  button.innerText = isLoading
    ? translations.loading || "Loading..."
    : button.getAttribute("data-original");
}

function showFormAlert(type, message, targetButtonId) {
  const oldAlert = document.querySelector(".form-alert");
  if (oldAlert) oldAlert.remove();

  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} form-alert mt-3`;
  alertDiv.role = "alert";
  alertDiv.textContent = message;

  const targetButton = document.getElementById(targetButtonId);
  targetButton.parentNode.insertBefore(alertDiv, targetButton);
}

function removeErrors() {
  document.querySelectorAll(".text-error").forEach((el) => el.remove());
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

function isFutureDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(dateStr);
  return inputDate >= today;
}

// Main API Call
async function submitOrderOrOffer(orderStatus) {
  removeErrors();
  const isOffer = orderStatus === "offer";

  const button = isOffer ? offerBtn : orderBtn;
  setLoadingState(button, true);

  const companySelect = document.getElementById("companySelect");
  const customerSelect = document.getElementById("customerSelect");
  const offerDate = document.getElementById("offer_validity");
  const deliveryDate = document.getElementById("prefer_delivery_date");
  const street = document.getElementById("street")?.value.trim();
  const houseNo = document.getElementById("houseNo")?.value.trim();
  const postalCode = document.getElementById("postalCode")?.value.trim();
  const city = document.getElementById("city")?.value.trim();
  const country = document.getElementById("country")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();

  let hasError = false;

  if (!companySelect.value) {
    showError(companySelect, translations.company_required);
    hasError = true;
  }

  if (!customerSelect.value) {
    showError(customerSelect, translations.customer_required);
    hasError = true;
  }

  if (!street || !houseNo || !postalCode || !city || !country || !phone) {
    if (!street)
      showError(document.getElementById("street"), "Street is required");
    if (!houseNo)
      showError(document.getElementById("houseNo"), "House number is required");
    if (!postalCode)
      showError(
        document.getElementById("postalCode"),
        "Postal code is required"
      );
    if (!city) showError(document.getElementById("city"), "City is required");
    if (!country)
      showError(document.getElementById("country"), "Country is required");
    if (!phone)
      showError(document.getElementById("phone"), "Phone number is required");
    hasError = true;
  }

  if (!offerDate.value || !isFutureDate(offerDate.value)) {
    showError(offerDate, translations.invalid_offer_date);
    hasError = true;
  }

  if (!deliveryDate.value || !isFutureDate(deliveryDate.value)) {
    showError(deliveryDate, translations.invalid_delivery_date);
    hasError = true;
  }

  const itemRows = document.querySelectorAll("#itemTable tbody tr[data-type]");
  if (!itemRows.length) {
    showFormAlert("danger", translations.at_least_one_item_required, button.id);
    setLoadingState(button, false);
    return;
  }

  if (hasError) {
    setLoadingState(button, false);
    return;
  }

  // Gather data
  const productRow = document.querySelector("tr[data-type='product']");
  const product_id = productRow?.querySelector("[name='product_id']")?.value;
  const storage_id = productRow?.querySelector("[name='storage_id']")?.value;
  const product_price = productRow?.querySelector("[name='price']")?.value;
  const quantity_ordered =
    productRow?.querySelector("[name='quantity']")?.value;
  const product_vat = productRow?.querySelector("[name='vat']")?.value;
  const totalEl = productRow?.querySelector(".symbol")?.parentElement;
  const product_price_total = totalEl
    ? totalEl.textContent.replace(/[^\d,.-]/g, "").replace(",", ".")
    : "0";

  const additional_services = [];

  document.querySelectorAll("tr[data-type='service']").forEach((row) => {
    const name = row.querySelector("input[name='name']")?.value?.trim();
    const price = row.querySelector("input[name='price']")?.value;
    const quantity = row.querySelector("input[name='quantity']")?.value;

    const vat = row.querySelector("input[name='vat']")?.value || 0;
    const service_vat_total =
      row.querySelector("input[name='service_vat_total']")?.value || "0";

    const unit_type = row.querySelector("select[name='unit']")?.value || "pcs";

    if (name && price && quantity) {
      const total =
        row
          .querySelector(".symbol")
          ?.parentElement?.innerText?.replace(/[^\d,.-]/g, "")
          ?.replace(",", ".") || "0";

      additional_services.push({
        service_name: name,
        price: sanitizeNumber(price),
        quantity: sanitizeNumber(quantity),
        vat: sanitizeNumber(vat),
        service_vat_total: sanitizeNumber(service_vat_total),
        total: sanitizeNumber(total),
        unit_type,
      });
    }
  });
  const payload = {
    orderStatus,
    company_id: companySelect.value,
    customer_id: customerSelect.value,
    delivery_address: {
      street,
      houseNo,
      postalCode,
      city,
      country,
      phone,
    },
    offer_validity: offerDate.value,
    prefer_delivery_date: deliveryDate.value,
    currency: document.getElementById("currency").value,
    notes: document.getElementById("notes")?.value || "",
    terms_and_conditions: document.getElementById("terms")?.value || "",
    title: document.getElementById("title")?.value || "",
    product_id,
    storage_id,
    product_price: sanitizeNumber(product_price),
    product_price_total: sanitizeNumber(product_price_total),
    product_vat: sanitizeNumber(product_vat),
    product_vat_total: sanitizeNumber(
      document.getElementById("productVatTotalInput")?.value
    ),
    quantity_ordered: sanitizeNumber(quantity_ordered),
    sub_total: sanitizeNumber(document.getElementById("subTotalInput")?.value),
    vat_amount: sanitizeNumber(
      document.getElementById("vatAmountInput")?.value
    ),
    total_amount: sanitizeNumber(
      document.getElementById("totalAmountInput")?.value
    ),
    additional_services,
  };

  try {
    const res = await axios.post(`${API_BASE_URL}/orders`, payload, {
      withCredentials: true,
    });

    if (res.data.success) {
      showFormAlert(
        "success",
        translations[
          orderStatus === "offer"
            ? "offer_created_successfully"
            : "order_created_successfully"
        ] || "Success!",
        button.id
      );
      form.reset();
    } else {
      const msg = res.data.message || "server_error";
      showFormAlert("danger", translations[msg] || msg, button.id);
    }
  } catch (err) {
    const msg = err?.response?.data?.message || "server_error";
    showFormAlert("danger", translations[msg] || msg, button.id);
  } finally {
    setLoadingState(button, false);
  }
}

// Event Listeners
offerBtn.addEventListener("click", (e) => {
  e.preventDefault();
  submitOrderOrOffer("offer");
});

orderBtn.addEventListener("click", (e) => {
  e.preventDefault();
  submitOrderOrOffer("active");
});
