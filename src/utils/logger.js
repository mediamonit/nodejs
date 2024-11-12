const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
fs.mkdirSync(logsDir, { recursive: true });

// Different log files for different purposes
const requestLogFile = path.join(logsDir, 'requests.log');
const appLogFile = path.join(logsDir, 'app.log');
const errorLogFile = path.join(logsDir, 'error.log');

// Log levels
const LOG_LEVELS = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
};

function writeToLog(filePath, data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        ...data
    };

    fs.appendFile(
        filePath,
        JSON.stringify(logEntry) + '\n',
        (err) => {
            if (err) console.error('Error writing to log file:', err);
        }
    );
}

// Enhanced request logging
function logRequest(req, res, details = {}) {
    const logEntry = {
        level: LOG_LEVELS.INFO,
        type: 'REQUEST',
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: req.body,
        details,
    };
    writeToLog(requestLogFile, logEntry);
}

// Application logging
function logAppInfo(message, data = {}) {
    const logEntry = {
        level: LOG_LEVELS.INFO,
        type: 'APP',
        message,
        data
    };
    writeToLog(appLogFile, logEntry);
}

// Error logging
function logError(error, context = {}) {
    const logEntry = {
        level: LOG_LEVELS.ERROR,
        type: 'ERROR',
        message: error.message,
        stack: error.stack,
        context
    };
    writeToLog(errorLogFile, logEntry);
}

// Environment variable validation logging
function logEnvCheck(variable, status, details = {}) {
    const logEntry = {
        level: LOG_LEVELS.INFO,
        type: 'ENV_CHECK',
        variable,
        status,
        details
    };
    writeToLog(appLogFile, logEntry);
}

// Media operation logging
function logMediaOperation(operation, url, status, details = {}) {
    const logEntry = {
        level: LOG_LEVELS.INFO,
        type: 'MEDIA_OPERATION',
        operation,
        url,
        status,
        details
    };
    writeToLog(appLogFile, logEntry);
}

// Debug logging
function logDebug(message, data = {}) {
    if (process.env.NODE_ENV === 'development') {
        const logEntry = {
            level: LOG_LEVELS.DEBUG,
            type: 'DEBUG',
            message,
            data
        };
        writeToLog(appLogFile, logEntry);
    }
}

module.exports = {
    logRequest,
    logAppInfo,
    logError,
    logEnvCheck,
    logMediaOperation,
    logDebug,
    LOG_LEVELS
};
