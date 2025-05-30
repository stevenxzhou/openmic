from app import create_app
from db import db
from models import User, Event, Performance, PerformanceStatus
import os
import pytest
from datetime import date, datetime

@pytest.fixture
def app():
    app = create_app()
    db_uri = os.environ.get("TEST_DATABASE_URI", "sqlite:///:memory:")
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": db_uri,
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
    })
    db.init_app(app)
    with app.app_context():
        db.drop_all()      # Ensure tables are dropped before creating
        db.create_all()
        # Seed test users
        db.session.add_all([
            User(user_id=1, first_name="Alice", last_name="SS", password="testpassword", email="alice@example.com"),
            User(user_id=2, first_name="Bob", last_name="B", password="bobspassword", email="bob@example.com"),
            Event(event_id=1, event_start_datetime=date(2025, 1, 1), event_end_datetime=date(2025, 1, 2), title="title", description="description",location="location"),
            Performance(user_id=1, event_id=1, performance_index=1, songs=["song1", "song2"], status=PerformanceStatus.PENDING)
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

def test_get_events(client):
    response = client.get("/api/events")
    assert response.status_code == 200
    events = response.get_json()
    assert isinstance(events, list)
    assert len(events) == 1
    assert events[0]["title"] == "title"

def test_post_events(client, app):
    response = client.post("/api/events", json={
        "title": "event title",
        "start_date": "Wed, 01 Jan 2025 00:00:00 GMT",
        "end_date":  "Sat, 01 Feb 2025 00:00:00 GMT",
        "location": "secrete location",
        "description": "2",
    })

    assert response.status_code == 201

    with app.app_context():
        event = Event.query.filter_by(event_id=2).first()
        assert event.title == "event title"
        assert event.location == "secrete location"
        assert event.event_start_datetime == datetime(2025, 1, 1, 0, 0)
    
def test_get_performances(client):
    response = client.get("/api/performances")
    assert response.status_code == 200
    performances = response.get_json()
    assert isinstance(performances, list)
    assert len(performances) == 1
    assert performances[0]["first_name"] == "Alice"

def test_guest_post_performances(client, app):
    response = client.post("/api/performances", json={
        "event_id": "1",
        "first_name": "guest_first_name",
        "last_name": "guest_last_name",
        "primary_social_media": "Instagram",
        "primary_social_media_alias":"guest_social_alias",
        "songs": "['song1', 'song2']",
        "performance_index": "2",
    })
    assert response.status_code == 201

    # Verify data inserted in db 
    performance = response.get_json()
    user_id = performance["user_id"]
    with app.app_context():
        user = User.query.filter_by(user_id=user_id).first()
        assert user.first_name == "guest_first_name"
        assert user.password == "password"

def test_user_post_performances(client, app):
    response = client.post("/api/performances", json={
        "email": "bob@example.com",
        "event_id": "1",
        "songs": "['song1', 'song2']",
        "performance_index": "2",
    })
    assert response.status_code == 201

    # Verify data inserted in db 
    performance = response.get_json()
    user_id = performance["user_id"]
    with app.app_context():
        user = User.query.filter_by(user_id=user_id).first()
        assert user.first_name == "Bob"
        assert user.password == "bobspassword"
