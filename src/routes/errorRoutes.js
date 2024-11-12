const express = require('express');
const router = express.Router();
const ErrorService = require('../services/errorService');
const { logRequest } = require('../utils/logger');

// Endpoint for reporting errors from frontend
router.post('/report', async (req, res) => {
    try {
        const {
            statusCode,
            url,
            errorMessage,
            stackTrace,
            additionalInfo
        } = req.body;

        // Basic validation
        if (!statusCode || !url) {
            return res.status(400).json({
                status: 'error',
                message: 'Wymagane pola: statusCode, url'
            });
        }

        // Log the error with client information
        const errorLog = await ErrorService.logClientError({
            statusCode,
            url,
            userAgent: req.get('user-agent'),
            timestamp: new Date().toISOString(),
            errorMessage,
            stackTrace,
            additionalInfo
        });

        // Analyze the error and get recommendations
        const analysis = await ErrorService.analyzeError({
            statusCode,
            url,
            errorMessage
        });

        // Log the request
        logRequest(req, res, {
            errorLog,
            analysis
        });

        res.json({
            status: 'success',
            message: 'Błąd został zalogowany',
            errorId: errorLog.errorId,
            analysis
        });
    } catch (error) {
        logRequest(req, res, { error: error.message });
        res.status(500).json({
            status: 'error',
            message: 'Nie udało się zalogować błędu'
        });
    }
});

// Get error details for status code
router.get('/details/:statusCode', (req, res) => {
    try {
        const statusCode = parseInt(req.params.statusCode);
        const errorDetails = ErrorService.getErrorDetails(statusCode);

        res.json({
            status: 'success',
            details: errorDetails
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Nie udało się pobrać szczegółów błędu'
        });
    }
});

module.exports = router;
