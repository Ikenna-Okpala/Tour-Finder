class AppError extends Error {
    constructor(message, statusCode) {
        super(message)

        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"
        this.isOperational = true

        //exludes constructir from stack trace and adds a formated stack trace to error
        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError