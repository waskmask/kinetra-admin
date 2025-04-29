import { Grid, html } from "https://unpkg.com/gridjs?module";
import { API_BASE_URL } from "../js/config.js";

new Grid({
  columns: [
    { name: "User ID" },
    {
      name: "Name",
      formatter: (cell, row) => {
        const id = row.cells?.[5]?.data;
        return html(`
          <a href="/admin-users/${id}" class="text-decoration-none fw-semibold text-primary">
            ${cell}
          </a>
        `);
      },
    },
    {
      name: "Role",
      formatter: (cell) => {
        return html(
          `<span class="role-label role-${cell.toLowerCase()}">${cell}</span>`
        );
      },
    },
    {
      name: "Status",
      formatter: (isActive) => {
        const statusText = isActive ? "Active" : "Inactive";
        const statusClass = isActive ? "active" : "inactive";
        const checkedAttr = isActive ? "checked" : "";

        return html(
          `<span class="statusText ${statusClass}">${statusText}</span>`
        );
      },
    },
    {
      name: "Created At",
      formatter: (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("de-DE", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    { name: "ID", hidden: true },
  ],
  server: {
    url: `/admin-users/grid-data?exclude=${loggedInUserId}`,
    then: (res) =>
      res.admins.map((u) => [
        u.userId,
        u.name,
        u.role,
        u.isActive,
        u.createdAt,
        u._id,
      ]),
    total: (res) => res.totalUsers,
    fetchOptions: {
      credentials: "include",
    },
  },
  pagination: {
    limit: 10,
    server: {
      url: (prev, page, limit) => {
        const url = new URL(prev, window.location.origin);
        url.searchParams.set("page", page + 1);
        url.searchParams.set("limit", limit);
        return url.toString();
      },
    },
    summary: true,
  },
  search: {
    server: {
      url: (prev, keyword) => {
        const url = new URL(prev, window.location.origin);
        url.searchParams.set("search", keyword);
        return url.toString();
      },
    },
  },
  sort: {
    server: {
      url: (prev, columns) => {
        if (!columns.length) return prev;
        const col = columns[0];
        const dir = col.direction === 1 ? "asc" : "desc";
        const colName = ["name", "role", "isActive", "createdAt"][col.index];
        const url = new URL(prev, window.location.origin);
        url.searchParams.set("order", colName);
        url.searchParams.set("dir", dir);
        return url.toString();
      },
    },
  },
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
      results: () => window.translationsresults,
    },
  },
}).render(document.getElementById("adminUsersTable"));
