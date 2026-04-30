const express = require('express');
const cors = require('cors');

const ldtRoutes = require("./routes/ldt/ldt.routes");
const lextaleRoutes = require("./routes/lextale/lextale.routes");

const app = express();

app.use(express.json({ limit: '2mb' }));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Node.js run on Vercel!');
});

app.use('/api/ldt', ldtRoutes);
app.use('/api/lextale', lextaleRoutes);

module.exports = app;