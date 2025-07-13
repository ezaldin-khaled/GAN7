/**
 * Payment Debugging Utility
 * Provides centralized debugging functions for payment and subscription flows
 */

// Debug levels
export const DEBUG_LEVELS = {
  INFO: '🔍',
  SUCCESS: '✅',
  WARNING: '⚠️',
  ERROR: '❌',
  DEBUG: '🔧'
};

// Payment flow stages
export const PAYMENT_STAGES = {
  INIT: 'initialization',
  PLANS_FETCH: 'plans_fetch',
  SUBSCRIPTION_FETCH: 'subscription_fetch',
  CHECKOUT_CREATE: 'checkout_create',
  PAYMENT_INTENT: 'payment_intent',
  STRIPE_CONFIRM: 'stripe_confirm',
  SUBSCRIPTION_UPDATE: 'subscription_update',
  VERIFICATION: 'verification',
  SUCCESS: 'success',
  ERROR: 'error'
};

class PaymentDebugger {
  constructor() {
    this.debugInfo = {};
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.enabled = this.isDevelopment || localStorage.getItem('payment_debug') === 'true';
  }

  // Enable/disable debugging
  enable() {
    this.enabled = true;
    localStorage.setItem('payment_debug', 'true');
  }

  disable() {
    this.enabled = false;
    localStorage.removeItem('payment_debug');
  }

  // Log with emoji prefix
  log(level, component, message, data = null) {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const logMessage = `${level} ${component}: ${message}`;
    
    console.log(logMessage);
    
    if (data) {
      console.log('📋 Data:', data);
    }
    
    console.log('⏰ Timestamp:', timestamp);
    console.log('---');
  }

