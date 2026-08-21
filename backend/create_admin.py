"""
Run this ONCE to seed the default admin account.
Usage:  python create_admin.py
"""
import sys, os
from dotenv import load_dotenv
load_dotenv(override=True)
sys.path.insert(0, os.path.dirname(__file__))

import models, database, auth

db = next(database.get_db())

EMAIL    = os.getenv("SUPER_ADMIN_EMAIL", "ujjwalchauhan671@gmail.com")
PASSWORD = os.getenv("SUPER_ADMIN_PASSWORD", "admin123")
NAME     = os.getenv("SUPER_ADMIN_NAME", "Ujjwal Chauhan")

existing = db.query(models.User).filter(models.User.email == EMAIL).first()
if existing:
    print(f"[INFO] Admin already exists with email: {EMAIL}")
else:
    admin = models.User(
        name     = NAME,
        email    = EMAIL,
        password = auth.hash_password(PASSWORD),
        role     = "admin",
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"[OK] Admin created!  ID={admin.id}  Email={EMAIL}  Password={PASSWORD}")
