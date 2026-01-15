const app= require("./app");
const dotenv=require('dotenv')
const path=require('path')
const dbConnection=require('./config/dbconnection');
dotenv.config({path:path.join(__dirname,"config/config.env")})
dbConnection()

process.on("unhandledRejection", err => {
  console.error("UNHANDLED REJECTION 💥", err);
  process.exit(1);
});

process.on("uncaughtException", err => {
  console.error("UNCAUGHT EXCEPTION 💥", err);
  process.exit(1);
});

const server=app.listen(process.env.PORT,()=>{
    console.log(`Server lisiting to the port ${process.env.PORT} in ${process.env.NODE_ENV}`)
})