import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = "llama-3.1-8b-instant"

DATABASE_URL = "sqlite:///./test.db"