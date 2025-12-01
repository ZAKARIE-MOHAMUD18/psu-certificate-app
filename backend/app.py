from flask import Flask, request, make_response
from extensions import db, jwt
from flask_cors import CORS
from routes.auth import auth_bp
from routes.courses import courses_bp
from routes.certificates import cert_bp
from routes.stats import stats_bp
from models import Admin, Course
from werkzeug.security import generate_password_hash
import os

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key"

db.init_app(app)
jwt.init_app(app)

# ✅ Allow both local (for dev) and deployed (for prod) frontends
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",  # Local React dev server
                "https://psu-certificate-verification.netlify.app",  # Deployed frontend
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
    supports_credentials=True,  # ✅ Allow cookies/JWT
)

# ✅ Handle preflight (OPTIONS) requests cleanly
@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = make_response()
        origin = request.headers.get("Origin", "")
        if origin in [
            "http://localhost:5173",
            "https://psu-certificate-verification.netlify.app",
        ]:
            response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Credentials"] = "true"  # ✅ Crucial for login/auth
        return response


# ---------------------------------------------------------
# Register blueprints
# ---------------------------------------------------------
app.register_blueprint(auth_bp)
app.register_blueprint(courses_bp)
app.register_blueprint(cert_bp)
app.register_blueprint(stats_bp)


# ---------------------------------------------------------
# Initialize database with defaults
# ---------------------------------------------------------
with app.app_context():
    db.create_all()

    # Default admin
    if not Admin.query.filter_by(username="admin").first():
        admin = Admin(username="admin", password=generate_password_hash("admin123"))
        db.session.add(admin)

    # Default courses
    if Course.query.count() == 0:
        default_courses = [
            "Computer Science",
            "Business",
            "IT",
            "Engineering",
            "Human Resource",
        ]
        for title in default_courses:
            db.session.add(Course(title=title))

    db.session.commit()


# ---------------------------------------------------------
# Run Flask app
# ---------------------------------------------------------
if __name__ == "__main__":
    os.makedirs("static/certificates", exist_ok=True)
    os.makedirs("static/qrcodes", exist_ok=True)
    app.run(debug=True, port=5000)
