const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Define your backend logic here
// For simplicity, let's handle booking slots on the server

let bookedSlots = [];

app.get('/api/bookingSlots', (req, res) => {
    res.json(bookedSlots);
});

app.post('/api/bookSlot', (req, res) => {
    const selectedSlots = req.body.selectedSlots;
    // Add validation logic here if needed
    bookedSlots.push(selectedSlots);
    res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
