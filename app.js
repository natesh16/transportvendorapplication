const express=require("express")
const app=express()
app.use(express.json());

app.use("/api/vehicles", require("./routes/vehicle.routes"));

app.use(require("./middlewares/errorHandler"));

module.exports = app;
