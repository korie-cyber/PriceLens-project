const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("nav");
const overlay = document.getElementById("navOverlay");

const form = document.getElementById("estimateForm");
const modal = document.getElementById("resultModal");
const closeModal = document.getElementById("closeModal");

const modalType = document.getElementById("modalType");
const modalAddress = document.getElementById("modalAddress");
const modalPrice = document.getElementById("modalPrice");
const modalDescription = document.getElementById("modalDescription");

const stateSelect = document.getElementById("state");
const townSelect = document.getElementById("town");

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

// Update town dropdown based on selected state
function updateTownOptions() {
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

  // Real Backend Integration
  fetch("https://pricelens-project-4.onrender.com", {
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
    });
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
document.addEventListener("DOMContentLoaded", updateTownOptions);
