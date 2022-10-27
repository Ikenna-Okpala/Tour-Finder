const AppError = require("../utils/appError")

const sendErrorForDev = (error, res) => {
    res.status(error.statusCode).json({
        status: error.status,
        error: error,
        message: error.message,
        stack: error.stack
    })
}

const sendErrorForProd = (error, res) => {
    //Input Error
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        })
    }
    //Unknown error
    else {
        console.error("Error", error)
        res.status(500).json({
            status: "error",
            message: "Something went very wrong"
        })
    }

}
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}
const handleDuplicateFieldDB = error => {
    const value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)
    const message = `Duplicare field value ${value[0]}. Please use another value`
    return new AppError(message, 400)

}
const handleValidationErrorDB = error => {
    const errors = Object.values(error.errors).map(el => {
        return el.message
    })
    const message = `Invalid input data. ${errors.join(". ")}`
    return new AppError(message, 400)
}

const handleJWTError = () => new AppError("Invalid token. Please log in again!", 401)

const handleJWTExpiredError = () => new AppError("Your token has expired! Please log in again.", 401)

module.exports = (error, req, res, next) => {

    error.statusCode = error.statusCode || 500
    error.status = error.status || "error"

    if (process.env.NODE_ENV === "development") {
        sendErrorForDev(error, res)
    }
    else if (process.env.NODE_ENV === "production") {
        let errorCopy = { ...error }
        if (errorCopy.name === "CastError") {
            errorCopy = handleCastErrorDB(errorCopy)
        }
        if (errorCopy.code === 11000) {
            errorCopy = handleDuplicateFieldDB(error, res)
        }
        if (errorCopy.name === "ValidationError") {
            errorCopy = handleValidationErrorDB(errorCopy)
        }
        if (errorCopy.name === "JsonWebTokenError") {
            errorCopy = handleJWTError(errorCopy)
        }
        if (errorCopy.name === "TokenExpiredError") errorCopy = handleJWTExpiredError(errorCopy)
        sendErrorForProd(errorCopy, res)
    }

}