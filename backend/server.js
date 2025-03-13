require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const restaurantRoutes = require("./routes/restaurants");
const largeAreaRoutes = require("./routes/largeArea");
const middleAreaRoutes = require("./routes/middleArea");
const smallAreaRoutes = require("./routes/smallArea");
const genreRoutes = require("./routes/genre");
const budgetRoutes = require("./routes/budget");
const googleRoutes = require("./routes/google");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/google", googleRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/large_area", largeAreaRoutes);
app.use("/api/middle_area", middleAreaRoutes);
app.use("/api/small_area", smallAreaRoutes);
app.use("/api/genre", genreRoutes);
app.use("/api/budget", budgetRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});


app.listen(PORT, () => console.log(`🚀 Server listening on port: http://localhost:${PORT}`));