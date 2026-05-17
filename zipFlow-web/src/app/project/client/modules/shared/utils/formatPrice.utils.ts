export function formatPrice(price: string): string {
  let parts = price.split(" ");

  let currency = "";
  let value = "";

  // Check if the first part is a string (currency)
  if (isNaN(parseFloat(parts[0]))) {
    currency = parts[0];
    value = parts.slice(1).join(" ");
  } else {
    // If the first part is not a string, assume it's part of the value
    value = parts.join(" ");
  }

  // Reconstruct the string with value first and currency second
  return value + " " + currency;
}
