import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

async def send_feedback_email(feedback_data, quality_score):
    sender_email = os.getenv("sender_email")
    app_password = os.getenv("app_password")
    
    if not sender_email or not app_password:
        print("Email credentials not found. Skipping email.")
        return

    receiver_email = sender_email # For demo, send to self

    message = MIMEMultipart("alternative")
    message["Subject"] = f"New Feedback Received - Quality Score: {quality_score}"
    message["From"] = sender_email
    message["To"] = receiver_email

    text = f"""
    New feedback submitted!
    User Type: {feedback_data.user_type}
    Sentiment: {feedback_data.sentiment}
    Quality Score: {quality_score}
    Time Spent: {feedback_data.time_spent}s
    
    Responses:
    {feedback_data.responses}
    """
    
    html = f"""
    <html>
      <body>
        <h2>New Feedback Received</h2>
        <p><strong>User Type:</strong> {feedback_data.user_type}</p>
        <p><strong>Sentiment:</strong> {feedback_data.sentiment}</p>
        <p><strong>Quality Score:</strong> {quality_score}</p>
        <p><strong>Time Spent:</strong> {feedback_data.time_spent}s</p>
        <h3>Responses:</h3>
        <pre>{feedback_data.responses}</pre>
      </body>
    </html>
    """

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, app_password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        print("Email sent successfully")
    except Exception as e:
        print(f"Failed to send email: {e}")
