from enum import Enum
from db import db
from sqlalchemy.dialects.mysql import JSON

class PerformanceStatus(str, Enum):
    PENDING = "Pending"
    CANCELED = "Canceled"
    COMPLETED = "Completed"

class Performance(db.Model):
    __tablename__ = 'performances'
    
    performance_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.event_id'), nullable=False)
    performance_index = db.Column(db.Integer, nullable=False)
    songs = db.Column(JSON)  # Changed to MySQL JSON type to store list of strings
    status = db.Column(db.Enum(PerformanceStatus), default=PerformanceStatus.PENDING) 