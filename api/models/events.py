from db import db

class Event(db.Model):
    __tablename__ = 'events'
    
    event_id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    
    performances = db.relationship('Performance', backref='event', lazy='dynamic')