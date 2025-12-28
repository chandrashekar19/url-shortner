/**
 * 🚨 Error Handling Utilities
 */

class CustomError extends Error {
    constructor(message, status = 400, data = null) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";

    if (status === 500) {
        console.error("🔥 Server Error:", err);
    }

    return res.status(status).json({
        success: false,
        error: message,
        ...(err.data && { data: err.data }),
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

module.exports = {
    CustomError,
    errorHandler,
};
