import { Grid, html } from "https://unpkg.com/gridjs?module";

document.addEventListener("DOMContentLoaded", function () {
  if (!window.products) return;

  new Grid({
    columns: [
      { name: "Product ID" },
      {
        name: "Product Name",
        formatter: (cell, row) => {
          const id = row.cells?.[0]?.data; // product_id comes first
          return html(`
            <a href="/product/${id}" class="text-decoration-none fw-semibold text-primary">
              ${cell}
            </a>
          `);
        },
      },
      { name: "Product Grade" },
      {
        name: "Product Price",
        formatter: (price) => {
          return typeof price === "number"
            ? price.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 5,
              }) + " €"
            : "-";
        },
      },
      { name: "Origin" },
      {
        name: "Status",
        formatter: (isActive) => {
          const statusText = isActive ? "Active" : "Inactive";
          const statusClass = isActive ? "active" : "inactive";
          return html(
            `<span class="statusText ${statusClass}">${statusText}</span>`
          );
        },
      },
    ],
    data: window.products.map((p) => [
      p.product_id, // 0 = ID (for link)
      p.product_name, // 1 = Name (link)
      p.product_grade, // 2 = Grade
      p.product_price, // 3 = Price
      p.origin, // 4 = Origin
      p.isActive, // 5 = Status
    ]),
    pagination: {
      limit: 10,
      summary: true,
    },
    search: {
      enabled: true,
    },
    sort: true,
    className: {
      table: "table",
      th: "th",
      td: "td",
    },
    language: {
      search: {
        placeholder: window.translations.search,
      },
      pagination: {
        previous: window.translations.previous,
        next: window.translations.next,
        showing: window.translations.showing,
        results: () => window.translations.results,
      },
    },
  }).render(document.getElementById("productsTable"));
});
