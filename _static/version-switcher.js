(function () {
  "use strict";

  if (window.__furyVersionSwitcherLoaded) {
    return;
  }
  window.__furyVersionSwitcherLoaded = true;

  function readEntries(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("The documentation version list is empty or invalid.");
    }

    return data.map(function (entry) {
      if (!entry || typeof entry.name !== "string" || !entry.name.trim() ||
          typeof entry.version !== "string" || !entry.version.trim() ||
          typeof entry.url !== "string") {
        throw new Error("Invalid documentation version entry.");
      }

      var url = new URL(entry.url);
      if (url.origin !== "https://fury.gl" || url.username || url.password ||
          url.search || url.hash ||
          !/^\/(?:dev|v\d+\.\d+\.x)\/$/.test(url.pathname)) {
        throw new Error("Unsafe documentation version destination.");
      }

      return {
        name: entry.name,
        url: url.href,
        series: url.pathname.split("/")[1]
      };
    });
  }

  function hydrate(banner, entries) {
    var picker = banner.querySelector(".fury-version-banner__picker");
    var select = picker && picker.querySelector("select");
    var current = banner.querySelector(".fury-version-banner__current");
    if (!picker || !select || !current) {
      return;
    }

    var series = banner.getAttribute("data-version-series");
    var matchedIndex = entries.findIndex(function (entry) {
      return entry.series === series;
    });
    var options = document.createDocumentFragment();

    if (matchedIndex === -1) {
      var placeholder = document.createElement("option");
      placeholder.textContent = "Choose version";
      placeholder.value = "";
      placeholder.disabled = true;
      placeholder.selected = true;
      options.appendChild(placeholder);
    }

    entries.forEach(function (entry, index) {
      var option = document.createElement("option");
      option.textContent = entry.name;
      option.value = String(index);
      option.selected = index === matchedIndex;
      options.appendChild(option);
    });

    select.textContent = "";
    select.appendChild(options);
    select.addEventListener("change", function () {
      if (select.value === "") {
        return;
      }
      var entry = entries[Number(select.value)];
      if (entry) {
        window.location.assign(entry.url);
      }
    });

    if (matchedIndex !== -1) {
      current.textContent = entries[matchedIndex].name;
      // The selected option already names this release; keep the fallback label
      // only when the picker cannot identify the current archive.
      current.hidden = true;
    }
    picker.hidden = false;
  }

  function initialize() {
    var banners = document.querySelectorAll(".fury-version-banner");
    if (!banners.length) {
      return;
    }
    banners.forEach(function (banner) {
      var picker = banner.querySelector(".fury-version-banner__picker");
      if (picker) {
        picker.hidden = true;
      }
    });

    fetch("/_static/versions_switcher.json")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Unable to load documentation versions.");
        }
        return response.json();
      })
      .then(readEntries)
      .then(function (entries) {
        banners.forEach(function (banner) {
          hydrate(banner, entries);
        });
      })
      .catch(function () {
        // The static version label and Latest docs link remain usable.
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
}());
