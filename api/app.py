from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from routes import event_bp, performance_bp, user_bp
from config import Config
from flask_jwt_extended import JWTManager
from db import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    JWTManager(app)
    app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this to a strong key

    # Enable CORS for any website
    CORS(app)

    # Register blueprints
    app.register_blueprint(event_bp)
    app.register_blueprint(performance_bp)
    app.register_blueprint(user_bp)

    # Add a test route
    @app.route('/api/test')
    def test():
        return jsonify({'message': 'API is working!'})

    # Add error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({'error': 'Not Found', 'message': 'The requested URL was not found on the server.'}), 404

    return app

app = create_app()

# Initialize database
db.init_app(app)

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5001)