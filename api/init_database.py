from models.models import db, User, Event, Performance, UserRole, UserType
from datetime import datetime
from app import create_app

def init_db():
    app = create_app()
    with app.app_context():
        # Drop all tables
        db.drop_all()
        
        # Create all tables
        db.create_all()
        
        # Add test data
        test_user = User(
            username="test_user",
            email="test@example.com",
            role=UserRole.ADMIN,
            user_type=UserType.INDIVIDUAL
        )
        
        db.session.add(test_user)
        db.session.commit()
        
        print("Database initialized successfully!")

if __name__ == "__main__":
    init_db()