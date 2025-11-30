from flask import Blueprint, jsonify
from models import Certificate

stats_bp = Blueprint("stats", __name__)

@stats_bp.route("/admin/stats", methods=["GET"])
def get_stats():
    total_certificates = Certificate.query.count()
    return jsonify({"certificates": total_certificates})
