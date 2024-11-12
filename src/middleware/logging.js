const { logRequest } = require('../utils/logger');

const loggingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logRequest(req, res, {
            responseTime: duration,
            statusCode: res.statusCode
        });
    });
    next();
};

module.exports = loggingMiddleware;
