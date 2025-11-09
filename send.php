<?php
/**
 * Contact Form Handler
 * 
 * Este archivo procesa el formulario de contacto y envía un email.
 * Incluye validación y sanitización de datos para seguridad.
 * 
 * CONFIGURACIÓN:
 * - Cambia $to_email con tu dirección de correo
 * - Configura tu servidor SMTP si es necesario
 */

// Prevenir acceso directo
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 403 Forbidden');
    exit('Acceso directo no permitido.');
}

// Headers de seguridad
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// CONFIGURACIÓN - ¡IMPORTANTE! Cambia este email por el tuyo
$to_email = 'tanishamaria2@gmail.com'; // ← CAMBIA ESTO
$from_name = 'Portfolio Website';

// Rate Limiting simple (prevenir spam)
session_start();
$max_requests = 3; // Máximo 3 envíos
$time_window = 3600; // En 1 hora (3600 segundos)

if (!isset($_SESSION['form_submissions'])) {
    $_SESSION['form_submissions'] = [];
}

// Limpiar envíos antiguos
$_SESSION['form_submissions'] = array_filter(
    $_SESSION['form_submissions'],
    function($timestamp) use ($time_window) {
        return (time() - $timestamp) < $time_window;
    }
);

// Verificar si se excedió el límite
if (count($_SESSION['form_submissions']) >= $max_requests) {
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'message' => 'Has excedido el límite de envíos. Intenta más tarde.'
    ]);
    exit;
}

// Función para sanitizar datos
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Función para validar email
function is_valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Obtener y sanitizar datos del formulario
$name = isset($_POST['name']) ? sanitize_input($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitize_input($_POST['email']) : '';
$subject = isset($_POST['subject']) ? sanitize_input($_POST['subject']) : '';
$message = isset($_POST['message']) ? sanitize_input($_POST['message']) : '';

// Array para almacenar errores
$errors = [];

// Validaciones
if (empty($name) || strlen($name) < 2) {
    $errors[] = 'El nombre debe tener al menos 2 caracteres.';
}

if (empty($email) || !is_valid_email($email)) {
    $errors[] = 'Por favor, ingresa un email válido.';
}

if (empty($subject) || strlen($subject) < 3) {
    $errors[] = 'El asunto debe tener al menos 3 caracteres.';
}

if (empty($message) || strlen($message) < 10) {
    $errors[] = 'El mensaje debe tener al menos 10 caracteres.';
}

// Validación adicional: detectar contenido spam
$spam_keywords = ['viagra', 'casino', 'lottery', 'prize', 'winner', 'click here'];
$content_to_check = strtolower($name . ' ' . $subject . ' ' . $message);

foreach ($spam_keywords as $keyword) {
    if (strpos($content_to_check, $keyword) !== false) {
        $errors[] = 'Tu mensaje contiene contenido no permitido.';
        break;
    }
}

// Si hay errores, devolver respuesta
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => implode(' ', $errors)
    ]);
    exit;
}

// Preparar el email
$email_subject = "Nuevo mensaje de contacto: " . $subject;

// Cuerpo del email en HTML
$email_body = "
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #6A00F4, #9B5CFF);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .field {
            margin-bottom: 20px;
            padding: 15px;
            background: white;
            border-radius: 5px;
            border-left: 4px solid #6A00F4;
        }
        .label {
            font-weight: bold;
            color: #6A00F4;
            display: block;
            margin-bottom: 5px;
        }
        .value {
            color: #333;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class='header'>
        <h1>Nuevo Mensaje de Contacto</h1>
    </div>
    <div class='content'>
        <div class='field'>
            <span class='label'>Nombre:</span>
            <span class='value'>" . htmlspecialchars($name) . "</span>
        </div>
        <div class='field'>
            <span class='label'>Email:</span>
            <span class='value'>" . htmlspecialchars($email) . "</span>
        </div>
        <div class='field'>
            <span class='label'>Asunto:</span>
            <span class='value'>" . htmlspecialchars($subject) . "</span>
        </div>
        <div class='field'>
            <span class='label'>Mensaje:</span>
            <div class='value'>" . nl2br(htmlspecialchars($message)) . "</div>
        </div>
        <div class='footer'>
            <p>Este mensaje fue enviado desde el formulario de contacto de tu portfolio.</p>
            <p>Fecha: " . date('d/m/Y H:i:s') . "</p>
        </div>
    </div>
</body>
</html>
";

// Headers del email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type: text/html; charset=UTF-8" . "\r\n";
$headers .= "From: " . $from_name . " <noreply@" . $_SERVER['HTTP_HOST'] . ">" . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "X-Priority: 3" . "\r\n";

// Intentar enviar el email
$mail_sent = @mail($to_email, $email_subject, $email_body, $headers);

if ($mail_sent) {
    // Registrar el envío exitoso
    $_SESSION['form_submissions'][] = time();
    
    // Respuesta exitosa
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => '¡Mensaje enviado exitosamente! Te contactaré pronto.'
    ]);
    
    // Log opcional (descomenta para debugging)
    // error_log("Formulario de contacto enviado desde: $email - Nombre: $name");
} else {
    // Error al enviar
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al enviar el mensaje. Por favor, intenta más tarde o contáctame directamente.'
    ]);
    
    // Log del error
    error_log("Error al enviar email de contacto para: $email");
}

// Limpiar variables sensibles
unset($name, $email, $subject, $message, $email_body);
?>