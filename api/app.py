from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from routes.event_routes import event_bp
from routes.performance_routes import performance_bp
from routes.user_routes import user_bp
from models.models import db
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize database
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(event_bp)
    app.register_blueprint(performance_bp)
    app.register_blueprint(user_bp)

    # Create database tables
    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True) 