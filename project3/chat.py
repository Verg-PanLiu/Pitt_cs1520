# Pan Liu Pal81
# Project3
# Due date: 11/09/2020

import json
from flask import Flask, request, url_for, redirect, render_template, flash

app = Flask(__name__)
app.secret_key = 'development key'

rooms = 0    # integer to store room id
user_login = []    # list to store the users that have been logged in 
user_create = []   # list to store the all user accounts
message = []       # list to store all messages
room_id = 0        # store current room id
room_deleted = 0   # store last room that is deleted 

class User:
      def __init__(self, user_name, user_password,rooms,room_entered):
          self.user_name = user_name
          self.user_password = user_password
          self.rooms = rooms
          self.room_entered = room_entered

      def __repr__(self):
        return '<User {}>'.format(self.user_name)

# get new message sent by user
@app.route("/new_message", methods=['POST'])
def get_new_message():
    msg = request.form["msg"]
    n = request.form["id"]
    message[int(n)-1].append(msg)
    return "OK!"

# load the history message
@app.route("/msgs")
def get_msgs():
    return json.dumps(message)

# get deleted-room information
@app.route("/del_room")
def get_del_room():
    return json.dumps(room_deleted)

# function to leave the current chat room
@app.route('/leave/<username>')
def leave(username):
    for x in user_login:
        if username == x.user_name:
            user = x
            break

    user.room_entered = 0

    return redirect(url_for('chat', username = user.user_name))

# function to enter the chat room
@app.route('/chatroom/<username>/<number>')
def enter(username, number):
    for x in user_login:
        if username == x.user_name:
            user = x
            break

    if user.room_entered != 0:
        if user.room_entered != number:
            flash("You have entered this room.")
            return redirect(url_for('enter', username=username, number=user.room_entered))

    user.room_entered = number
    return render_template('chatroom.html', user = user, number = number, message = message)

# fucntion to delete the certain chat room
@app.route('/delete/<username>/<number>')
def delete(username, number):
    global rooms, message, room_deleted
    rooms -= 1
    message[int(number)-1]=[]
    room_deleted = number
    for x in user_create:
        if username == x.user_name:
            x.rooms.remove(int(number))
            break

    for x in user_login:
        if username == x.user_name:
            user = x
            break

    user.rooms.remove(int(number))
    user.room_entered = 0
    return redirect(url_for('chat', username = user.user_name))

# the page that list all the chat rooms
@app.route('/chat/<username>')
def chat(username):
    for x in user_login:
        if username == x.user_name:
            user = x
            break
    user.room_entered = 0
    return render_template('chat.html', users = user_create, user = user, rooms = rooms)

# defalut page
@app.route('/')
def start():
    return render_template('layout.html')

# function to create the chat room 
@app.route('/creation/<username>')
def room_creation(username):
    global room_id, rooms,message
    room_id += 1
    rooms += 1
    message.append([])
    for x in user_login:
        if username == x.user_name:
            x.rooms.append(room_id)
            break
    for x in user_create:
        if username == x.user_name:
            x.rooms.append(room_id)
            break
    return redirect(url_for('chat', username = username))


# function to let user log in
@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if not username:
            error = 'You must enter a valid username! '

        for x in user_login:
            if username == x.user_name:
                error = 'This user already logged in. '

        for x in user_create:
            exist = 0
            if username == x.user_name:
                exist = 1
                if password != x.user_password:
                    error = 'Invalid username/password combination! '
                else:
                    break

        if exist == 0:
            error = 'Invalid username/password combination! '

        if error == None:
            flash('Welcome! You were logged in. ')
            user = User(username,password,[],0)
            user_login.append(user)
            return redirect(url_for('chat', username = user.user_name))
    return render_template('login.html', error=error)

# fucntion to let user create accounts
@app.route('/register', methods=['GET', 'POST'])
def register():
    error = None
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        password2 = request.form['password2']
        if not username:
            error = 'Please enter a username'
        elif not password:
            error = 'Please enter a password'
        elif password != password2:
            error = 'The two passwords do not match. Please try again.'

        for x in user_create:
            if username == x.user_name:
                error = 'Username already exists, please try another one.'

        if error == None:
            flash('Congratulations! You were successfully registered and can login now. ')
            user = User(username,password,[], 0)
            user_create.append(user)
            return redirect(url_for('start'))
    return render_template('register.html', error=error)


# function to let user logout 
@app.route('/logout/<username>')
def logout(username):
    flash('You were logged out. ')
    for x in user_login:
        if username == x.user_name:
           user_login.remove(x)
           break
    return redirect(url_for('start'))

# main
if __name__ == "__main__":
    app.run()

