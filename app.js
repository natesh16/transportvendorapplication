const express=require("express")
const app=express()
const errorHandler = require("./middlewares/errorHandler");
const superAdminRoutes = require("./routes/superAdmin.routes");
const cookieParser = require("cookie-parser");

app.use(express.json());              // ✅ parses JSON body
app.use(express.urlencoded({ extended: true })); // optional but safe
app.use(cookieParser());

app.use(cookieParser());

app.use("/api/vehicles", require("./routes/vehicle.routes"));
app.use(require("./middlewares/errorHandler"));
app.use("/api/super-admin", superAdminRoutes);

app.use(errorHandler);

module.exports = app;
