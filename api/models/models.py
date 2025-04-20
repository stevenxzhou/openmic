from datetime import datetime
from enum import Enum
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.mysql import JSON

db = SQLAlchemy()

class UserRole(str, Enum):
    ADMIN = "Admin"
    HOST = "Host"
    GUEST = "Guest"

class UserType(str, Enum):
    INDIVIDUAL = "Individual"
    GROUP = "Group"

class PerformanceStatus(str, Enum):
    PENDING = "Pending"
    CANCELED = "Canceled"
    COMPLETED = "Completed"

class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    primary_social_media = db.Column(db.String(100))
    primary_social_media_alias = db.Column(db.String(100))
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)
    user_type = db.Column(db.Enum(UserType), default=UserType.INDIVIDUAL)
    role = db.Column(db.Enum(UserRole), default=UserRole.GUEST)
    email = db.Column(db.String(100), unique=True, nullable=False)
    
    performances = db.relationship('Performance', backref='user', lazy='dynamic')

class Event(db.Model):
    __tablename__ = 'events'
    
    event_id = db.Column(db.Integer, primary_key=True)
    event_start_datetime = db.Column(db.DateTime, nullable=False)
    event_end_datetime = db.Column(db.DateTime, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    
    performances = db.relationship('Performance', backref='event', lazy='dynamic')

class Performance(db.Model):
    __tablename__ = 'performances'
    
    performance_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.event_id'), nullable=False)
    performance_index = db.Column(db.Integer, nullable=False)
    songs = db.Column(JSON)  # Changed to MySQL JSON type to store list of strings
    status = db.Column(db.Enum(PerformanceStatus), default=PerformanceStatus.PENDING) 