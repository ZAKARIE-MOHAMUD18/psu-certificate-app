import os
from flask import Blueprint, request, jsonify, send_file
from extensions import db
from models import Certificate, Course
from flask_jwt_extended import jwt_required
from reportlab.pdfgen import canvas
import qrcode
from datetime import datetime
import secrets

FRONTEND_URL = "https://psu-certificate-verification.netlify.app"

cert_bp = Blueprint("certificates", __name__, url_prefix="/admin")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "../static")
CERT_DIR = os.path.join(STATIC_DIR, "certificates")
QR_DIR = os.path.join(STATIC_DIR, "qrcodes")
SIGNATURE_DIR = os.path.join(STATIC_DIR, "signatures")

os.makedirs(CERT_DIR, exist_ok=True)
os.makedirs(QR_DIR, exist_ok=True)
os.makedirs(SIGNATURE_DIR, exist_ok=True)


def draw_centered_text(canvas, x, y, text):
    text_width = canvas.stringWidth(text)
    canvas.drawString(x - text_width / 2, y, text)


# ---------------------------------------------------------
# 0. GET ALL CERTIFICATES
# ---------------------------------------------------------
@cert_bp.route("/certificates", methods=["GET"])
@jwt_required()
def get_all_certificates():
    certificates = Certificate.query.all()
    return jsonify([
        {
            "id": cert.id,
            "student_name": cert.student_name,
            "student_id": cert.student_id,
            "course": cert.course.title,
            "issue_date": cert.issue_date.strftime("%Y-%m-%d"),
            "certificate_number": cert.certificate_number,
        }
        for cert in certificates
    ])


# ---------------------------------------------------------
# 1. ISSUE CERTIFICATE
# ---------------------------------------------------------
@cert_bp.route("/certificates", methods=["POST"])
@jwt_required()
def issue_certificate():
    data = request.get_json()
    name = data.get("student_name")
    student_id = data.get("student_id")
    course_id = data.get("course_id")

    if not all([name, student_id, course_id]):
        return jsonify({"message": "Missing required fields"}), 400

    if Certificate.query.filter_by(student_id=student_id).first():
        return jsonify({"message": "Certificate for this student ID already exists"}), 400

    course = Course.query.get(course_id)
    if not course:
        return jsonify({"message": "Invalid course_id"}), 400

    cert_number = "PSU-" + secrets.token_hex(4).upper()

    cert = Certificate(
        student_name=name,
        student_id=student_id,
        course_id=course_id,
        certificate_number=cert_number,
        issue_date=datetime.utcnow(),
    )
    db.session.add(cert)
    db.session.commit()

    # ----------- GENERATE QR CODE ----------
    qr_filename = f"{cert.id}.png"
    qr_path = os.path.join(QR_DIR, qr_filename)

    frontend_url = os.getenv("FRONTEND_URL", FRONTEND_URL).rstrip("/")
    qr_data = f"{frontend_url}/verify/{cert.certificate_number}"
    img = qrcode.make(qr_data)
    img.save(qr_path)

    cert.qrcode_path = qr_filename

    # ----------- GENERATE BEAUTIFUL PDF ----------
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.colors import HexColor, black

    pdf_filename = f"{cert.id}.pdf"
    pdf_path = os.path.join(CERT_DIR, pdf_filename)

    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    # Colors
    psu_blue = HexColor("#0d6efd")
    gold = HexColor("#ffd700")
    dark_blue = HexColor("#003366")

    # Border
    c.setStrokeColor(psu_blue)
    c.setLineWidth(8)
    c.rect(30, 30, width - 60, height - 60)

    c.setStrokeColor(gold)
    c.setLineWidth(3)
    c.rect(45, 45, width - 90, height - 90)

    # Header
    c.setFillColor(psu_blue)
    c.setFont("Helvetica-Bold", 32)
    draw_centered_text(c, width / 2, height - 120, "PUNTLAND STATE UNIVERSITY")

    c.setFillColor(dark_blue)
    c.setFont("Helvetica", 18)
    draw_centered_text(c, width / 2, height - 150, "Garowe, Puntland State of Somalia")

    # Certificate Title
    c.setFillColor(gold)
    c.setFont("Helvetica-Bold", 28)
    draw_centered_text(c, width / 2, height - 220, "CERTIFICATE OF COMPLETION")

    # Decorative line
    c.setStrokeColor(gold)
    c.setLineWidth(2)
    c.line(150, height - 240, width - 150, height - 240)

    # Main text
    c.setFillColor(black)
    c.setFont("Helvetica", 16)
    draw_centered_text(c, width / 2, height - 290, "This is to certify that")

    # Student name (highlighted)
    c.setFillColor(psu_blue)
    c.setFont("Helvetica-Bold", 24)
    draw_centered_text(c, width / 2, height - 330, name.upper())

    # Extended course completion text
    c.setFillColor(black)
    c.setFont("Helvetica", 15)
    draw_centered_text(
        c,
        width / 2,
        height - 370,
        "has successfully completed all the requirements and coursework for the program of study in",
    )

    # Course name
    c.setFillColor(dark_blue)
    c.setFont("Helvetica-Bold", 20)
    draw_centered_text(c, width / 2, height - 410, course.title)

    # Date and certificate info
    c.setFillColor(black)
    c.setFont("Helvetica", 14)
    c.drawString(100, height - 480, f"Date of Issue: {datetime.utcnow().strftime('%B %d, %Y')}")
    c.drawString(100, height - 520, f"Certificate No: {cert_number}")

    # ---------- QR Code Above Signatures ----------
    qr_x = (width / 2) - 60  # center horizontally
    qr_y = 220               # place above signatures
    c.drawImage(qr_path, qr_x, qr_y, width=120, height=120, mask="auto")

    c.setFont("Helvetica", 10)
    draw_centered_text(c, width / 2, qr_y - 15, "Scan to Verify")

    # ---------- Signature Section (using real transparent PNGs) ----------
    pres_sig_path = os.path.join(SIGNATURE_DIR, "president.png")
    dean_sig_path = os.path.join(SIGNATURE_DIR, "dean.png")

    # President Signature (Left)
    if os.path.exists(pres_sig_path):
        c.drawImage(pres_sig_path, 80, 100, width=160, height=70, mask="auto")
    else:
        draw_centered_text(c, 160, 150, "_________________________")

    draw_centered_text(c, 160, 85, "PSU-President")
    draw_centered_text(c, 160, 70, "Puntland State University")

    # Dean Signature (Right)
    if os.path.exists(dean_sig_path):
        c.drawImage(dean_sig_path, width - 260, 100, width=160, height=70, mask="auto")
    else:
        draw_centered_text(c, width - 180, 150, "_________________________")

    draw_centered_text(c, width - 180, 85, "Dean of Faculty")
    draw_centered_text(c, width - 180, 70, "Puntland State University")

    # Footer
    c.setFillColor(psu_blue)
    c.setFont("Helvetica-Oblique", 10)
    draw_centered_text(
        c,
        width / 2,
        50,
        "This certificate is issued by Puntland State University and is valid upon verification",
    )

    c.save()

    cert.pdf_path = pdf_filename
    db.session.commit()

    return (
        jsonify(
            {
                "id": cert.id,
                "certificate_number": cert.certificate_number,
                "qr": qr_filename,
                "pdf": pdf_filename,
            }
        ),
        201,
    )


