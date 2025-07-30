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

  // ========================
  // BACKEND INTEGRATION HERE
  // ========================
  // Replace the simulation below with a real API call
  // Example using fetch:
  /*
  fetch('https://your-backend-api/estimate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(result => {
      modalType.textContent = result.type;
      modalAddress.textContent = result.address;
      modalPrice.textContent = `₦${result.price.toLocaleString()}`;
      modalDescription.textContent = result.description;
      modal.style.display = "flex";
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to get estimate. Please try again later.');
    });
  */

  // ================
  // SIMULATED RESULT
  // ================
  const result = {
    type: data.type,
    address: `${data.town}, ${data.state}`,
    price: Math.floor(Math.random() * 100000000) + 5000000, // Simulated price
    description: `A ${data.bedroom}-bedroom, ${data.bathroom}-bathroom ${data.type} located in ${data.town}, ${data.state}, suitable for ${data.usage.toLowerCase()}. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae dicta nemo aspernatur voluptates, officiis est maxime odit quas autem consectetur dolor.`,
  };

  modalType.textContent = result.type;
  modalAddress.textContent = result.address;
  modalPrice.textContent = `₦${result.price.toLocaleString()}`;
  modalDescription.textContent = result.description;
  modal.style.display = "flex";
});

closeModal.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
