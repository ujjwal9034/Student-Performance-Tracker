"""
email_service.py
----------------
Sends welcome / registration emails using Gmail SMTP (TLS).

Configuration via environment variables (or edit the defaults below):
    EMAIL_SENDER   – Gmail address used to send
    EMAIL_PASSWORD – Gmail App Password (NOT your normal Gmail password)
                     Generate one at: myaccount.google.com/apppasswords

If credentials are not set the send is silently skipped so the rest of
the app keeps working even when email is not yet configured.
"""

import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# ── Config ────────────────────────────────────────────────────────────────────
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

from dotenv import load_dotenv
load_dotenv(override=True)

# Set these as environment variables in your .env file
EMAIL_SENDER   = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# ──────────────────────────────────────────────────────────────────────────────


import threading

def _send(to_email: str, subject: str, html_body: str) -> None:
    """Internal helper that sends the email asynchronously in a background thread."""
    def send_task():
        if not EMAIL_SENDER or not EMAIL_PASSWORD:
            print("[email_service] Skipping email – EMAIL_SENDER / EMAIL_PASSWORD not set.")
            return

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = EMAIL_SENDER
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        try:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.ehlo()
                server.starttls()
                server.login(EMAIL_SENDER, EMAIL_PASSWORD)
                server.sendmail(EMAIL_SENDER, to_email, msg.as_string())
            print(f"[email_service] Email sent to {to_email}")
        except Exception as exc:
            # Never crash the main flow because of an email failure
            print(f"[email_service] Failed to send email to {to_email}: {exc}")
            
    # Start the email sending in a background thread
    threading.Thread(target=send_task, daemon=True).start()


# ── Public helpers ─────────────────────────────────────────────────────────────

def send_student_registration_email(name: str, email: str, semester: int) -> None:
    """Send a welcome email to a newly registered / enrolled student."""
    subject = "🎓 Welcome to Student Performance Tracker – You're Enrolled!"
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff;
                  border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                  overflow: hidden;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px;">
            Student Performance Tracker
          </h1>
          <p style="color: #e0e0ff; margin: 8px 0 0;">Academic Excellence Platform</p>
        </div>

        <!-- Body -->
        <div style="padding: 35px 40px;">
          <h2 style="color: #333; margin-top: 0;">Welcome, {name}! 🎉</h2>
          <p style="color: #555; line-height: 1.7;">
            You have been successfully <strong>registered as a Student</strong> on the
            <em>Student Performance Tracker</em> platform.
          </p>

          <div style="background: #f0f4ff; border-left: 4px solid #667eea;
                      border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
            <p style="margin: 0; color: #444;"><strong>📧 Email:</strong> {email}</p>
            <p style="margin: 8px 0 0; color: #444;"><strong>📚 Semester:</strong> {semester}</p>
          </div>

          <p style="color: #555; line-height: 1.7;">
            You can now log in to view your grades, attendance, and course details.
            If you have any questions, please reach out to your administrator.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: linear-gradient(135deg, #667eea, #764ba2);
                               color: #fff; padding: 12px 30px; border-radius: 25px;
                               text-decoration: none; font-weight: bold; font-size: 15px;">
              Go to Portal
            </a>
          </div>

          <p style="color: #888; font-size: 13px; text-align: center; margin-top: 30px;">
            This is an automated message. Please do not reply.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9f9f9; padding: 16px; text-align: center;
                    border-top: 1px solid #eee;">
          <p style="margin: 0; color: #aaa; font-size: 12px;">
            © 2025 Student Performance Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    """
    _send(email, subject, html_body)


def send_teacher_registration_email(name: str, email: str) -> None:
    """Send a welcome email to a newly registered / added teacher."""
    subject = "👨‍🏫 Welcome to Student Performance Tracker – Teacher Account Created!"
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff;
                  border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                  overflow: hidden;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px;">
            Student Performance Tracker
          </h1>
          <p style="color: #d0fff0; margin: 8px 0 0;">Academic Excellence Platform</p>
        </div>

        <!-- Body -->
        <div style="padding: 35px 40px;">
          <h2 style="color: #333; margin-top: 0;">Welcome, {name}! 🎉</h2>
          <p style="color: #555; line-height: 1.7;">
            Your account has been successfully <strong>registered as a Teacher</strong> on the
            <em>Student Performance Tracker</em> platform.
          </p>

          <div style="background: #f0fff8; border-left: 4px solid #11998e;
                      border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
            <p style="margin: 0; color: #444;"><strong>📧 Email:</strong> {email}</p>
            <p style="margin: 8px 0 0; color: #444;"><strong>🔑 Role:</strong> Teacher</p>
          </div>

          <p style="color: #555; line-height: 1.7;">
            You can now log in to manage courses, record attendance, upload marks,
            and track student performance. If you need assistance, please contact
            your administrator.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: linear-gradient(135deg, #11998e, #38ef7d);
                               color: #fff; padding: 12px 30px; border-radius: 25px;
                               text-decoration: none; font-weight: bold; font-size: 15px;">
              Go to Portal
            </a>
          </div>

          <p style="color: #888; font-size: 13px; text-align: center; margin-top: 30px;">
            This is an automated message. Please do not reply.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f9f9f9; padding: 16px; text-align: center;
                    border-top: 1px solid #eee;">
          <p style="margin: 0; color: #aaa; font-size: 12px;">
            © 2025 Student Performance Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
    """
    _send(email, subject, html_body)

def send_password_reset_email(email: str, reset_link: str) -> None:
    subject = "Password Reset Request"
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #38bdf8;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Please click the button below to choose a new password. This link will expire in 15 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{reset_link}" style="background-color: #38bdf8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.8em; color: #888;">
          Student Performance Tracker System<br>
        </p>
      </body>
    </html>
    """
    _send(email, subject, html_body)
