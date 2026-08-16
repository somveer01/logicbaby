// ==========================================================================
// Hash-Based SPA Router
// ==========================================================================

const routes = {};
let currentRoute = null;
let notFoundHandler = null;

/**
 * Register a route handler.
 * @param {string} pattern - Route pattern, e.g. '#/game/:category'
 * @param {Function} handler - Function called with { params, query }
 */
export function registerRoute(pattern, handler) {
  routes[pattern] = {
    handler,
    paramNames: extractParamNames(pattern),
    regex: patternToRegex(pattern)
  };
}

/**
 * Register a 404 handler
 */
export function registerNotFound(handler) {
  notFoundHandler = handler;
}

/**
 * Navigate to a hash route
 * @param {string} hash - e.g. '#/dashboard' or '#/game/patterns'
 */
export function navigateTo(hash) {
  window.location.hash = hash;
}

/**
 * Process the current hash and call the matching route handler
 */
export function processCurrentRoute() {
  const hash = window.location.hash || '#/dashboard';
  
  for (const pattern in routes) {
    const route = routes[pattern];
    const match = hash.match(route.regex);
    
    if (match) {
      const params = {};
      route.paramNames.forEach((name, index) => {
        params[name] = decodeURIComponent(match[index + 1]);
      });

      currentRoute = { pattern, params, hash };
      route.handler({ params, hash });
      return;
    }
  }

  // No route matched
  if (notFoundHandler) {
    notFoundHandler({ hash });
  }
}

/**
 * Initialize the router — listen for hash changes
 */
export function initRouter() {
  window.addEventListener('hashchange', processCurrentRoute);
  // Process initial route on load
  processCurrentRoute();
}

/**
 * Get current route info
 */
export function getCurrentRoute() {
  return currentRoute;
}

// === Helpers ===

function extractParamNames(pattern) {
  const names = [];
  const parts = pattern.split('/');
  for (const part of parts) {
    if (part.startsWith(':')) {
      names.push(part.slice(1));
    }
  }
  return names;
}

function patternToRegex(pattern) {
  // First replace :param placeholders with a temporary token
  const withTokens = pattern.replace(/:([a-zA-Z]+)/g, '___PARAM___');
  // Then escape special regex characters
  const escaped = withTokens.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Finally replace tokens with capture groups
  const final = escaped.replace(/___PARAM___/g, '([^/]+)');
  return new RegExp('^' + final + '$');
}
