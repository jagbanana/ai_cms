/**
 * Security Headers Configuration for Cloudflare Pages
 * 
 * This file provides security header configuration that can be used
 * with Cloudflare Pages Functions or other deployment platforms
 */

// Security headers configuration
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'", // unsafe-eval needed for Stockfish WASM
    "style-src 'self' 'unsafe-inline'", // unsafe-inline for dynamic chess board styles
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ].join('; '),

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // XSS Protection (legacy, but still useful)
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy (feature policy)
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'speaker=()',
    'fullscreen=(self)',
    'sync-xhr=()'
  ].join(', '),

  // HSTS (HTTP Strict Transport Security)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Expect Certificate Transparency
  'Expect-CT': 'max-age=86400, enforce',

  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Report-only CSP for testing
export const reportOnlyCSP = {
  'Content-Security-Policy-Report-Only': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "report-uri /api/csp-report",
    "report-to csp-endpoint"
  ].join('; ')
};

// Cloudflare Pages Function for setting security headers
export async function onRequest(context) {
  const { request } = context;
  const response = await context.next();

  // Clone response to modify headers
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers)
  });

  // Add security headers
  Object.entries(securityHeaders).forEach(([header, value]) => {
    newResponse.headers.set(header, value);
  });

  // Add report-only CSP in development
  if (context.env.ENVIRONMENT === 'development') {
    Object.entries(reportOnlyCSP).forEach(([header, value]) => {
      newResponse.headers.set(header, value);
    });
  }

  return newResponse;
}

// Netlify-style headers configuration
export const netlifyHeaders = `
/*
  ${Object.entries(securityHeaders)
    .map(([header, value]) => `${header}: ${value}`)
    .join('\n  ')}

# Additional headers for specific file types
/*.js
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/*.css
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/*.wasm
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/wasm

/*.json
  Cache-Control: public, max-age=3600
  X-Content-Type-Options: nosniff

/api/*
  X-Robots-Tag: noindex
  Cache-Control: no-store, no-cache, must-revalidate
`;

// Apache .htaccess configuration
export const apacheHeaders = `
# Security Headers
<IfModule mod_headers.c>
  ${Object.entries(securityHeaders)
    .map(([header, value]) => `Header always set ${header} "${value}"`)
    .join('\n  ')}
</IfModule>

# File type specific headers
<FilesMatch "\\.(js|css)$">
  Header set Cache-Control "public, max-age=31536000, immutable"
  Header set X-Content-Type-Options "nosniff"
</FilesMatch>

<FilesMatch "\\.wasm$">
  Header set Content-Type "application/wasm"
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>

<FilesMatch "\\.json$">
  Header set Cache-Control "public, max-age=3600"
  Header set X-Content-Type-Options "nosniff"
</FilesMatch>
`;

// Nginx configuration
export const nginxConfig = `
# Security headers
add_header Content-Security-Policy "${securityHeaders['Content-Security-Policy']}" always;
add_header X-Content-Type-Options "${securityHeaders['X-Content-Type-Options']}" always;
add_header X-Frame-Options "${securityHeaders['X-Frame-Options']}" always;
add_header X-XSS-Protection "${securityHeaders['X-XSS-Protection']}" always;
add_header Referrer-Policy "${securityHeaders['Referrer-Policy']}" always;
add_header Permissions-Policy "${securityHeaders['Permissions-Policy']}" always;
add_header Strict-Transport-Security "${securityHeaders['Strict-Transport-Security']}" always;

# File type specific configurations
location ~* \\.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options "nosniff";
}

location ~* \\.wasm$ {
    expires 1y;
    add_header Content-Type "application/wasm";
    add_header Cache-Control "public, immutable";
}

location ~* \\.json$ {
    expires 1h;
    add_header Cache-Control "public";
    add_header X-Content-Type-Options "nosniff";
}

# API routes
location /api/ {
    add_header X-Robots-Tag "noindex";
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}
`;

export default {
  securityHeaders,
  reportOnlyCSP,
  netlifyHeaders,
  apacheHeaders,
  nginxConfig,
  onRequest
};