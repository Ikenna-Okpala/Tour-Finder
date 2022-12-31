const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });

process.on("unhandledRejection", error => {
    //central place to handle all promise reqjections
    //console.log(error.name, error.message)
    //console.log("UNHANDLED REJECTION!!!! Shutting down....")
    process.exit(1)

})

process.on("uncaughtException", error => {
    //console.log(error.name, error.message)
    // console.log("UNHANDLED REJECTION!!!! Shutting down....")
    process.exit(1)
})
const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
}).then(() => {
    //console.log("DB connection successful")
})



const app = require('./app');

//set by express
// console.log(process.env)
const port = process.env.PORT || 3000;
//server automaticaly starts when data is written
const server = app.listen(port, () => {

    // console.log(`App running on port: ${port}...`)

});

//close down server in terms of this errors
