const app= require("./app");
const dotenv=require('dotenv')
const path=require('path')
const dbConnection=require('./config/dbconnection');
dotenv.config({path:path.join(__dirname,"config/config.env")})
dbConnection()
const server=app.listen(process.env.PORT,()=>{
    console.log(`Server lisiting to the port ${process.env.prod_env}`)
})