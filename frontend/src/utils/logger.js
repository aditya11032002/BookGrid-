class UserStateLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Maximum number of logs to keep in memory
    this.logLevel = 'info'; // debug, info, warn, error
  }

  // Initialize logger with session info
  init() {
    this.log('info', 'SESSION_START', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      sessionId: this.generateSessionId(),
      url: window.location.href
    });
    this.loadPersistedLogs();
  }

  // Generate unique session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Main logging function
  log(level, action, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      action,
      data,
      url: window.location.href,
      sessionId: this.getSessionId()
    };

    this.logs.push(logEntry);
    
    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level.toUpperCase()}] ${action}:`, data);
    }

    // Save to localStorage
    this.saveToLocalStorage();
  }

  // Specific logging methods for user actions
  logCartAction(action, item, cartState) {
    this.log('info', 'CART_' + action.toUpperCase(), {
      item: {
        id: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity || 1
      },
      cartTotal: cartState.total,
      cartItemsCount: cartState.items.length,
      timestamp: new Date().toISOString()
    });
  }

  logWishlistAction(action, item, wishlistState) {
    this.log('info', 'WISHLIST_' + action.toUpperCase(), {
      item: {
        id: item._id,
        title: item.title,
        author: item.author
      },
      wishlistItemsCount: wishlistState.items.length,
      timestamp: new Date().toISOString()
    });
  }

  logAuthAction(action, userData = {}) {
    this.log('info', 'AUTH_' + action.toUpperCase(), {
      userId: userData.id || 'unknown',
      email: userData.email || 'unknown',
      timestamp: new Date().toISOString()
    });
  }

  logPageView(pageName, additionalData = {}) {
    this.log('info', 'PAGE_VIEW', {
      page: pageName,
      ...additionalData,
      timestamp: new Date().toISOString()
    });
  }

  logError(error, context = {}) {
    this.log('error', 'ERROR_OCCURRED', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  // Save logs to localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem('userStateLogs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  // Load logs from localStorage
  loadPersistedLogs() {
    try {
      const savedLogs = localStorage.getItem('userStateLogs');
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
        this.log('info', 'LOGS_LOADED', {
          previousLogCount: this.logs.length
        });
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
    }
  }

  // Export logs as downloadable file
  exportLogs() {
    const logData = {
      exportTime: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_state_logs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.log('info', 'LOGS_EXPORTED', {
      exportTime: logData.exportTime,
      logCount: logData.totalLogs
    });
  }

  // Get current session ID
  getSessionId() {
    const sessionStart = this.logs.find(log => log.action === 'SESSION_START');
    return sessionStart ? sessionStart.data.sessionId : 'unknown';
  }

  // Get logs for specific action type
  getLogsByAction(action) {
    return this.logs.filter(log => log.action === action);
  }

  // Get logs for specific time range
  getLogsByTimeRange(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return this.logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= start && logTime <= end;
    });
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('userStateLogs');
    this.log('info', 'LOGS_CLEARED', {
      timestamp: new Date().toISOString()
    });
  }

  // Get summary statistics
  getLogSummary() {
    const summary = {
      totalLogs: this.logs.length,
      sessionStart: null,
      actions: {},
      pages: {},
      errors: 0
    };

    this.logs.forEach(log => {
      if (log.action === 'SESSION_START') {
        summary.sessionStart = log.timestamp;
      }

      // Count actions
      summary.actions[log.action] = (summary.actions[log.action] || 0) + 1;

      // Count page views
      if (log.action === 'PAGE_VIEW') {
        const page = log.data.page;
        summary.pages[page] = (summary.pages[page] || 0) + 1;
      }

      // Count errors
      if (log.level === 'error') {
        summary.errors++;
      }
    });

    return summary;
  }
}

// Create singleton instance
const logger = new UserStateLogger();

export default logger;
