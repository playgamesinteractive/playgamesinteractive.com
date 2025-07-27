<?php
// Load environment variables from .env file
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Load .env file if it exists
loadEnv(__DIR__ . '/.env');

// Helper function to get environment variables with fallback
function env($key, $default = null) {
    $value = getenv($key);
    if ($value === false) {
        return $default;
    }
    
    // Convert string booleans to actual booleans
    if (strtolower($value) === 'true') return true;
    if (strtolower($value) === 'false') return false;
    
    return $value;
}

// Supabase Configuration
define('SUPABASE_URL', env('SUPABASE_URL', 'https://wesamwjbgmneeowiytlb.supabase.co'));
define('SUPABASE_ANON_KEY', env('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlc2Ftd2piZ21uZWVvd2l5dGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzY0MDMsImV4cCI6MjA2OTIxMjQwM30.czZs4pjSuFaQeKlIFJoguu4t3f3GyS-ja6OOKhjq_oo'));

// Database table name
define('WAITLIST_TABLE', env('WAITLIST_TABLE', 'waitlist'));

// Application settings
define('APP_NAME', env('APP_NAME', 'Play Games Interactive'));
define('APP_DESCRIPTION', env('APP_DESCRIPTION', 'Product development studio building high-performance tools for online platforms, digital communities, and real-time applications'));
define('APP_ENV', env('APP_ENV', 'production'));

// Security settings
define('RATE_LIMIT_ENABLED', env('RATE_LIMIT_ENABLED', true));
define('RATE_LIMIT_REQUESTS', (int)env('RATE_LIMIT_REQUESTS', 5));
define('RATE_LIMIT_WINDOW', (int)env('RATE_LIMIT_WINDOW', 300));

// Email validation settings
define('EMAIL_MAX_LENGTH', (int)env('EMAIL_MAX_LENGTH', 254));
define('REQUIRE_EMAIL_CONFIRMATION', env('REQUIRE_EMAIL_CONFIRMATION', false));

// Response messages
define('SUCCESS_MESSAGE', env('SUCCESS_MESSAGE', '🎉 You\'re on the waitlist! We\'ll notify you when we launch.'));
define('DUPLICATE_EMAIL_MESSAGE', env('DUPLICATE_EMAIL_MESSAGE', 'This email is already on our waitlist!'));
define('INVALID_EMAIL_MESSAGE', env('INVALID_EMAIL_MESSAGE', 'Please enter a valid email address'));
define('GENERIC_ERROR_MESSAGE', env('GENERIC_ERROR_MESSAGE', 'Something went wrong. Please try again.'));

// Development/Production settings
define('DEBUG_MODE', env('DEBUG_MODE', false));
define('LOG_ERRORS', env('LOG_ERRORS', true));

// Set PHP error reporting based on environment
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
}

// Security headers
if (APP_ENV === 'production') {
    // HSTS
    header('Strict-Transport-Security: max-age=' . env('HSTS_MAX_AGE', 31536000));
    
    // Content Security Policy
    $csp = env('CONTENT_SECURITY_POLICY', "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://wesamwjbgmneeowiytlb.supabase.co");
    header('Content-Security-Policy: ' . $csp);
    
    // Other security headers
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
}

?>