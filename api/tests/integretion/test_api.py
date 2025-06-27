import os
import pytest
import re
from datetime import date, datetime
from app import create_app
from db import db
from models import User, Event, Performance, PerformanceStatus

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
            Event(event_id=1, start_date=date(2025, 1, 1), end_date=date(2025, 1, 2), title="title", description="description",location="location"),
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

def test_signup_user(client, app):
    response = client.post("/api/signup", data={
        "user_id": 0,
        "first_name": "Test First Name",
        "last_name": "Test Last Name",
        "password": "testpassword",
        "email": "testemail@test.com"
    })
    
    assert response.status_code == 201
    assert response.get_json()["authenticated"] == True

    with app.app_context():
        user = User.query.filter_by(user_id=3).first()
        assert user.user_id == 3
        assert user.first_name == "Test First Name"
        assert user.last_name == "Test Last Name"
        assert user.password == "testpassword"
        assert user.email == "testemail@test.com"

def test_login_user(client):
    response = client.post("/api/login", data={
        "email": "alice@example.com",
        "password": "testpassword"
    })
    
    assert response.status_code == 200
    assert response.get_json()["authenticated"] == True

def test_refresh_user(client):
    response = client.post("/api/login", data={
        "email": "alice@example.com",
        "password": "testpassword"
    })
    
    assert response.status_code == 200
    # Capture access_token from response Set-Cookie header
    set_cookie = response.headers.get("Set-Cookie")
    assert set_cookie is not None, "Set-Cookie header missing"
    match = re.search(r'access_token=([^;]+)', set_cookie)
    assert match, "access_token not found in Set-Cookie"
    access_token = match.group(1)
    assert access_token is not None and len(access_token) > 10, "Access token format is invalid"

    # Call refresh endpoint to extend the token
    refresh_response = client.post("/api/refresh", headers={"Cookie": f"access_token={access_token}"})
    assert refresh_response.status_code == 200
    new_set_cookie = refresh_response.headers.get("Set-Cookie")
    assert new_set_cookie is not None, "Set-Cookie header missing in refresh"
    new_match = re.search(r'access_token=([^;]+)', new_set_cookie)
    assert new_match, "access_token not found in Set-Cookie after refresh"
    new_access_token = new_match.group(1)
    assert new_access_token is not None
    assert new_access_token != access_token

def test_get_events(client):
    response = client.get("/api/events")
    assert response.status_code == 200
    events = response.get_json()
    assert isinstance(events, list)
    assert len(events) == 1
    assert events[0]["title"] == "title"

def test_post_events(client, app):
    response = client.post("/api/events", json={
        "event_id": "0",
        "title": "event title",
        "description": "description",
        "start_date": "Wed, 01 Jan 2025 00:00:00 GMT",
        "end_date":  "Sat, 01 Feb 2025 00:00:00 GMT",
        "location": "secrete location",
    })

    assert response.status_code == 201

    with app.app_context():
        event = Event.query.filter_by(event_id=2).first()
        assert event.event_id == 2
        assert event.title == "event title"
        assert event.description == "description"
        assert event.start_date == datetime(2025, 1, 1, 0, 0)
        assert event.end_date == datetime(2025, 2, 1, 0, 0)
        assert event.location == "secrete location"
    
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
