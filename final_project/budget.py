# CS1520 Final Project
# Pan Liu (pal81)

import os
from flask import Flask, request, session, url_for, redirect, render_template, abort, g, flash
from werkzeug.security import check_password_hash, generate_password_hash
from models import db, User, Category, Purchase
from flask_restful import reqparse, abort, Api, Resource

# create an event-hosting application
app = Flask(__name__)
api = Api(app)

# configuration
PER_PAGE = 30
DEBUG = True
SECRET_KEY = 'development key'

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(app.root_path, 'budget.db')

app.config.from_object(__name__)
app.config.from_envvar('EVENT_SETTINGS', silent=True)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # here to silence deprecation warning

db.init_app(app)
app.config.update(dict(SEND_FILE_MAX_AGE_DEFAULT=0))

CATEGORY = {
	'cat1': {'category': 'Uncategorized',
              'limit': ''}
}

PURCHASE ={}

def abort_if_cat_doesnt_exist(cat_id):
	if cat_id not in CATEGORY:
		abort(404, message="Category {} doesn't exist".format(cat_id))

def abort_if_purchase_doesnt_exist(purchase_id):
	if purchase_id not in PURCHASE:
		abort(404, message="PURCHASE {} doesn't exist".format(purchase_id))

parser = reqparse.RequestParser()
parser.add_argument('category')
parser.add_argument('limit')
parser.add_argument('spent')
parser.add_argument('name')
parser.add_argument('date')
parser.add_argument('category_belong')

@app.cli.command('initdb')
def initdb_command():
    db.drop_all()   # clear the old data
    db.create_all() # create the new database
    print('Initialized the database.')


def get_user_id(username):
    # Convenience method to look up the id for a username.
    rv = User.query.filter_by(username=username).first()
    return rv.user_id if rv else None


@app.before_request
def before_request():
    g.user = None
    if 'user_id' in session:
        g.user = User.query.filter_by(user_id=session['user_id']).first()


# defalut page
@app.route('/')
def start():
    if g.user:
        return render_template('base.html')
    return render_template('layout.html')

#check user name and password and allow user to log in
@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form['username']).first()
        if user is None:
            error = 'You must enter a valid username! '
        elif not check_password_hash(user.password, request.form['password']):
            error = 'Invalid username/password combination! '
        else:
            session['user_id'] = user.user_id
            return redirect(url_for('start'))
    return render_template('login.html', error=error)

# allow user to sign up
@app.route('/register', methods=['GET', 'POST'])
def register():
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
            return redirect(url_for('start'))
    return render_template('register.html', error=error)

@app.route('/logout')
def logout():
    flash('You were logged out. ')
    session.pop('user_id', None)
    return redirect(url_for('start'))

# category
# shows a single category item and lets you delete a category item
class Category(Resource):
	def get(self, cat_id):
		abort_if_cat_doesnt_exist(cat_id)
		return CATEGORY[cat_id]

	def delete(self, cat_id):
		abort_if_cat_doesnt_exist(cat_id)
		del CATEGORY[cat_id]
		return '', 204

	def put(self, cat_id):
		args = parser.parse_args()
		cat = {'category': args['category'],
                          'limit': args['limit']}
		CATEGORY[cat_id] = cat
		return cat, 201

# CategoryList
# shows a list of all categories, and lets you POST to add new cat
class CategoryList(Resource):
    def get(self):
        return CATEGORY

    def post(self):
        args = parser.parse_args()
        cat_id = int(max(CATEGORY.keys()).lstrip('cat')) + 1
        cat_id = 'cat%i' % cat_id
        CATEGORY[cat_id] = {'category': args['category'],
                          'limit': args['limit']}
        return CATEGORY[cat_id], 201

# purchase
# shows a single purchase item and lets you delete a purchase item
class Purchase(Resource):
	def get(self, purchase_id):
		abort_if_purchase_doesnt_exist(purchase_id)
		return PURCHASE[purchase_id]

	def delete(self, purchase_id):
		abort_if_purchase_doesnt_exist(purchase_id)
		del PURCHASE[purchase_id]
		return '', 204

	def put(self, purchase_id):
		args = parser.parse_args()
		purchase = {'spent': args['spent'],
                    'name':args['name'],
                    'date': args['date'],
                    'category_belong':args['category_belong']}
		PURCHASE[purchase_id] = purchase
		return purchase, 201

# PurchaseList
# shows a list of all purchases, and lets you POST to add new purchase
class PurchaseList(Resource):
    def get(self):
        return PURCHASE

    def post(self):
        args = parser.parse_args()
        print(args)
        if (bool(PURCHASE)):
            purchase_id = int(max(PURCHASE.keys()).lstrip('purchase')) + 1
            purchase_id = 'purchase%i' % purchase_id
        else:
            purchase_id = 'purchase1'
        PURCHASE[purchase_id] = {'spent': args['spent'],
                                 'name':args['name'],
                                 'date': args['date'],
                                 'category_belong':args['category_belong']}
        return PURCHASE[purchase_id], 201


##
## Actually setup the Api resource routing here
##
api.add_resource(CategoryList, '/cats')
api.add_resource(Category, '/cats/<cat_id>')
api.add_resource(PurchaseList, '/purchase')
api.add_resource(Purchase, '/purchase/<purchase_id>')

if __name__ == '__main__':
	app.run(debug=True)
