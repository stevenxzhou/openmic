from flask import Blueprint, jsonify, request
from models.models import db, Performance, PerformanceStatus  # Import db and User model

performance_bp = Blueprint('performance', __name__, url_prefix='/api')

@performance_bp.route('/performances', methods=['GET'])
def get_performances():
    performances = Performance.query.all()
    return jsonify([{
        'id': performance.performance_id,
        'user_id': performance.user_id,
        'event_id': performance.event_id,
        'songs': performance.songs,
        'status': performance.status.value
    } for performance in performances])

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
        status=data.get('status')
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