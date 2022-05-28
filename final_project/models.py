# CS1520 Final Project
# Pan Liu (pal81)

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(24), nullable=False)
    password = db.Column(db.String(64), nullable=False)

    def __init__(self, username, password):
        self.username = username
        self.password = password

    def __repr__(self):
        return '<User {}>'.format(self.username)

class Category(db.Model):
    categoryID = db.Column(db.String(10), primary_key=True)
    category = db.Column(db.String(30), nullable=False)
    limit = db.Column(db.Integer, nullable=False)

    def __init__(self, category, limit):
        self.category = category
        self.limit = limit

class Purchase(db.Model):
    purchaseID = db.Column(db.String(10), primary_key=True)
    spent = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(30), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    category_belong = db.Column(db.String(30), nullable=False)

    def __init__(self, spent, name, date, category_belong):
        self.spent = spent
        self.name = name
        self.date = date
        self.category_belong = category_belong
