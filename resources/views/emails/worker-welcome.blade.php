<!DOCTYPE html>
<html>
<head>
    <title>Welcome to the Team</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #333;">
    <h2>Hello {{ $user->name }},</h2>
    <p>Welcome to our Service Marketplace team as a professional worker!</p>
    <p>Your account has been successfully created by our administration team. Here are your temporary login details to access your dashboard:</p>
    
    <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Email:</strong> {{ $user->email }}</p>
        <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e4e4e7; padding: 3px 6px; border-radius: 4px;">{{ $password }}</code></p>
    </div>
    
    <p>Please log in and navigate to your account settings to change your password immediately for security purposes.</p>
    
    <p>Best regards,<br>The Management Team</p>
</body>
</html>
