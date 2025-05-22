from models import User, UserRole, UserType

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