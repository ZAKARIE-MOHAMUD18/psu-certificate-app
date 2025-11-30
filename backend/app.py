from flask import Flask
from extensions import db, jwt
from flask_cors import CORS
from routes.auth import auth_bp
from routes.courses import courses_bp
from routes.certificates import cert_bp
from models import Admin, Course
from werkzeug.security import generate_password_hash
import os
from routes.stats import stats_bp

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key"

db.init_app(app)
jwt.init_app(app)

CORS(
    app,
    resources={r"/*": {"origins": [
        "http://localhost:5173",
        "https://psu-certificate-verification.netlify.app"
    ]}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)



app.register_blueprint(auth_bp)
app.register_blueprint(courses_bp)
app.register_blueprint(cert_bp)
app.register_blueprint(stats_bp)

# ---------------------------------------------------------
# FIX for Flask: run DB initialization inside app context
# ---------------------------------------------------------
with app.app_context():
    db.create_all()

    # Default admin
    if not Admin.query.filter_by(username="admin").first():
        admin = Admin(
            username="admin", 
            password=generate_password_hash("admin123")
        )
        db.session.add(admin)

    # Default courses
    if Course.query.count() == 0:
        default_courses = ["Computer Science", "Business", "IT", "Engineering"]
        for title in default_courses:
            db.session.add(Course(title=title))

    db.session.commit()

if __name__ == "__main__":
    os.makedirs("static/certificates", exist_ok=True)
    os.makedirs("static/qrcodes", exist_ok=True)
    app.run(debug=True)
