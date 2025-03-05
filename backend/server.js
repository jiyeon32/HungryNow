require("dotenv").config(); 

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const restaurantRoutes = require("./routes/restaurants");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




app.use(express.static(path.join(__dirname, "../frontend")));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.use("/api/restaurants", restaurantRoutes);

app.listen(PORT, () => console.log(`🚀 Server listening on port: http://localhost:${PORT}`));