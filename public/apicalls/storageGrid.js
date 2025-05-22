import { Grid, html } from "https://unpkg.com/gridjs?module";

document.addEventListener("DOMContentLoaded", function () {
  if (!window.storages) return;

  new Grid({
    columns: [
      { name: "Storage ID" },
      {
        name: "Storage Name",
        formatter: (cell, row) => {
          const id = row.cells?.[2]?.data?._id;
          return html(`
            <a href="/storages/${id}" class="text-decoration-none fw-semibold text-primary">
              ${cell}
            </a>
          `);
        },
      },
      {
        name: "Address",
        formatter: (s) => {
          const addr = s?.address || {};
          const addressString = [
            addr.street_address,
            addr.postal_code,
            addr.city,
            addr.country,
          ]
            .filter(Boolean)
            .join(", ");

          return gridjs.html(
            `<div class="address mt-1">${addr.street_address}, ${addr.postal_code} </br>
            ${addr.city}, ${addr.country},
            </div>`
          );
        },
      },

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
    data: window.storages.map((s) => [
      s.storage_id, // 0 = ID (for link)
      s.name, // 1 = Name (link)
      s, // 2 = Address
      s.isActive, // 3 = Status
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
  }).render(document.getElementById("storageTable"));
});
