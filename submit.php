<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Supabase configuration
const SUPABASE_URL = 'https://wesamwjbgmneeowiytlb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlc2Ftd2piZ21uZWVvd2l5dGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzY0MDMsImV4cCI6MjA2OTIxMjQwM30.czZs4pjSuFaQeKlIFJoguu4t3f3GyS-ja6OOKhjq_oo';

class SupabaseClient {
    private $url;
    private $key;
    private $headers;
    
    public function __construct($url, $key) {
        $this->url = $url;
        $this->key = $key;
        $this->headers = [
            'apikey: ' . $key,
            'Authorization: Bearer ' . $key,
            'Content-Type: application/json',
            'Prefer: return=minimal'
        ];
    }
    
    public function insert($table, $data) {
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->url . '/rest/v1/' . $table,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => $this->headers,
            CURLOPT_TIMEOUT => 30
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        
        curl_close($ch);
        
        if ($error) {
            throw new Exception('cURL Error: ' . $error);
        }
        
        if ($httpCode >= 400) {
            $errorData = json_decode($response, true);
            $message = isset($errorData['message']) ? $errorData['message'] : 'Unknown error';
            throw new Exception($message, $httpCode);
        }
        
        return $response;
    }
    
    public function count($table) {
        $ch = curl_init();
        
        $headers = $this->headers;
        $headers[] = 'Prefer: count=exact';
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->url . '/rest/v1/' . $table . '?select=count',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_HEADER => true,
            CURLOPT_TIMEOUT => 30
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $error = curl_error($ch);
        
        curl_close($ch);
        
        if ($error) {
            throw new Exception('cURL Error: ' . $error);
        }
        
        if ($httpCode >= 400) {
            throw new Exception('Failed to get count');
        }
        
        $headers = substr($response, 0, $headerSize);
        
        if (preg_match('/content-range:\s*\d+\/(\d+)/i', $headers, $matches)) {
            return (int)$matches[1];
        }
        
        return 0;
    }
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

try {
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        // Fallback to POST data
        $email = $_POST['email'] ?? '';
    } else {
        $email = $input['email'] ?? '';
    }
    
    // Sanitize and validate
    $email = sanitizeInput($email);
    
    if (empty($email)) {
        throw new Exception('Email address is required', 400);
    }
    
    if (!validateEmail($email)) {
        throw new Exception('Please enter a valid email address', 400);
    }
    
    // Initialize Supabase client
    $supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Insert into waitlist
    $data = [
        'email' => $email,
        'created_at' => date('c') // ISO 8601 format
    ];
    
    $supabase->insert('waitlist', $data);
    
    // Get updated count
    $count = $supabase->count('waitlist');
    
    // Success response
    echo json_encode([
        'success' => true,
        'message' => '🎉 You\'re on the waitlist! We\'ll notify you when we launch.',
        'count' => $count
    ]);
    
} catch (Exception $e) {
    $code = $e->getCode() ?: 500;
    http_response_code($code);
    
    $message = $e->getMessage();
    
    // Handle specific Supabase errors
    if (strpos($message, 'duplicate') !== false || strpos($message, 'unique') !== false) {
        $message = 'This email is already on our waitlist!';
    } elseif ($code >= 500) {
        $message = 'Something went wrong. Please try again.';
    }
    
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
}
?>