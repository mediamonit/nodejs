const { logError } = require('../utils/logger');

class ErrorService {
    static getErrorDetails(statusCode) {
        const errorMap = {
            400: {
                type: 'BAD_REQUEST',
                message: 'Nieprawidłowe żądanie',
                severity: 'warning'
            },
            401: {
                type: 'UNAUTHORIZED',
                message: 'Brak autoryzacji',
                severity: 'warning'
            },
            403: {
                type: 'FORBIDDEN',
                message: 'Brak dostępu',
                severity: 'warning'
            },
            404: {
                type: 'NOT_FOUND',
                message: 'Zasób nie został znaleziony',
                severity: 'warning'
            },
            408: {
                type: 'TIMEOUT',
                message: 'Przekroczono czas oczekiwania',
                severity: 'warning'
            },
            500: {
                type: 'INTERNAL_SERVER_ERROR',
                message: 'Wewnętrzny błąd serwera',
                severity: 'error'
            },
            502: {
                type: 'BAD_GATEWAY',
                message: 'Błąd bramy',
                severity: 'error'
            },
            503: {
                type: 'SERVICE_UNAVAILABLE',
                message: 'Usługa niedostępna',
                severity: 'error'
            },
            504: {
                type: 'GATEWAY_TIMEOUT',
                message: 'Przekroczono czas oczekiwania bramy',
                severity: 'error'
            }
        };

        return errorMap[statusCode] || {
            type: 'UNKNOWN_ERROR',
            message: 'Nieznany błąd',
            severity: 'error'
        };
    }

    static async logClientError(errorData) {
        const {
            statusCode,
            url,
            userAgent,
            timestamp,
            errorMessage,
            stackTrace,
            additionalInfo
        } = errorData;

        const errorDetails = this.getErrorDetails(statusCode);

        const logData = {
            source: 'CLIENT',
            errorType: errorDetails.type,
            severity: errorDetails.severity,
            statusCode,
            url,
            userAgent,
            timestamp: timestamp || new Date().toISOString(),
            message: errorMessage || errorDetails.message,
            stackTrace,
            additionalInfo
        };

        logError(new Error(logData.message), {
            context: 'Client Error Report',
            ...logData
        });

        return {
            logged: true,
            errorId: Date.now(),
            errorType: errorDetails.type,
            message: errorDetails.message
        };
    }

    static async analyzeError(errorData) {
        const { statusCode, url } = errorData;
        const errorDetails = this.getErrorDetails(statusCode);
        
        let recommendation = 'Spróbuj ponownie później';
        let priority = 'low';

        switch (errorDetails.type) {
            case 'NOT_FOUND':
                recommendation = 'Sprawdź poprawność adresu URL';
                priority = 'medium';
                break;
            case 'TIMEOUT':
                recommendation = 'Sprawdź połączenie internetowe i spróbuj ponownie';
                priority = 'medium';
                break;
            case 'INTERNAL_SERVER_ERROR':
                recommendation = 'Skontaktuj się z administratorem systemu';
                priority = 'high';
                break;
            case 'SERVICE_UNAVAILABLE':
                recommendation = 'Usługa tymczasowo niedostępna, spróbuj ponownie za kilka minut';
                priority = 'high';
                break;
        }

        return {
            errorType: errorDetails.type,
            message: errorDetails.message,
            recommendation,
            priority,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = ErrorService;
