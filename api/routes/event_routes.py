from flask import Blueprint, jsonify, request
from models.models import db, Event  # Import db and Event model

event_bp = Blueprint('event', __name__, url_prefix='/api')

@event_bp.route('/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([{
        'id': event.event_id,
        'title': event.title,
        'start_date': event.event_start_datetime.isoformat(),
        'end_date': event.event_end_datetime.isoformat(),
        'location': event.location,
        'description': event.description 
    } for event in events])

@event_bp.route('/events/<int:id>', methods=['GET'])
def get_event(id):
    event = Event.query.get_or_404(id)
    return jsonify({
        'id': event.event_id,
        'title': event.title,
        'start_date': event.event_start_datetime.isoformat(),
        'end_date': event.event_end_datetime.isoformat(),
    })

@event_bp.route('/events', methods=['POST'])
def create_event():
    data = request.get_json()
    new_event = Event(
        title=data.get('title'),
        start_date=data.get('start_date'),
        end_date=data.get('end_date'),
        location=data.get('location'),
        description=data.get('description')
    )

    db.session.add(new_event)
    db.session.commit()

    return jsonify(new_event), 201

@event_bp.route('/events/<int:id>', methods=['PUT'])
def update_event(id):
    event = Event.query.get_or_404(id)    
    data = request.get_json()

    # Update event fields
    if 'title' in data:
        event.title = data['title']
    if 'start_date' in data:
        event.event_start_datetime = data['start_date']
    if 'end_date' in data:
        event.event_end_datetime = data['end_date']

    db.session.commit()
    return jsonify(event)

@event_bp.route('/events/<int:id>', methods=['DELETE'])
def delete_event(id):
    event = Event.query.get_or_404(id)
    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "Event deleted successfully"})