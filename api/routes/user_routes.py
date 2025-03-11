from flask import Blueprint, jsonify, request
from datetime import datetime
from models.models import UserRole  # Import UserRole enum

user_bp = Blueprint('user', __name__)

# Fake data for development
fake_users = [
    {
        "user_id": 1,
        "username": "JohnDoe",
        "primary_social_media": "Instagram",
        "primary_social_media_alias": "@johndoe",
        "date_joined": datetime.utcnow().isoformat(),
        "user_type": "Individual",
        "role": UserRole.GUEST.value  # Added default role
    },
    {
        "user_id": 2,
        "username": "AdminUser",
        "primary_social_media": "Twitter",
        "primary_social_media_alias": "@admin",
        "date_joined": datetime.utcnow().isoformat(),
        "user_type": "Individual",
        "role": UserRole.ADMIN.value
    }
]

@user_bp.route('/users', methods=['GET'])
def get_users():
    return jsonify(fake_users)

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = next((user for user in fake_users if user['user_id'] == user_id), None)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)

@user_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    
    # Validate role
    role = data.get('role', UserRole.GUEST.value)
    if role not in [r.value for r in UserRole]:
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join([r.value for r in UserRole])}"}), 400
    
    new_user = {
        "user_id": len(fake_users) + 1,
        "username": data.get('username'),
        "primary_social_media": data.get('primary_social_media'),
        "primary_social_media_alias": data.get('primary_social_media_alias'),
        "date_joined": datetime.utcnow().isoformat(),
        "user_type": data.get('user_type', 'Individual'),
        "role": role
    }
    fake_users.append(new_user)
    return jsonify(new_user), 201

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = next((user for user in fake_users if user['user_id'] == user_id), None)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    
    # Validate role if it's being updated
    if 'role' in data and data['role'] not in [r.value for r in UserRole]:
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join([r.value for r in UserRole])}"}), 400
    
    user.update({k: v for k, v in data.items() if k != 'user_id'})
    return jsonify(user)

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = next((user for user in fake_users if user['user_id'] == user_id), None)
    if user is None:
        return jsonify({"error": "User not found"}), 404
    
    fake_users.remove(user)
    return '', 204 