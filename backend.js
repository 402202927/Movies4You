// backend.js (Node.js with Express)

const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Dummy in-memory DB
const bookings = [];

// PDF ticket generation
function generatePDFTicket(booking) {
  const doc = new PDFDocument();
  const fileName = `ticket-${booking.id}.pdf`;
  const path = `./tickets/${fileName}`;

  if (!fs.existsSync("./tickets")) fs.mkdirSync("./tickets");
  doc.pipe(fs.createWriteStream(path));

  doc.fontSize(25).text("Movies4You - Ticket", { align: "center" });
  doc.moveDown();
  doc.fontSize(16).text(`Booking ID: ${booking.id}`);
  doc.text(`Movie: ${booking.movie}`);
  doc.text(`Cinema: ${booking.cinema}`);
  doc.text(`Seats: ${booking.seats.join(", ")}`);
  doc.text(`Time: ${booking.time}`);

  doc.end();
  return path;
}

// Email ticket
async function sendTicketEmail(email, pdfPath) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your_email@gmail.com",
      pass: "your_email_password_or_app_password"
    }
  });

  await transporter.sendMail({
    from: "Movies4You <your_email@gmail.com>",
    to: email,
    subject: "Your Movie Ticket - Movies4You",
    text: "Attached is your movie ticket. Enjoy!",
    attachments: [{ path: pdfPath }]
  });
}

// Book ticket endpoint
app.post("/api/book", async (req, res) => {
  const { email, movie, cinema, seats, time } = req.body;
  const id = bookings.length + 1;
  const booking = { id, email, movie, cinema, seats, time };
  bookings.push(booking);

  const pdfPath = generatePDFTicket(booking);
  await sendTicketEmail(email, pdfPath);

  res.json({ success: true, bookingId: id });
});

// Calendar integration endpoint
app.get("/api/calendar.ics", (req, res) => {
  const { title, date, duration, location } = req.query;
  const start = new Date(date);
  const end = new Date(start.getTime() + (duration * 60 * 1000));

  const formatDate = d => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${title}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
LOCATION:${location}
DESCRIPTION:Enjoy your movie at Movies4You
END:VEVENT
END:VCALENDAR`;

  res.setHeader("Content-Disposition", "attachment; filename=movie-booking.ics");
  res.setHeader("Content-Type", "text/calendar");
  res.send(ics);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
