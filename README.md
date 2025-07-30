# 🏠 Real Estate Property Estimate App

This is a frontend project that collects user input about a property and displays an estimated value. Currently, it uses simulated logic but is fully structured for backend integration.

---

## 🚀 Features

- Responsive property estimate form
- Collects details like:
  - State and Town
  - Property Type and Usage
  - Bedrooms, Bathrooms, Toilets, Parking Spaces
- Simulated price estimate logic
- Result shown in a styled modal popup
- Mobile-friendly navigation menu

---

## 📂 Project Structure

```
📁 project-root/
├── index.html          # Main HTML page
├── style.css           # All CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This documentation file
```

---

## 🔧 How It Works

1. User fills out the property estimate form.
2. On submission, the JavaScript:
   - Gathers form data.
   - Simulates price estimation (randomized for now).
   - Populates a result modal with the estimate.
3. The navigation menu is mobile responsive using a hamburger toggle.

---

## ⚙️ Backend Integration (To-Do)

This project is set up for easy hand-off to a backend developer.

### ➤ Target API

- **Endpoint**: `POST /estimate`
- **Content-Type**: `application/json`

### ✅ Request Format

```json
{
  "state": "Lagos",
  "town": "Lekki",
  "bathroom": "2",
  "bedroom": "3",
  "toilet": "2",
  "parkingSpace": "1",
  "usage": "Commercial",
  "type": "Duplex"
}
```

### ✅ Expected Response Format

```json
{
  "type": "Duplex",
  "address": "Lekki, Lagos",
  "price": 45000000,
  "description": "A 3-bedroom, 2-bathroom Duplex located in Lekki, Lagos, suitable for commercial use."
}
```

---

## 📍 Integration Instructions for Backend Developer

In `script.js`, locate this section inside the form `submit` event:

```js
// Replace this simulation block with an API call:
/*
fetch('https://your-backend-api/estimate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
.then(res => res.json())
.then(result => {
  modalType.textContent = result.type;
  modalAddress.textContent = result.address;
  modalPrice.textContent = `₦${result.price.toLocaleString()}`;
  modalDescription.textContent = result.description;
  modal.style.display = "flex";
});
*/
```

Uncomment and adjust the `fetch()` block with the actual backend URL when available.

---

## Check it out here: https://ifeco1don.github.io/price-predictor-ui/

---

## 🙋‍♂️ Author

**Ifeanyi Olughu**  
📍 Abakaliki, Ebonyi State, Nigeria  
📧 [ifeanyipaul48@gmail.com](mailto:ifeanyipaul48@gmail.com)  
🔗 [LinkedIn Profile](https://linkedin.com/in/ifeanyi-paul)

---