  // Log API request
  logRequest(component, endpoint, method, data = null, headers = null) {
    this.log(DEBUG_LEVELS.INFO, component, `Making ${method} request to ${endpoint}`);
    
    if (data) {
      this.log(DEBUG_LEVELS.INFO, component, 'Request data:', data);
    }
    
    if (headers) {
      this.log(DEBUG_LEVELS.INFO, component, 'Request headers:', headers);
    }
    
    this.updateDebugInfo(component, {
      lastRequest: {
        endpoint,
        method,
        data,
        headers,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Log API response
  logResponse(component, endpoint, status, data = null, headers = null) {
    const level = status >= 200 && status < 300 ? DEBUG_LEVELS.SUCCESS : DEBUG_LEVELS.ERROR;
    this.log(level, component, `Response from ${endpoint} (${status})`);
    
    if (data) {
      this.log(level, component, 'Response data:', data);
    }
    
    if (headers) {
      this.log(level, component, 'Response headers:', headers);
    }
    
    this.updateDebugInfo(component, {
      lastResponse: {
        endpoint,
        status,
        data,
        headers,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Log error
  logError(component, error, context = null) {
    this.log(DEBUG_LEVELS.ERROR, component, `Error: ${error.message}`);
    
    if (error.response) {
      this.log(DEBUG_LEVELS.ERROR, component, 'Error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    if (error.request) {
      this.log(DEBUG_LEVELS.ERROR, component, 'No response received:', error.request);
    }
    
    if (context) {
      this.log(DEBUG_LEVELS.ERROR, component, 'Error context:', context);
    }
    
    this.updateDebugInfo(component, {
      lastError: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        context,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Log Stripe operations
  logStripe(component, operation, data = null) {
    this.log(DEBUG_LEVELS.INFO, component, `Stripe ${operation}`);
    
    if (data) {
      this.log(DEBUG_LEVELS.INFO, component, 'Stripe data:', data);
    }
    
    this.updateDebugInfo(component, {
      lastStripeOperation: {
        operation,
        data,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Log payment flow stage
  logStage(component, stage, data = null) {
    this.log(DEBUG_LEVELS.INFO, component, `Stage: ${stage}`);
    
    if (data) {
      this.log(DEBUG_LEVELS.INFO, component, 'Stage data:', data);
    }
    
    this.updateDebugInfo(component, {
      currentStage: stage,
      stageData: data,
      stageTimestamp: new Date().toISOString()
    });
  }

  // Update debug info for a component
  updateDebugInfo(component, info) {
    if (!this.debugInfo[component]) {
      this.debugInfo[component] = {};
    }
    
    this.debugInfo[component] = {
      ...this.debugInfo[component],
      ...info
    };
  }

  // Get debug info for a component
  getDebugInfo(component) {
    return this.debugInfo[component] || {};
  }

  // Get all debug info
  getAllDebugInfo() {
    return this.debugInfo;
  }

  // Clear debug info
  clearDebugInfo(component = null) {
    if (component) {
      delete this.debugInfo[component];
    } else {
      this.debugInfo = {};
    }
  }

  // Create debug panel component
  createDebugPanel(component, title = null) {
    if (!this.enabled) return null;

    const debugInfo = this.getDebugInfo(component);
    const panelTitle = title || `🔧 ${component} Debug Info`;

    return (
      <div className="debug-panel" style={{
        background: '#f0f0f0',
        border: '1px solid #ccc',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <h4>{panelTitle}</h4>
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={() => this.clearDebugInfo(component)}
            style={{ 
              background: '#ff4444', 
              color: 'white', 
              border: 'none', 
              padding: '5px 10px', 
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Clear Debug
          </button>
        </div>
        <pre style={{ 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-word',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    );
  }

  // Log environment info
  logEnvironment(component) {
    this.log(DEBUG_LEVELS.INFO, component, 'Environment info:', {
      NODE_ENV: process.env.NODE_ENV,
      baseURL: window.location.origin,
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }

  // Log authentication info
  logAuth(component) {
    const token = localStorage.getItem('access');
    const user = localStorage.getItem('user');
    
    this.log(DEBUG_LEVELS.INFO, component, 'Authentication info:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      hasUser: !!user,
      userPreview: user ? JSON.parse(user) : null
    });
  }

  // Log component state
  logState(component, state) {
    this.log(DEBUG_LEVELS.INFO, component, 'Component state:', state);
  }

  // Create a summary of all payment operations
  createSummary() {
    if (!this.enabled) return null;

    const summary = {
      timestamp: new Date().toISOString(),
      components: Object.keys(this.debugInfo),
      totalOperations: Object.values(this.debugInfo).reduce((acc, comp) => {
        return acc + Object.keys(comp).length;
      }, 0),
      errors: Object.values(this.debugInfo).filter(comp => comp.lastError).length,
      successfulRequests: Object.values(this.debugInfo).filter(comp => comp.lastResponse && comp.lastResponse.status >= 200 && comp.lastResponse.status < 300).length
    };

    this.log(DEBUG_LEVELS.INFO, 'PaymentDebugger', 'Payment flow summary:', summary);
    return summary;
  }
}

// Create singleton instance
const paymentDebugger = new PaymentDebugger();

// Export functions for easy use
export const logRequest = (component, endpoint, method, data, headers) => 
  paymentDebugger.logRequest(component, endpoint, method, data, headers);

export const logResponse = (component, endpoint, status, data, headers) => 
  paymentDebugger.logResponse(component, endpoint, status, data, headers);

export const logError = (component, error, context) => 
  paymentDebugger.logError(component, error, context);

export const logStripe = (component, operation, data) => 
  paymentDebugger.logStripe(component, operation, data);

export const logStage = (component, stage, data) => 
  paymentDebugger.logStage(component, stage, data);

export const getDebugInfo = (component) => 
  paymentDebugger.getDebugInfo(component);

export const createDebugPanel = (component, title) => 
  paymentDebugger.createDebugPanel(component, title);

export const logEnvironment = (component) => 
  paymentDebugger.logEnvironment(component);

export const logAuth = (component) => 
  paymentDebugger.logAuth(component);

export const logState = (component, state) => 
  paymentDebugger.logState(component, state);

export const createSummary = () => 
  paymentDebugger.createSummary();

export const enableDebug = () => 
  paymentDebugger.enable();

export const disableDebug = () => 
  paymentDebugger.disable();

export default paymentDebugger; 