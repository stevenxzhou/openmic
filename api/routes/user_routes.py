from datetime import datetime
from flask import Blueprint, jsonify, request
from models import User, UserRole
from db import db
from flask_jwt_extended import decode_token, create_access_token

# Add the '/api' prefix
user_bp = Blueprint('user', __name__, url_prefix='/api')
from datetime import timedelta

ACCESS_TOKEN_MAX_AGE = timedelta(seconds=3600*24*30)

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        "user_id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "primary_social_media": user.primary_social_media,
        "primary_social_media_alias": user.primary_social_media_alias,
        "date_joined": user.date_joined.isoformat(),
        "user_type": user.user_type,
        "role": user.role
    } for user in users]), 200

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        "user_id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "primary_social_media": user.primary_social_media,
        "primary_social_media_alias": user.primary_social_media_alias,
        "date_joined": user.date_joined.isoformat(),
        "user_type": user.user_type,
        "role": user.role
    })

@user_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    
    # Validate role
    role = data.get('role', UserRole.GUEST.value)
    if role not in [r.value for r in UserRole]:
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join([r.value for r in UserRole])}"}), 400
    
    new_user = User(
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        email=data.get('email'),
        primary_social_media=data.get('primary_social_media'),
        primary_social_media_alias=data.get('primary_social_media_alias'),
        user_type=data.get('user_type', 'Individual'),
        role=role
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        "user_id": new_user.user_id,
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "primary_social_media": new_user.primary_social_media,
        "primary_social_media_alias": new_user.primary_social_media_alias,
        "date_joined": new_user.date_joined.isoformat(),
        "user_type": new_user.user_type,
        "role": new_user.role
    }), 201

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    # Validate role if it's being updated
    if 'role' in data and data['role'] not in [r.value for r in UserRole]:
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join([r.value for r in UserRole])}"}), 400
    
    # Update user fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'primary_social_media' in data:
        user.primary_social_media = data['primary_social_media']
    if 'primary_social_media_alias' in data:
        user.primary_social_media_alias = data['primary_social_media_alias']
    if 'user_type' in data:
        user.user_type = data['user_type']
    if 'role' in data:
        user.role = data['role']
    
    db.session.commit()
    
    return jsonify({
        "user_id": user.user_id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "primary_social_media": user.primary_social_media,
        "primary_social_media_alias": user.primary_social_media_alias,
        "date_joined": user.date_joined.isoformat(),
        "user_type": user.user_type,
        "role": user.role
    })

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204 


@user_bp.route('/signup', methods=['POST'])
def signup():
    data = request.form
    
    # Validate role
    role = data.get('role', UserRole.GUEST.value)
    if role not in [r.value for r in UserRole]:
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join([r.value for r in UserRole])}"}), 400
    
    new_user = User(
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        password=data.get('password'),
        email=data.get('email'),
        primary_social_media=data.get('primary_social_media'),
        primary_social_media_alias=data.get('primary_social_media_alias'),
        user_type=data.get('user_type', 'Individual'),
        role=role
    )

    user = User.query.filter_by(email=new_user.email).first()
    if user:
        return jsonify({
            "message": "User already exists!",
        }), 409
    
    db.session.add(new_user)
    db.session.commit()
    
    access_token = create_access_token(new_user.email, expires_delta=ACCESS_TOKEN_MAX_AGE)

    response = jsonify({
        "email": new_user.email,
        "role": new_user.role,
        "authenticated": True,
    })

    response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Strict', max_age=ACCESS_TOKEN_MAX_AGE)
    return response, 201

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.form
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email, password=password).first()
    if not user:
        return jsonify({"message": "User not exists!"}), 401

    access_token = create_access_token(email, expires_delta=ACCESS_TOKEN_MAX_AGE)
    response = jsonify({
        "email": user.email,
        "role": user.role,
        "authenticated": True,
    })
    response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Strict', max_age=ACCESS_TOKEN_MAX_AGE)
    return response, 200

@user_bp.route('/refresh', methods=['POST'])
def refresh():
    access_token = request.cookies.get('access_token') or request.headers.get('Authorization', '').replace('Bearer ', '')
    if not access_token:
        return jsonify({"message": "Missing token"}), 401
    try:
        token_data = decode_token(access_token)
        email = token_data.get('sub')
        user = User.query.filter_by(email=email).first()
        if user:
            new_token = create_access_token(email, expires_delta=ACCESS_TOKEN_MAX_AGE)
            response = jsonify({
                "email": user.email,
                "role": user.role,
                "authenticated": True,
            })
            response.set_cookie('access_token', new_token, httponly=True, secure=True, samesite='Strict', max_age=ACCESS_TOKEN_MAX_AGE)
            return response, 200
    except Exception:
        return jsonify({"message": "Invalid token"}), 401
    
@user_bp.route('/logout', methods=['POST'])
def logout():
    access_token = request.cookies.get('access_token') or request.headers.get('Authorization', '').replace('Bearer ', '')
    response = jsonify({
        "authenticated": False
    })
    if not access_token:
        return response, 200

    response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Strict', max_age=0)
    return response, 200