from models import User, UserRole, UserType
from models import Event
from models import Performance, PerformanceStatus

from datetime import date

def test_create_user():
    user = User(
        email="test@example.com",
        password="securepassword",
        first_name="Test",
        last_name="User",
        role=UserRole.USER,
        user_type=UserType.INDIVIDUAL
    )

    assert user.email == "test@example.com"
    assert user.first_name == "Test"
    assert user.last_name == "User"
    assert user.role == UserRole.USER
    assert user.user_type == UserType.INDIVIDUAL

def test_create_event():
    event = Event(
        start_date=date(2025, 1, 1),
        end_date=date(2025, 1, 2),
        title="title",
        description="description",
        location="location",
    )

    assert event.start_date == date(2025, 1, 1)
    assert event.end_date == date(2025, 1, 2)
    assert event.title == "title"
    assert event.description == "description"
    assert event.location == "location"

def test_create_performance():
    performance = Performance(
        performance_index=1,
        songs=["song1", "song2"],
        status=PerformanceStatus.PENDING
    )
    assert performance.performance_index == 1
    assert performance.songs == ["song1", "song2"]
    assert performance.status == PerformanceStatus.PENDING