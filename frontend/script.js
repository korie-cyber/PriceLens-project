// Elements are queried after DOMContentLoaded so pages without
// the form/modal (e.g. about.html) don't cause runtime errors.
let hamburger, nav, overlay;
let form, modal, closeModal;
let modalPrice, modalRange, modalType, modalAddressText, modalDescription, modalNote;
let stateSelect, townSelect;
let submitButton = null;

// Town options per state
const towns = {
  Lagos: [
    "Lekki",
    "Ajah",
    "Victoria Island (Vi)",
    "Magodo",
    "Ifako-Ijaiye",
    "Agege",
    "Ikeja",
    "Isheri North",
    "Isheri",
    "Ikoyi",
    "Ibeju Lekki",
    "Ejigbo",
    "Ojodu",
    "Shomolu",
    "Ogudu",
    "Isolo",
    "Ikorodu",
    "Ikotun",
    "Surulere",
    "Maryland",
    "Ipaja",
    "Gbagada",
    "Yaba",
    "Alimosho",
    "Kosofe",
    "Ayobo",
    "Ilupeju",
    "Ketu",
    "Ojo",
    "Amuwo Odofin",
    "Ijede",
    "Oshodi",
    "Epe",
    "Mushin",
    "Oke-Odo",
    "Egbe",
    "Idimu",
    "Orile",
    "Badagry",
    "Ijaiye",
    "Apapa",
    "Lagos Island",
    "Agbara-Igbesa",
    "Ibeju",
  ],
  Abuja: [
    "Lokogoma District",
    "Katampe",
    "Kaura",
    "Galadimawa",
    "Gwarinpa",
    "Lugbe District",
    "Jahi",
    "Orozo",
    "Idu Industrial",
    "Kuje",
    "Life Camp",
    "Dape",
    "Guzape District",
    "Gaduwa",
    "Dakwo",
    "Asokoro District",
    "Utako",
    "Kubwa",
    "Apo",
    "Wuse 2",
    "Durumi",
    "Mabushi",
    "Wuye",
    "Karsana",
    "Wuse",
    "Kurudu",
    "Karmo",
    "Maitama District",
    "Kukwaba",
    "Mbora (Nbora)",
    "Jabi",
    "Karshi",
    "Gudu",
    "Kado",
    "Kyami",
    "Garki",
    "Karu",
    "Kafe",
    "Dakibiyu",
    "Bwari",
    "Kagini",
    "Diplomatic Zones",
    "Kabusa",
    "Dei-Dei",
    "Gwagwalada",
    "Duboyi",
    "Central Business District",
    "Wumba",
    "Mpape",
    "Mararaba",
  ],
};

Object.keys(towns).forEach((state) => {
  towns[state].sort((a, b) => a.localeCompare(b));
});

function updateTownOptions() {
  if (!stateSelect || !townSelect) return;
  const selectedState = stateSelect.value;
  const options = towns[selectedState] || [];
  townSelect.innerHTML = '<option value="">Select a town</option>';
  options.forEach((town) => {
    const option = document.createElement("option");
    option.value = town;
    option.textContent = town;
    townSelect.appendChild(option);
  });
}

function showLoading() {
  if (!submitButton) return;
  submitButton.dataset.originalText = submitButton.textContent;
  const spinner = document.createElement("span");
  spinner.className = "loading-spinner";
  submitButton.innerHTML = "";
  submitButton.appendChild(spinner);
  submitButton.appendChild(document.createTextNode("Getting Estimate…"));
  submitButton.disabled = true;
  submitButton.classList.add("btn-loading");
}

function hideLoading() {
  if (!submitButton) return;
  submitButton.textContent = submitButton.dataset.originalText || "Get Estimate";
  submitButton.disabled = false;
  submitButton.classList.remove("btn-loading");
}

function formatNaira(amount) {
  return "₦" + Math.round(amount).toLocaleString("en-NG");
}

function openModal() {
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModalFn() {
  modal.style.display = "none";
  document.body.style.overflow = "";
}

document.addEventListener("DOMContentLoaded", function () {
  hamburger = document.getElementById("hamburger");
  nav = document.getElementById("nav");
  overlay = document.getElementById("navOverlay");

  form = document.getElementById("estimateForm");
  modal = document.getElementById("resultModal");
  closeModal = document.getElementById("closeModal");

  modalPrice = document.getElementById("modalPrice");
  modalRange = document.getElementById("modalRange");
  modalType = document.getElementById("modalType");
  modalAddressText = document.getElementById("modalAddressText");
  modalDescription = document.getElementById("modalDescription");
  modalNote = document.getElementById("modalNote");

  stateSelect = document.getElementById("state");
  townSelect = document.getElementById("town");

  if (form) {
    submitButton = document.getElementById("submitBtn") || form.querySelector('button[type="submit"]');
  }

  // Hamburger menu
  if (hamburger && nav && overlay) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      nav.classList.toggle("open");
      overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", () => {
      hamburger.classList.remove("open");
      nav.classList.remove("open");
      overlay.classList.remove("active");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        nav.classList.remove("open");
        overlay.classList.remove("active");
      });
    });
  }

  // Town dropdown
  if (stateSelect) {
    stateSelect.addEventListener("change", updateTownOptions);
  }
  updateTownOptions();

  // Form submit
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const bedroom = parseInt(form.bedroom.value, 10);
      const bathroom = parseInt(form.bathroom.value, 10);
      const toilet = parseInt(form.toilet.value, 10);
      const parkingSpace = parseInt(form.parkingSpace.value, 10);

      if (bedroom < 1 || bedroom > 10) {
        alert("Please enter a number of bedrooms between 1 and 10.");
        return;
      }
      if (bathroom < 1 || bathroom > 10) {
        alert("Please enter a number of bathrooms between 1 and 10.");
        return;
      }
      if (toilet < 1 || toilet > 10) {
        alert("Please enter a number of toilets between 1 and 10.");
        return;
      }
      if (parkingSpace < 0 || parkingSpace > 10) {
        alert("Please enter parking spaces between 0 and 10.");
        return;
      }

      const data = {
        state: form.state.value,
        town: form.town.value,
        bathroom,
        bedroom,
        toilet,
        parkingSpace,
        usage: form.usage.value,
        type: form.type.value,
      };

      if (!data.town || !towns[data.state]?.includes(data.town)) {
        alert("Please select a valid town for the chosen state.");
        return;
      }

      showLoading();

      fetch("https://pricelens-project-4.onrender.com/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) return response.text().then((t) => { throw new Error(`${response.status} ${t}`); });
          return response.json();
        })
        .then((result) => {
          modalPrice.textContent = formatNaira(result.price);

          if (result.price_low && result.price_high) {
            modalRange.textContent = `Range: ${formatNaira(result.price_low)} – ${formatNaira(result.price_high)}`;
          } else {
            modalRange.textContent = "";
          }

          modalType.textContent = result.type || data.type;
          modalAddressText.textContent = `${result.town || data.town}, ${result.state || data.state}`;
          modalDescription.textContent = result.description || "";
          modalNote.textContent = result.data_note || "";

          openModal();
        })
        .catch((error) => {
          console.error("Estimate error:", error);
          alert("Failed to get estimate. Please check your connection or try again later.");
        })
        .finally(hideLoading);
    });
  }

  // Modal close
  if (closeModal) {
    closeModal.addEventListener("click", closeModalFn);
  }

  window.addEventListener("click", (e) => {
    if (modal && e.target === modal) closeModalFn();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.style.display !== "none") closeModalFn();
  });
});
