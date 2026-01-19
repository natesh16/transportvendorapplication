const express=require("express")
const app=express()
const errorHandler = require("./middlewares/errorHandler");
const requestLogger = require("./middlewares/requestLogger");
const superAdminRoutes = require("./routes/superAdmin.routes");
const corporateRoutes = require("./routes/corporate.Routes");
const cookieParser = require("cookie-parser");
const corporateAuthRoutes = require("./routes/corporateAuth.routes");

app.use(express.json());              // ✅ parses JSON body
app.use(express.urlencoded({ extended: true })); // optional but safe
app.use(cookieParser());
app.use(errorHandler);
app.use(requestLogger);

app.use("/api/vehicles", require("./routes/vehicle.routes"));

app.use("/api/corpo/",corporateAuthRoutes)
app.use(require("./middlewares/errorHandler"));
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/super-admin/coporate/",corporateRoutes);

app.use(errorHandler);

module.exports = app;
