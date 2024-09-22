const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS to allow requests from other origins
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post('/api/verify', (req, res) => {
  try {
    const { code } = req.body;

    if (!code || code.length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid code. Code must be 6 digits long.' });
    }

    if (code[5] === '7') {
      return res.status(400).json({ success: false, message: 'Verification Error: Code ends in 7' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error, please try again later.' });
  }
});

