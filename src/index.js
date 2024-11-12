const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Status endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Start server
app.listen(port, () => {
    console.log(`MediaMonit server running on port ${port}`);
});
