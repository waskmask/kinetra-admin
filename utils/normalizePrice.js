// utils/normalizePrice.js
function normalizePrice(priceInput) {
  if (typeof priceInput === "number") {
    return priceInput;
  }

  if (typeof priceInput !== "string") {
    return null;
  }

  priceInput = priceInput.trim();

  const commaCount = (priceInput.match(/,/g) || []).length;
  const dotCount = (priceInput.match(/\./g) || []).length;

  // ❗ Too many separators
  if (commaCount + dotCount > 2) {
    return null;
  }

  const commaIndex = priceInput.indexOf(",");
  const dotIndex = priceInput.indexOf(".");

  // ❗ Two dots, no commas → invalid (e.g., 1.500.2350)
  if (dotCount > 1 && commaCount === 0) {
    return null;
  }

  // ❗ Two commas, no dots → invalid (e.g., 1,500,2350)
  if (commaCount > 1 && dotCount === 0) {
    return null;
  }

  // Case 1: comma before dot → US format (remove commas)
  if (commaIndex !== -1 && dotIndex !== -1 && commaIndex < dotIndex) {
    priceInput = priceInput.replace(/,/g, "");
  }
  // Case 2: dot before comma → German/European format (remove dots, replace comma with dot)
  else if (commaIndex !== -1 && dotIndex !== -1 && dotIndex < commaIndex) {
    priceInput = priceInput.replace(/\./g, "").replace(",", ".");
  }
  // Only comma → decimal (replace comma with dot)
  else if (commaIndex !== -1 && dotIndex === -1) {
    priceInput = priceInput.replace(",", ".");
  }
  // Only dot → already correct

  const finalNumber = parseFloat(priceInput);
  return isNaN(finalNumber) ? null : finalNumber;
}

module.exports = normalizePrice;
