// scripts.js

// ----------------------------
// Seat Map Generator (Fixed Layout)
// ----------------------------
const seatMapContainer = document.querySelector(".seat-map");
const selectedSeats = new Set();

function generateSeatMap(rows = 5, cols = 10) {
  seatMapContainer.innerHTML = "";
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const seat = document.createElement("div");
      const seatId = `R${r}S${c}`;
      seat.textContent = seatId;
      seat.classList.add("seat");
      seat.onclick = () => toggleSeat(seat, seatId);
      seatMapContainer.appendChild(seat);
    }
  }
}

function toggleSeat(seat, seatId) {
  if (seat.classList.contains("booked")) return;
  seat.classList.toggle("selected");
  if (selectedSeats.has(seatId)) {
    selectedSeats.delete(seatId);
  } else {
    selectedSeats.add(seatId);
  }
}

generateSeatMap();

// ----------------------------
// Find Cinemas Near User
// ----------------------------
function findCinemas() {
  const locationInput = document.getElementById("locationInput").value;
  const cinemaList = document.getElementById("cinemaList");

  const cinemas = [
    { name: "Cinema A", city: "Cape Town" },
    { name: "Cinema B", city: "Durban" },
    { name: "Cinema C", city: "Johannesburg" }
  ];

  const matches = cinemas.filter(c => c.city.toLowerCase().includes(locationInput.toLowerCase()));

  cinemaList.innerHTML = matches.length ? "" : "<p>No cinemas found in your area.</p>";
  matches.forEach(c => {
    const item = document.createElement("div");
    item.textContent = `${c.name} - ${c.city}`;
    cinemaList.appendChild(item);
  });
}

// ----------------------------
// Rewards Spinner
// ----------------------------
function spinWheel() {
  const resultContainer = document.getElementById("wheelResult");
  const discounts = [0, 5, 10, 15, 20];
  const prize = discounts[Math.floor(Math.random() * discounts.length)];
  resultContainer.innerHTML = `<p>You won a <strong>${prize}%</strong> discount on your next purchase!</p>`;
}

// ----------------------------
// Booking Form Integration
// ----------------------------
document.getElementById("bookingForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = prompt("Enter your email to receive the ticket:");
  const movie = document.getElementById("movieSelect").value;
  const cinema = document.getElementById("cinemaSelect").value;
  const time = document.getElementById("showtime").value;

  if (!email || !movie || !cinema || !time || selectedSeats.size === 0) {
    alert("Please fill in all fields and select at least one seat.");
    return;
  }

  const response = await fetch("http://localhost:3000/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      movie,
      cinema,
      seats: Array.from(selectedSeats),
      time
    })
  });

  const result = await response.json();
  if (result.success) {
    alert("Booking successful! Check your email for the ticket.");
    generateCalendarLinks(movie, time, cinema);
  } else {
    alert("Booking failed. Please try again.");
  }
});

// ----------------------------
// Calendar Integration (Google + Apple)
// ----------------------------
function generateCalendarLinks(title, time, location) {
  const start = new Date(time);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Assume 2 hours

  const pad = n => (n < 10 ? "0" + n : n);
  const formatDate = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(start)}/${formatDate(end)}&location=${encodeURIComponent(location)}&details=Your+movie+ticket+with+Movies4You`;

  const icalUrl = `http://localhost:3000/api/calendar.ics?title=${encodeURIComponent(title)}&date=${encodeURIComponent(time)}&duration=120&location=${encodeURIComponent(location)}`;

  const calendarLinks = document.createElement("div");
  calendarLinks.innerHTML = `
    <p>Add to calendar:</p>
    <a href="${googleUrl}" target="_blank">Google Calendar</a> |
    <a href="${icalUrl}">Apple Calendar (.ics)</a>
  `;

  document.getElementById("bookingForm").appendChild(calendarLinks);
}
