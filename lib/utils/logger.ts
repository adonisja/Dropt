interface LogContext {
    source?: string;    // File or component name
    userId?: string;    // For tracking user-specific issues
    data?: any;         // Additional context data
}

type LogLevel ='debug' | 'info' | 'warn' | 'error';

class Logger {
    private isDev: boolean;
    
    // Log level symbols for visual distinction
    private symbols = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌'
    };

    //ANSI color codes (work in terminals and web consoles)
    private colors = {
        debug: '\x1b[36m',   // Cyan
        info: '\x1b[34m',    // Blue
        warn: '\x1b[33m',    // Yellow
        error: '\x1b[31m',   // Red
        reset: '\x1b[0m'     // Reset
    };

    constructor() {
        this.isDev = __DEV__;
    }

    private formatTimestamp(): string {
        return new Date().toISOString();
    }

    private formatMessage(
        level: LogLevel,
        message: string,
        context?: LogContext
    ): string {
        const timestamp = this.formatTimestamp();
        const symbol = this.symbols[level];
        const source = context?.source ? `[${context.source}]` : '';

        return `${symbol} ${timestamp} ${source} ${message}`;
    }

    private log(
        level: LogLevel,
        message: string,
        context?:  LogContext
    ): void {
        // In production, only log errors
        if (!this.isDev && level !== 'error') {
            return;
        }

        const formattedMessage = this.formatMessage(level, message, context);
        const color = this.colors[level];
        const reset = this.colors.reset;

        // Select appropriate console method
        const consoleMethod = level === 'error' ? console.error : 
                              level === 'warn' ? console.warn :
                              level === 'info' ? console.info :
                              console.log;

        // Output with color
        if (this.isDev) {
            consoleMethod(`${color}${formattedMessage}${reset}`);

            // Pretty print context data if provided
            if (context?.data) {
                console.log(' Data:', context.data);
            }
        } else if (level === 'error') {
            // In production, log errors without color
            consoleMethod(formattedMessage);
        }  
    }

    // Public API methods
    debug(message: string, context?: LogContext): void {
        this.log('debug', message, context);
    }

    info(message: string, context?: LogContext): void {
        this.log('info', message, context);
    }

    warn(message: string, context?: LogContext): void {
        this.log('warn', message, context);
    }

    error(message: string, context?: LogContext): void {
        this.log('error', message, context);
    }

    // Convenience method for API errors
    apiError(endpoint: string, error: any, context?: LogContext): void {
        this.error(`API Error: ${endpoint}`, {
            ...context,
            data: {
                error: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined
            }
        });
    }

    // Performance timing helper
    time(label: string): void {
        if (this.isDev) {
            console.time(label);
        }
    }

    timeEnd(label: string): void {
        if (this.isDev) {
            console.timeEnd(label);
        }
    }
}

export const logger = new Logger();