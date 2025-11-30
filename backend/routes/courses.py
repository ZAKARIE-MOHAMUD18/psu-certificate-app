from flask import Blueprint, request, jsonify
from extensions import db
from models import Course
from flask_jwt_extended import jwt_required

courses_bp = Blueprint("courses", __name__, url_prefix="/admin")

# ---------------------------------------------------------
# GET ALL COURSES
# ---------------------------------------------------------
@courses_bp.route("/courses", methods=["GET"])
def get_courses():
    courses = Course.query.all()
    return jsonify([{"id": c.id, "title": c.title} for c in courses])


# ---------------------------------------------------------
# ADD NEW COURSE (Admin only)
# ---------------------------------------------------------
@courses_bp.route("/courses", methods=["POST"])
@jwt_required()
def add_course():
    data = request.get_json() or {}
    title = data.get("title")

    if not title:
        return jsonify({"message": "Course title is required"}), 400

    if Course.query.filter_by(title=title).first():
        return jsonify({"message": "Course already exists"}), 400

    course = Course(title=title)
    db.session.add(course)
    db.session.commit()

    return jsonify({"message": "Course added successfully", "id": course.id})


# ---------------------------------------------------------
# DELETE COURSE (Admin only)
# ---------------------------------------------------------
@courses_bp.route("/courses/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_course(id):
    course = Course.query.get(id)

    if not course:
        return jsonify({"message": "Course not found"}), 404

    db.session.delete(course)
    db.session.commit()

    return jsonify({"message": "Course deleted successfully"})
