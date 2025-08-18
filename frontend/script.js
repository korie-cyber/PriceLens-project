// Elements will be queried after DOMContentLoaded so pages that don't include
// the form/modal (for example `about.html`) won't cause runtime errors.
let hamburger, nav, overlay;
let form, modal, closeModal;
let modalType, modalAddress, modalPrice, modalDescription;
let stateSelect, townSelect;
let submitButton = null;

// Town options
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

// Function to create and inject loading spinner styles
function injectLoadingStyles() {
  if (!document.getElementById('loadingStyles')) {
    const style = document.createElement('style');
    style.id = 'loadingStyles';
    style.textContent = `
      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .btn-loading {
        pointer-events: none;
        opacity: 0.7;
      }
      
      .pulse-loading {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: .5;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Function to show loading state
function showLoading() {
  if (submitButton) {
    submitButton.dataset.originalText = submitButton.textContent;
    const spinner = document.createElement('span');
    spinner.className = 'loading-spinner';
    submitButton.innerHTML = '';
    submitButton.appendChild(spinner);
    submitButton.appendChild(document.createTextNode('Getting Estimate...'));
    submitButton.disabled = true;
    submitButton.classList.add('btn-loading', 'pulse-loading');
    submitButton.style.cursor = 'not-allowed';
  }
}

// Function to hide loading state
function hideLoading() {
  if (submitButton) {
    const originalText = submitButton.dataset.originalText || 'Get Estimate';
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    submitButton.classList.remove('btn-loading', 'pulse-loading');
    submitButton.style.cursor = 'pointer';
  }
}

// Update town dropdown based on selected state
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

// Hamburger menu toggle
document.addEventListener("DOMContentLoaded", function() {
  injectLoadingStyles();

  // Query elements now that DOM is loaded
  hamburger = document.getElementById("hamburger");
  nav = document.getElementById("nav");
  overlay = document.getElementById("navOverlay");

  form = document.getElementById("estimateForm");
  modal = document.getElementById("resultModal");
  closeModal = document.getElementById("closeModal");

  modalType = document.getElementById("modalType");
  modalAddress = document.getElementById("modalAddress");
  modalPrice = document.getElementById("modalPrice");
  modalDescription = document.getElementById("modalDescription");

  stateSelect = document.getElementById("state");
  townSelect = document.getElementById("town");

  if (form) {
    submitButton = form.querySelector('button[type="submit"]') || form.querySelector('#submitBtn');
  }

  // Hamburger menu toggle (only if it exists)
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
    
    // Auto-close the menu when any nav link is clicked (works for anchors and cross-page links)
    try {
      const navLinks = nav.querySelectorAll('a');
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('open');
          nav.classList.remove('open');
          overlay.classList.remove('active');
        });
      });
    } catch (e) {
      // defensive: if nav doesn't support querySelectorAll for some reason, skip
    }
  }

  if (form) {
    form.addEventListener("submit", function (e) {
  e.preventDefault();

  const data = {
    state: form.state.value,
    town: form.town.value,
    bathroom: form.bathroom.value,
    bedroom: form.bedroom.value,
    toilet: form.toilet.value,
    parkingSpace: form.parkingSpace.value,
    usage: form.usage.value,
    type: form.type.value,
  };

      if (!towns[data.state].includes(data.town)) {
        alert("Invalid town selected for the chosen state.");
        return;
      }

      // Show loading state
      showLoading();

      // Real Backend Integration
      fetch("https://pricelens-project-4.onrender.com/estimate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) return response.text().then(t => { throw new Error(`${response.status} ${t}`) });
      return response.json();
    })
    .then((result) => {
      modalType.textContent = result.type;
      modalAddress.textContent = `${result.town || data.town}, ${result.state || data.state}`;
      modalPrice.textContent = `₦${result.price.toLocaleString()}`;
      modalDescription.textContent = result.description;
      modal.style.display = "flex";
    })
    .catch((error) => {
      console.error("Error:", error);
      alert(
        "Failed to get estimate. Please make sure your backend is running.",
      );
    })
      .finally(() => {
        // Always hide loading state when request completes
        hideLoading();
      });
    });
  }

  // Modal close (guarded)
  if (closeModal && modal) {
    closeModal.onclick = function () {
      modal.style.display = "none";
    };
  }

  window.onclick = function (event) {
    if (modal && event.target == modal) {
      modal.style.display = "none";
    }
  };

  if (stateSelect) {
    stateSelect.addEventListener("change", updateTownOptions);
  }

  // initialize towns dropdown if present
  updateTownOptions();
});

// Modal close
closeModal.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

stateSelect.addEventListener("change", updateTownOptions);

// Initialize everything when DOM loads
document.addEventListener("DOMContentLoaded", function() {
  injectLoadingStyles();
  updateTownOptions();
});