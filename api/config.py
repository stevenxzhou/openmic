from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get the DATABASE_URL configuration
DATABASE_URL = os.getenv('DATABASE_URL')

SQLALCHEMY_DATABASE_URI = DATABASE_URL or 'mysql+pymysql://root:root@127.0.0.1:3306/openmic'

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-please-change'
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False 