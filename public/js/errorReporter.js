class ErrorReporter {
    constructor(options = {}) {
        this.apiEndpoint = options.apiEndpoint || '/api/errors';
        this.automaticReporting = options.automaticReporting !== false;
        this.debug = options.debug || false;
        
        if (this.automaticReporting) {
            this.setupAutomaticReporting();
        }
    }

    setupAutomaticReporting() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.reportError({
                errorMessage: event.reason?.message || 'Unhandled Promise Rejection',
                stackTrace: event.reason?.stack,
                additionalInfo: {
                    type: 'unhandledrejection',
                    promise: event.promise
                }
            });
        });

        // Handle global errors
        window.addEventListener('error', (event) => {
            this.reportError({
                errorMessage: event.message,
                stackTrace: event.error?.stack,
                additionalInfo: {
                    type: 'error',
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                }
            });
        });

        // Intercept fetch errors
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (!response.ok) {
                    this.reportError({
                        statusCode: response.status,
                        url: args[0],
                        errorMessage: `HTTP Error: ${response.status} ${response.statusText}`,
                        additionalInfo: {
                            type: 'fetch',
                            method: args[1]?.method || 'GET'
                        }
                    });
                }
                return response;
            } catch (error) {
                this.reportError({
                    errorMessage: error.message,
                    stackTrace: error.stack,
                    additionalInfo: {
                        type: 'fetch',
                        url: args[0],
                        method: args[1]?.method || 'GET'
                    }
                });
                throw error;
            }
        };

        // Intercept XHR errors
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(...args) {
            this.addEventListener('error', () => {
                this.reportError({
                    url: args[1],
                    errorMessage: 'XHR Request Failed',
                    additionalInfo: {
                        type: 'xhr',
                        method: args[0]
                    }
                });
            });
            return originalXHROpen.apply(this, args);
        };
    }

    async reportError({
        statusCode = 500,
        url = window.location.href,
        errorMessage,
        stackTrace,
        additionalInfo = {}
    }) {
        try {
            if (this.debug) {
                console.group('Error Report');
                console.error('Error:', errorMessage);
                console.error('Stack:', stackTrace);
                console.error('Additional Info:', additionalInfo);
                console.groupEnd();
            }

            const response = await fetch(`${this.apiEndpoint}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    statusCode,
                    url,
                    errorMessage,
                    stackTrace,
                    additionalInfo: {
                        ...additionalInfo,
                        userAgent: navigator.userAgent,
                        platform: navigator.platform,
                        timestamp: new Date().toISOString()
                    }
                })
            });

            const result = await response.json();

            if (this.debug) {
                console.log('Error Report Result:', result);
            }

            return result;
        } catch (error) {
            if (this.debug) {
                console.error('Failed to report error:', error);
            }
            return null;
        }
    }

    async getErrorDetails(statusCode) {
        try {
            const response = await fetch(`${this.apiEndpoint}/details/${statusCode}`);
            return await response.json();
        } catch (error) {
            if (this.debug) {
                console.error('Failed to get error details:', error);
            }
            return null;
        }
    }
}

// Example usage:
// const errorReporter = new ErrorReporter({
//     apiEndpoint: '/api/errors',
//     automaticReporting: true,
//     debug: true
// });
//
// // Manual error reporting
// errorReporter.reportError({
//     statusCode: 404,
//     errorMessage: 'Resource not found',
//     additionalInfo: { resourceId: '123' }
// });
