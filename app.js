
const express = require("express")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")
const hpp = require("hpp")

const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")
const reviewRouter = require("./routes/reviewRoutes")

const app = express()
const AppError = require("./utils/appError")
const globalErrorHanler = require("./controllers/errorController")

//step request goes thrugh while its being processed -- middleware
// use -> add middlewaew
//middlewares common to all res whould be declared top level before routes
//Global middle ware
//set SECURITY HTTP HEADERS
app.use(helmet())
//DEVELOPMENT LOGGING
if (process.env.NODE_ENV == "development") {
    app.use(morgan("dev"))
}

//LIMIT REQ FROM SAME IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many request from this IP, please try again in hour"
})

app.use("/api", limiter)

//BODY PARSER, READING DATA FROM THE BODY INTO req.body, limit body size
app.use(express.json({ limit: "10kb" }))

//Data sanitization against nosql query injection, removes dollar signs and dots
app.use(mongoSanitize())
//Data szanitization agains Xss. inject malicious html is removed
app.use(xss())
//serving static files from a folder and not a route

//Prevenet parameter pollution
app.use(hpp({
    whitelist: ["duration", "ratingsAverage", "ratingsQuantity", "maxGroupSize", "difficulty", "price"]
}))
app.use(express.static(`${__dirname}/public`))

//Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

//specify v1
//route habnndlers



//app.get("/api/v1/tours", getTour)

// app.get("/api/v1/tours/:id/", getTourById)
// // never specify ID
// //app.post("/api/v1/tours", createTour)

// app.patch("/api/v1/tours/:id", patchTour)

// app.delete("/api/v1/tours/:id", deleteTour)

//routes




app.use("/api/v1/tours", tourRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/reviews", reviewRouter)
//error handling for invalid routes
//has to be at the end because of the request respons ecycle
app.all("*", (req, res, next) => {

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

app.use(globalErrorHanler)

// if invalid route then execution reqches here
//server
module.exports = app
