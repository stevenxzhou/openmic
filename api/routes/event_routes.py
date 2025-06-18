from flask import Blueprint, jsonify, request
from db import db
from models import Event  # Import db and Event model
from datetime import datetime

event_bp = Blueprint('event', __name__, url_prefix='/api')

@event_bp.route('/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([{
        'id': event.event_id,
        'title': event.title,
        'start_date': event.start_date.isoformat(),
        'end_date': event.end_date.isoformat(),
        'location': event.location,
        'description': event.description 
    } for event in events])

@event_bp.route('/events/<int:id>', methods=['GET'])
def get_event(id):
    event = Event.query.get_or_404(id)
    return jsonify({
        'id': event.event_id,
        'title': event.title,
        'start_date': event.start_date.isoformat(),
        'end_date': event.end_date.isoformat(),
    })

@event_bp.route('/events', methods=['POST'])
def create_event():
    data = request.get_json()
    new_event = Event(
        title=data.get('title'),
        start_date=datetime.strptime(data.get('start_date'), '%a, %d %b %Y %H:%M:%S GMT'),
        end_date=datetime.strptime(data.get('end_date'), '%a, %d %b %Y %H:%M:%S GMT'),
        location=data.get('location'),
        description=data.get('description')
    )

    db.session.add(new_event)
    db.session.commit()

    # Convert the SQLAlchemy object to a dictionary
    return '', 201

@event_bp.route('/events/<int:id>', methods=['PUT'])
def update_event(id):
    event = Event.query.get_or_404(id)    
    data = request.get_json()

    # Update event fields
    if 'title' in data:
        event.title = data['title']
    if 'start_date' in data:
        event.start_date = data['start_date']
    if 'end_date' in data:
        event.end_date = data['end_date']

    db.session.commit()
    return jsonify(event)

@event_bp.route('/events/<int:id>', methods=['DELETE'])
def delete_event(id):
    event = Event.query.get_or_404(id)
    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event deleted successfully"})