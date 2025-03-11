from flask import Blueprint, jsonify, request

performance_bp = Blueprint('performance', __name__)

# Mock data
performances = [
    {
        'id': 1,
        'name': 'Symphony No. 9',
        'artist': 'Orchestra A',
        'date': '2024-03-20',
        'venue': 'Concert Hall 1'
    },
    {
        'id': 2,
        'name': 'Rock Concert',
        'artist': 'Band B',
        'date': '2024-03-25',
        'venue': 'Stadium X'
    }
]

@performance_bp.route('/performances', methods=['GET'])
def get_performances():
    return jsonify(performances)

@performance_bp.route('/performances/<int:id>', methods=['GET'])
def get_performance(id):
    performance = next((p for p in performances if p['id'] == id), None)
    if performance is None:
        return jsonify({'error': 'Performance not found'}), 404
    return jsonify(performance)

@performance_bp.route('/performances', methods=['POST'])
def create_performance():
    data = request.get_json()
    new_performance = {
        'id': len(performances) + 1,
        'name': data.get('name'),
        'artist': data.get('artist'),
        'date': data.get('date'),
        'venue': data.get('venue')
    }
    performances.append(new_performance)
    return jsonify(new_performance), 201

@performance_bp.route('/performances/<int:id>', methods=['PUT'])
def update_performance(id):
    performance = next((p for p in performances if p['id'] == id), None)
    if performance is None:
        return jsonify({'error': 'Performance not found'}), 404
    
    data = request.get_json()
    performance.update({
        'name': data.get('name', performance['name']),
        'artist': data.get('artist', performance['artist']),
        'date': data.get('date', performance['date']),
        'venue': data.get('venue', performance['venue'])
    })
    return jsonify(performance)

@performance_bp.route('/performances/<int:id>', methods=['DELETE'])
def delete_performance(id):
    performance = next((p for p in performances if p['id'] == id), None)
    if performance is None:
        return jsonify({'error': 'Performance not found'}), 404
    
    performances.remove(performance)
    return '', 204 