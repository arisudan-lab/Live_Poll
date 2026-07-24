// ============================================================================
// Observability & Logging Layer
// ============================================================================
// Centralized logging, error tracking, and monitoring utilities
// ============================================================================

/**
 * Log levels for different types of messages
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Log entry structure
 */
interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
  error?: Error;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

/**
 * Application-wide logger with category support
 */
class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 100;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      ...config,
    };
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get recent logs for debugging
   */
  getRecentLogs(limit: number = 50): LogEntry[] {
    return this.logBuffer.slice(-limit);
  }

  /**
   * Clear log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, category: string, message: string, data?: unknown, error?: Error): void {
    // Check if level should be logged
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      error,
    };

    // Add to buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.logBuffer.shift();
    }

    // Console output
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // Remote logging (if configured)
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendToRemote(entry).catch(console.error);
    }
  }

  /**
   * Output log entry to console
   */
  private outputToConsole(entry: LogEntry): void {
    const time = new Date(entry.timestamp).toISOString();
    const prefix = `[${time}] [${LogLevel[entry.level]}] [${entry.category}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data ?? '');
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data ?? '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data ?? '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.data ?? '', entry.error ?? '');
        break;
    }
  }

  /**
   * Send log to remote endpoint
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Silent fail for remote logging
      console.error('Failed to send log to remote:', error);
    }
  }

  // Convenience methods
  debug(category: string, message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: unknown): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: unknown): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, error?: Error, data?: unknown): void {
    this.log(LogLevel.ERROR, category, message, data, error);
  }
}

// ============================================================================
// Application Categories
// ============================================================================

export const enum LogCategory {
  WALLET = 'wallet',
  CONTRACT = 'contract',
  TRANSACTION = 'transaction',
  EVENT = 'event',
  UI = 'ui',
  NETWORK = 'network',
  ERROR = 'error',
}

// ============================================================================
// Error Tracking
// ============================================================================

/**
 * Error context for better debugging
 */
interface ErrorContext {
  userId?: string;
  walletAddress?: string;
  transactionHash?: string;
  contractId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Track error with context
 */
export function trackError(
  error: Error,
  category: LogCategory,
  context: ErrorContext = {}
): void {
  logger.error(category, `Error: ${error.message}`, error, { context });
}

/**
 * Wrap async function with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  category: LogCategory,
  action: string
): T {
  return (async (...args: unknown[]) => {
    try {
      logger.debug(category, `Starting: ${action}`, { args });
      const result = await fn(...args);
      logger.info(category, `Completed: ${action}`);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      trackError(err, category, { action });
      throw err;
    }
  }) as T;
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Measure execution time of async function
 */
export async function measureExecution<T>(
  fn: () => Promise<T>,
  category: LogCategory,
  action: string
): Promise<T> {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    logger.debug(category, `Execution: ${action}`, { duration: `${duration.toFixed(2)}ms` });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.warn(category, `Failed: ${action}`, { duration: `${duration.toFixed(2)}ms` });
    throw error;
  }
}

/**
 * Track transaction timing
 */
export interface TransactionTiming {
  submittedAt: number;
  confirmedAt?: number;
  duration?: number;
  status: 'pending' | 'success' | 'failed';
}

const transactionTimings = new Map<string, TransactionTiming>();

export function startTransactionTracking(txHash: string): void {
  transactionTimings.set(txHash, {
    submittedAt: Date.now(),
    status: 'pending',
  });
  
  logger.info(LogCategory.TRANSACTION, 'Transaction submitted', { txHash });
}

export function completeTransactionTracking(
  txHash: string,
  status: 'success' | 'failed'
): void {
  const timing = transactionTimings.get(txHash);
  
  if (!timing) {
    logger.warn(LogCategory.TRANSACTION, 'Transaction timing not found', { txHash });
    return;
  }
  
  timing.status = status;
  timing.confirmedAt = Date.now();
  timing.duration = timing.confirmedAt - timing.submittedAt;
  
  logger.info(LogCategory.TRANSACTION, `Transaction ${status}`, {
    txHash,
    duration: `${timing.duration}ms`,
  });
  
  transactionTimings.set(txHash, timing);
}

// ============================================================================
// Application Metrics
// ============================================================================

interface Metrics {
  transactionsSubmitted: number;
  transactionsSuccess: number;
  transactionsFailed: number;
  eventsReceived: number;
  errorsTracked: number;
  avgTransactionTime: number;
}

const metrics: Metrics = {
  transactionsSubmitted: 0,
  transactionsSuccess: 0,
  transactionsFailed: 0,
  eventsReceived: 0,
  errorsTracked: 0,
  avgTransactionTime: 0,
};

export function incrementMetric(key: keyof Metrics, value: number = 1): void {
  metrics[key] += value;
  logger.debug(LogCategory.UI, 'Metric updated', { key, value, current: metrics[key] });
}

export function getMetrics(): Metrics {
  return { ...metrics };
}

// ============================================================================
// Global Logger Instance
// ============================================================================

const logger = new Logger({
  minLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableRemote: false,
});

export { logger };

// ============================================================================
// Error Boundary Helper
// ============================================================================

/**
 * Format error for display
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const message = formatError(error).toLowerCase();
  
  const retryablePatterns = [
    'network',
    'timeout',
    'temporarily',
    'rate limit',
    'unavailable',
  ];
  
  return retryablePatterns.some(pattern => message.includes(pattern));
}
