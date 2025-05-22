import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import pytest
from app import create_app
from db import db
from models import User  

@pytest.fixture
def app():
    app = create_app()
    db_uri = os.environ.get("TEST_DATABASE_URI", "sqlite:///:memory:")
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": db_uri,
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
    })

    with app.app_context():
        db.drop_all()      # Ensure tables are dropped before creating
        db.create_all()
        # Seed test users
        db.session.add_all([
            User(user_id=1, first_name="Alice", last_name="S", password="testpassword", email="alice@example.com"),
            User(user_id=2, first_name="Bob", last_name="B", password="testpassword", email="bob@example.com"),
        ])
        db.session.commit()

    yield app

    # Teardown
    with app.app_context():
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_get_users(client):
    response = client.get("/api/users")
    assert response.status_code == 200
    users = response.get_json()
    assert isinstance(users, list)
    assert len(users) == 2
    assert users[0]["first_name"] == "Alice"
    assert users[1]["first_name"] == "Bob"