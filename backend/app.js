const express = require("express");
const cors = require("cors");

const ldtRoutes = require("./routes/ldt/ldt.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.use("/api/ldt", ldtRoutes);

module.exports = app;