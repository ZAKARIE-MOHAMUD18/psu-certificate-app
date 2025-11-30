from extensions import db
from datetime import datetime

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f"<Admin {self.username}>"


class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), unique=True, nullable=False)

    def __repr__(self):
        return f"<Course {self.title}>"


class Certificate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(100), nullable=False)
    student_id = db.Column(db.String(50), nullable=False, unique=True)

    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    course = db.relationship("Course")

    certificate_number = db.Column(db.String(50), unique=True)
    issue_date = db.Column(db.DateTime, default=datetime.utcnow)

    pdf_path = db.Column(db.String(200))
    qrcode_path = db.Column(db.String(200))

    def __repr__(self):
        return f"<Certificate {self.student_name} - {self.certificate_number}>"
