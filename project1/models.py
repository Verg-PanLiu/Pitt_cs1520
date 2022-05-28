# CS1520 Project1
# Pan Liu (pal81)

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Separate table that contains the attendee id and corresponding event id to help us establish many-to-many relationship.
attend = db.Table('attend',
                  db.Column('attendee_id', db.Integer, db.ForeignKey('user.user_id')),
                  db.Column('attend_event_id', db.Integer, db.ForeignKey('event.event_id'))
                  )

# User class that contains user id, username, hashed password, event-host relation and event-attend relation
class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(24), nullable=False)
    password = db.Column(db.String(64), nullable=False)

    events = db.relationship('Event', backref='host')

    attend = db.relationship('Event', secondary = attend,
                              backref=db.backref('attended_by', lazy='dynamic'), lazy='dynamic')

    def __init__(self, username, password):
        self.username = username
        self.password = password

    def __repr__(self):
        return '<User {}>'.format(self.username)


# Event class that contains event id, host id, event title, event description, start date&time and end date&time.
class Event(db.Model):
    event_id = db.Column(db.Integer, primary_key=True)
    host_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    title = db.Column(db.String(64), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)

    def __init__(self, host_id, title, description,start_date, end_date):
        self.host_id = host_id
        self.title = title
        self.description = description
        self.start_date = start_date
        self.end_date = end_date

    def __repr__(self):
        return '<Event {}'.format(self.event_id)