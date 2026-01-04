const mongosh=require('mongoose');
const path=require('path');
const connectionDatabase=()=>{
    mongosh.connect(process.env.DB_local).then(con=>{
        console.log(`MongoDB is connected to LOCAL`)
    })
}
module.exports=connectionDatabase;