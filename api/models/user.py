from datetime import datetime
from enum import Enum
from db import db

class UserRole(str, Enum):
    ADMIN = "Admin"
    HOST = "Host"
    GUEST = "Guest"

class UserType(str, Enum):
    INDIVIDUAL = "Individual"
    GROUP = "Group"

class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    primary_social_media = db.Column(db.String(100))
    primary_social_media_alias = db.Column(db.String(100))
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)
    user_type = db.Column(db.Enum(UserType), default=UserType.INDIVIDUAL)
    role = db.Column(db.Enum(UserRole), default=UserRole.GUEST)
    email = db.Column(db.String(100), unique=True, nullable=False)
    
    performances = db.relationship('Performance', backref='user', lazy='dynamic')