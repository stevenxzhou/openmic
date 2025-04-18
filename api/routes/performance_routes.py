from flask import Blueprint, jsonify, request
from models.models import db, Performance, PerformanceStatus, User, Event  # Import db and User model

performance_bp = Blueprint('performance', __name__, url_prefix='/api')

@performance_bp.route('/performances', methods=['GET'])
def get_performances():
    event_id = request.args.get('event_id', type=int)
    performances = db.session.query(
        Performance.performance_id,
        Performance.songs,
        Performance.status,
        Performance.performance_index,
        User.user_id,
        User.username,
        User.primary_social_media_alias,
        Event.event_id,
        Event.title
    ).join(User, Performance.user_id == User.user_id)\
     .join(Event, Performance.event_id == Event.event_id).all()
    
    performances.sort(key=lambda p: p.performance_index)

    result = [{
        "performance_id": p.performance_id,
        "performance_index": p.performance_index,
        "songs": p.songs,
        "status": p.status.value,
        "user_id": p.user_id,
        "username": p.username,
        "social_media_alias": p.primary_social_media_alias,
        "event_id": p.event_id,
        "event_title": p.title
    } for p in performances if (event_id is None or p.event_id == event_id)]
    
    return jsonify(result)

@performance_bp.route('/performances/<int:id>', methods=['GET'])
def get_performance(id):
    performance = Performance.query.get_or_404(id)
    return jsonify({
        'id': performance.performance_id,
        'user_id': performance.user_id,
        'event_id': performance.event_id,
        'songs': performance.songs,
        'status': performance.status.value
    })

@performance_bp.route('/performances', methods=['POST'])
def create_performance():
    data = request.get_json()
    new_performance = Performance(
        user_id=data.get('user_id'),
        event_id=data.get('event_id'),
        songs=data.get('songs'),
        status=data.get('status'),
        performance_index=data.get('performance_index')
    )

    db.session.add(new_performance)
    db.session.commit()

    return jsonify(new_performance), 201

@performance_bp.route('/performances/<int:id>', methods=['PUT'])
def update_performance(id):
    performance = Performance.query.get_or_404(id)    
    data = request.get_json()
    # Update performance fields
    if 'user_id' in data:
        performance.user_id = data['user_id']
    if 'event_id' in data:
        performance.event_id = data['event_id']
    if 'songs' in data:
        performance.songs = data['songs']
    if 'status' in data:
        performance.status = PerformanceStatus[data['status'].upper()]
    if 'performance_index' in data:
        performance.performance_index = data['performance_index']

    db.session.commit()
    return jsonify({
        'id': performance.performance_id,
        'user_id': performance.user_id,
        'event_id': performance.event_id,
        'songs': performance.songs,
        'status': performance.status.value
    })

@performance_bp.route('/performances/<int:id>', methods=['DELETE'])
def delete_performance(id):
    performance = Performance.query.get_or_404(id)    
    db.session.delete(performance)
    db.session.commit()          
    return '', 204 