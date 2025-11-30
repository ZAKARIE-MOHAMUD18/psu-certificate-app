from flask import Blueprint, request, jsonify
from extensions import db
from models import Admin
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

auth_bp = Blueprint("auth", __name__, url_prefix="/admin")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    admin = Admin.query.filter_by(username=username).first()

    if not admin:
        return jsonify({"message": "Invalid username or password"}), 401

    if not check_password_hash(admin.password, password):
        return jsonify({"message": "Invalid username or password"}), 401

    token = create_access_token(identity=admin.id)

    return jsonify({"token": token}), 200
