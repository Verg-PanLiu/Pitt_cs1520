# CS1520 Project1
# Pan Liu (pal81)

import os
from datetime import datetime
from flask import Flask, request, session, url_for, redirect, render_template, abort, g, flash
from werkzeug.security import check_password_hash, generate_password_hash
from models import db, User, Event

# create an event-hosting application
app = Flask(__name__)

# configuration
PER_PAGE = 30
DEBUG = True
SECRET_KEY = 'development key'

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(app.root_path, 'events.db')

app.config.from_object(__name__)
app.config.from_envvar('EVENT_SETTINGS', silent=True)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # here to silence deprecation warning

db.init_app(app)


@app.cli.command('initdb')
def initdb_command():
    db.drop_all()   # clear the old data
    db.create_all() # create the new database
    print('Initialized the database.')


def get_user_id(username):
    """Convenience method to look up the id for a username."""
    rv = User.query.filter_by(username=username).first()
    return rv.user_id if rv else None


@app.before_request
def before_request():
    """ # get the logged-in user """
    g.user = None
    if 'user_id' in session:
        g.user = User.query.filter_by(user_id=session['user_id']).first()


@app.route('/')
def event():
    """A homepage that displays:
       - a list of upcoming events hosted by all users
       - if a user is logged in, display a separate list of upcoming events hosted by the logged in user
       - for both lists above, list the events in descending order of their start date & time"""
    if not g.user:
        return redirect(url_for('all_event'))

    u = User.query.filter_by(user_id=session['user_id']).first()  # get the logged-in user
    events = Event.query.filter(Event.host_id == u.user_id).order_by(Event.start_date.desc()).limit(PER_PAGE).all() # events hosted by logged-in user
    all_events = Event.query.order_by(Event.start_date.desc()).limit(PER_PAGE).all() # all events in the system
    return render_template('homepage.html', events=events, all_events=all_events)


@app.route('/public')
def all_event():
    """Displays the events of all users."""
    return render_template('homepage.html', events=Event.query.order_by(Event.start_date.desc()).limit(PER_PAGE).all())


@app.route('/event_creation')
def event_creation():
    """Create the new event."""
    return render_template('event_creation.html')


@app.route('/add_event', methods=['POST'])
def add_event():
    """Add the new event to the database."""
    if 'user_id' not in session:
        abort(401) # throw the error
    error = None
    if request.method == 'POST':
        if not request.form['title']:
            error = 'Please enter an event title'
        elif not request.form['start_time']:
            error = 'Please enter a start time'
        elif not request.form['end_time']:
            error = 'Please enter an end time'
        elif to_date(request.form.get('start_time')) >= to_date(request.form.get('end_time')):
            error = 'Please enter a valid end time'
        else:
            start_date = to_date(request.form.get('start_time'))   # convert datetime-local to datetime type
            end_date = to_date(request.form.get('end_time'))       # convert datetime-local to datetime type
            db.session.add(
                Event(session['user_id'], request.form['title'], request.form['description'], start_date, end_date)) # add the event to the database
            db.session.commit()  # commit
            flash('Your event has been created! ')
            return redirect(url_for('event'))     # successfully added
        return render_template('event_creation.html', error=error)  # fail to add


@app.route('/register_event/<e_id>', methods=['POST'])
def register_event(e_id=None):
    """allow user to attend the events which are not hosted by them """
    u = User.query.filter_by(user_id=session['user_id']).first()  # get logged-in user
    e = Event.query.filter_by(event_id=e_id).first()       # get the event user want to register
    if request.method == 'POST':
        for user in e.attended_by.all():
            if user.user_id == u.user_id:
                flash('You have already registered for this event. Please choose another one.')
                return redirect(url_for('event'))

        u.attend.append(e)
        db.session.add(u)
        db.session.commit()
        flash('Congratulations! You have successfully registered for the event! ')
        return redirect(url_for('event'))


@app.route('/confirm/<e_id>', methods=['POST'])
def confirm(e_id):
    """ask user to make a confirmation to cancel the event"""
    event = Event.query.filter(Event.event_id == e_id).limit(PER_PAGE).first()  # get the event that user want to cancel
    return render_template('event_cancellation.html', event=event, e_id=e_id)

@app.route('/confirm_cancel/<e_id>', methods=['POST'])
def confirm_cancel(e_id):
    """ confirm the cancellation"""
    return redirect(url_for('delete_event', e_id=e_id))

@app.route('/discard_cancel', methods=['POST'])
def discard_cancel():
    """dscard the cancellation"""
    return redirect(url_for('event'))


@app.route('/delete_event/<e_id>')
def delete_event(e_id):
    """delete the event from database"""
    db.session.query(Event).filter(Event.event_id == e_id).delete()
    db.session.commit()
    flash('Your event has been canceled')
    return redirect(url_for('event'))


def to_date(string):
    """convert datetime-local to datetime type"""
    the_year = string[:4]
    the_month = string[5:7]
    the_day = string[8:10]
    the_hour = string[11:13]
    the_minute = string[14:16]

    return datetime(int(the_year), int(the_month), int(the_day), int(the_hour), int(the_minute))


@app.route('/login', methods=['GET', 'POST'])
def login():
    """let user log in"""
    if g.user:
        return redirect(url_for('event')) # if user has already logged in, return to "my homepage"
    error = None
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form['username']).first()
        if user is None:
            error = 'You must enter a valid username! '
        elif not check_password_hash(user.password, request.form['password']):
            error = 'Invalid username/password combination! '
        else:
            flash('Welcome! You were logged in. ')
            session['user_id'] = user.user_id
            return redirect(url_for('event'))
    return render_template('login.html', error=error)


@app.route('/register', methods=['GET', 'POST'])
def register():
    """Registers the user."""
    if g.user:
        return redirect(url_for('event')) # if the user has already logged in, return to "my homepage"
    error = None
    if request.method == 'POST':
        if not request.form['username']:
            error = 'Please enter a username'
        elif not request.form['password']:
            error = 'Please enter a password'
        elif request.form['password'] != request.form['password2']:
            error = 'The two passwords do not match. Please try again.'
        elif get_user_id(request.form['username']) is not None:
            error = 'The username is already taken. Please try another.'
        else:
            db.session.add(User(request.form['username'], generate_password_hash(request.form['password'])))  # passwords was hashed before being saved to the database
            db.session.commit()   # commit
            session.pop('user_id', None)
            flash('Congratulations! You were successfully registered and can login now. ')
            return redirect(url_for('login'))
    return render_template('register.html', error=error)


@app.route('/logout')
def logout():
    """Logs the user out."""
    flash('You were logged out. ')
    session.pop('user_id', None)
    return redirect(url_for('all_event'))
