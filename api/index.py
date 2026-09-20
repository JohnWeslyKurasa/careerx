import os
import sys

# Ensure backend package is in python search path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app

# Export app for Vercel Serverless Function
__all__ = ["app"]