# ---------------------------------------------------------
# 2. GET CERTIFICATE DETAILS
# ---------------------------------------------------------
@cert_bp.route("/certificates/<int:id>", methods=["GET"])
def get_certificate_details(id):
    cert = Certificate.query.get_or_404(id)
    return jsonify(
        {
            "id": cert.id,
            "student_name": cert.student_name,
            "student_id": cert.student_id,
            "course": cert.course.title,
            "issue_date": cert.issue_date.strftime("%Y-%m-%d"),
            "certificate_number": cert.certificate_number,
            "qr_filename": cert.qrcode_path,
            "pdf_filename": cert.pdf_path,
        }
    )


# ---------------------------------------------------------
# 3. VERIFY CERTIFICATE BY NUMBER (Public)
# ---------------------------------------------------------
@cert_bp.route("/verify-number/<certificate_number>", methods=["GET"])
def verify_certificate_by_number(certificate_number):
    cert = Certificate.query.filter_by(certificate_number=certificate_number).first()
    if not cert:
        return jsonify({"message": "Certificate not found"}), 404

    return jsonify(
        {
            "valid": True,
            "id": cert.id,
            "student_name": cert.student_name,
            "student_id": cert.student_id,
            "course": cert.course.title,
            "issue_date": cert.issue_date.strftime("%Y-%m-%d"),
            "certificate_number": cert.certificate_number,
        }
    )


# ---------------------------------------------------------
# 4. DOWNLOAD PDF
# ---------------------------------------------------------
@cert_bp.route("/certificates/<int:id>/download", methods=["GET"])
def download_certificate(id):
    cert = Certificate.query.get_or_404(id)
    pdf_path = os.path.join(CERT_DIR, cert.pdf_path)
    return send_file(pdf_path, as_attachment=True, download_name=f"certificate_{cert.certificate_number}.pdf")
