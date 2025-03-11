from flask import Blueprint, jsonify, request

event_bp = Blueprint('event', __name__, url_prefix='/api')

# Mock data
events = [
    {
        'id': 1,
        'title': 'Summer Festival',
        'description': 'Annual music festival',
        'start_date': '2024-07-01',
        'end_date': '2024-07-03',
        'location': 'Central Park'
    },
    {
        'id': 2,
        'title': 'Jazz Night',
        'description': 'Evening of jazz music',
        'start_date': '2024-04-15',
        'end_date': '2024-04-15',
        'location': 'Jazz Club'
    }
]

@event_bp.route('/events', methods=['GET'])
def get_events():
    return jsonify(events)

@event_bp.route('/events/<int:id>', methods=['GET'])
def get_event(id):
    event = next((e for e in events if e['id'] == id), None)
    if event is None:
        return jsonify({'error': 'Event not found'}), 404
    return jsonify(event)

@event_bp.route('/events', methods=['POST'])
def create_event():
    data = request.get_json()
    new_event = {
        'id': len(events) + 1,
        'title': data.get('title'),
        'description': data.get('description'),
        'start_date': data.get('start_date'),
        'end_date': data.get('end_date'),
        'location': data.get('location')
    }
    events.append(new_event)
    return jsonify(new_event), 201

@event_bp.route('/events/<int:id>', methods=['PUT'])
def update_event(id):
    event = next((e for e in events if e['id'] == id), None)
    if event is None:
        return jsonify({'error': 'Event not found'}), 404
    
    data = request.get_json()
    event.update({
        'title': data.get('title', event['title']),
        'description': data.get('description', event['description']),
        'start_date': data.get('start_date', event['start_date']),
        'end_date': data.get('end_date', event['end_date']),
        'location': data.get('location', event['location'])
    })
    return jsonify(event)

@event_bp.route('/events/<int:id>', methods=['DELETE'])
def delete_event(id):
    event = next((e for e in events if e['id'] == id), None)
    if event is None:
        return jsonify({'error': 'Event not found'}), 404
    
    events.remove(event)
    return '', 204 