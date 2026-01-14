import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only POST requests are allowed'
    });
  }

  const { name, email, teamName, teamId, eventName } = req.body;

  if (!name || !email || !eventName || !teamName || !teamId) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Please provide name, email, teamName, teamId, and eventName'
    });
  }

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration missing');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Professional HTML Template
    // Theme: Clean/Corporate but with Codigo Brand accents (Purple/Gold)
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <style>
    /* Base Resets */
    body {
      background-color: #f4f4f7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      font-size: 16px;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }
    table {
      border-collapse: separate;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      width: 100%;
    }
    
    /* Container */
    .container {
      margin: 0 auto !important;
      max-width: 600px;
      padding: 24px;
      width: 600px;
    }
    
    /* Card */
    .email-card {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #eaeaec;
      overflow: hidden;
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
      padding: 32px 0;
      text-align: center;
    }
    .header-title {
      color: #fbbf24;
      font-family: "Times New Roman", serif;
      font-size: 28px;
      margin: 0;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    
    /* Body */
    .content {
      padding: 32px;
    }
    .greeting {
      font-size: 20px;
      color: #1f2937;
      margin-bottom: 16px;
    }
    .text-body {
      color: #4b5563;
      margin-bottom: 24px;
    }
    
    /* Information Box */
    .info-box {
      background-color: #f3f4f6;
      border-left: 4px solid #4f46e5;
      padding: 20px;
      border-radius: 4px;
      margin: 24px 0;
    }
    .info-label {
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .info-value {
      font-size: 18px;
      color: #111827;
      font-weight: 600;
      margin: 0;
    }
    
    /* Footer */
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      color: #9ca3af;
      font-size: 12px;
      margin: 0;
    }
    
    /* Mobile Responsive */
    @media only screen and (max-width: 620px) {
      .container {
        padding: 0 !important;
        width: 100% !important;
      }
      .content {
        padding: 20px !important;
      }
      .email-card {
        border-radius: 0 !important;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
    <tr>
      <td>&nbsp;</td>
      <td class="container">
        <div class="email-card">
          <!-- Header -->
          <div class="header">
            <h1 class="header-title">CODIGO 4.0</h1>
          </div>
          
          <!-- Main Content -->
          <div class="content">
            <h2 class="greeting">Registration Confirmed!</h2>
            
            <p class="text-body">
              Hello <strong>${name}</strong>,
            </p>
            
            <p class="text-body">
              We are pleased to confirm your registration. You have successfully secured your spot for the upcoming event.
            </p>
            

            <div class="info-box">
              <div class="info-label">Event Name</div>
              <p class="info-value">${eventName}</p>
              
              <div style="margin-top: 16px;">
                <div class="info-label">Team Name</div>
                <p class="info-value">${teamName}</p>
              </div>

              <div style="margin-top: 16px;">
                <div class="info-label">Team ID</div>
                <p class="info-value" style="color: #4f46e5; letter-spacing: 1px;">${teamId}</p>
              </div>
            </div>
            
            <p class="text-body">
              Please make sure to arrive at the venue 15 minutes prior to the scheduled time. Bring your college ID and any required equipment mentioned in the event guidelines.
            </p>
            
            <p class="text-body" style="margin-top: 32px;">
              Best regards,<br>
              <strong>Coding Club RSCOE Team</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p class="footer-text">
              &copy; ${new Date().getFullYear()} Coding Club RSCOE. All rights reserved.<br>
              JSPM's RSCOE, Pune, Maharashtra
            </p>
          </div>
        </div>
      </td>
      <td>&nbsp;</td>
    </tr>
  </table>
</body>
</html>
    `;

    const mailOptions = {
      from: `"Codigo 4.0 Info" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Registration Confirmed: ${eventName}`,
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Confirmation email sent successfully'
    });

  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      message: error.message || 'Internal Server Error'
    });
  }
}
