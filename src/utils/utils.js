export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpHtml(otp) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background-color: #fff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            margin-bottom: 10px;
        }
        .otp {
            font-size: 32px;
            font-weight: bold;
            color: #007bff;
            margin: 20px 0;
            padding: 10px 20px;
            border: 2px dashed #007bff;
            border-radius: 5px;
            display: inline-block;
            letter-spacing: 4px;
            background-color: #f0f8ff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>OTP Verification</h1>
        <p>Your OTP for verification is:</p>
        <div class="otp">${otp}</div>
        <p>Please use this OTP to complete the verification process.</p>
    </div>
</body>
</html>`;
}