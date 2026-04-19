const express = require('express');
const cors = require('cors');

const ldtRoutes = require("./routes/ldt/ldt.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Node.js run on Vercel!');
});

app.use('/api/ldt', ldtRoutes);

module.exports = app;