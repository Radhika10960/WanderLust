const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
require('dotenv').config();

main().then((res)=>{
    console.log("connection to DB succesfull");
})
.catch(err => console.log(err));
async function main() {
  await mongoose.connect(process.env.DB_URL);
}

//deleting already existing data
//adding our new sampledata
const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data =   initData.data.map((obj) => ({...obj, owner : "6885e2255e932ce981253240",}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();