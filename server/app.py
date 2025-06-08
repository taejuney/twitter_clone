# app.py
import os
from datetime import datetime, timedelta

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity, get_jwt
)
from werkzeug.security import generate_password_hash, check_password_hash

# -----------------------------------------------------------------------------
# App & Config
# -----------------------------------------------------------------------------

def get_current_user_id():
    return int(get_jwt_identity())

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///twitter_clone.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Simple in-memory token blacklist
blacklist = set()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return jti in blacklist

# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------
class Follow(db.Model):
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    followee_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Block(db.Model):
    blocker_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    blocked_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Like(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    tweet_id = db.Column(db.Integer, db.ForeignKey('tweet.id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Retweet(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    tweet_id = db.Column(db.Integer, db.ForeignKey('tweet.id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class User(db.Model):
    id               = db.Column(db.Integer, primary_key=True)
    username         = db.Column(db.String(80), unique=True, nullable=False)
    password_hash    = db.Column(db.String(128), nullable=False)
    bio              = db.Column(db.String(280), default='')
    profile_pic_url  = db.Column(db.String(256), default='')
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)
    tweets           = db.relationship('Tweet', backref='author', lazy=True)

    # helper
    def check_password(self, pw): return check_password_hash(self.password_hash, pw)

class Tweet(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content    = db.Column(db.String(280), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    #EDITED FLAG TO SHOW IF TWEET WAS EDITED 
    edited     = db.Column(db.Boolean, default=False) 

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def get_current_user():
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)

# -----------------------------------------------------------------------------
# Auth Routes
# -----------------------------------------------------------------------------
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    # enforce username length limit
    username = data.get('username','')
    if len(username) > 80:
        return jsonify(msg='Username must be 80 characters or fewer'), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify(msg='Username taken'), 400
    # password restrictions: min 8 chars, one number, one letter
    pw = data['password']
    if len(pw) < 8 or not any(c.isdigit() for c in pw) or not any(c.isalpha() for c in pw):
        return jsonify(msg='Password must be ≥8 chars with letters & numbers'), 400

    user = User(
        username=data['username'],
        password_hash=generate_password_hash(pw)
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(msg='Account created'), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify(msg='Bad credentials'), 401
    access_token = create_access_token(identity=str(user.id))
    return jsonify(access_token=access_token), 200

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    blacklist.add(jti)
    return jsonify(msg='Logged out'), 200

# -----------------------------------------------------------------------------
# User Profile
# -----------------------------------------------------------------------------
@app.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user = get_current_user()
    data = request.get_json()
    if 'username' in data and data['username'] != user.username:
        if len(data['username']) > 80:
            return jsonify(msg='Username must be 80 characters or fewer'), 400
        if User.query.filter_by(username=data['username']).first():
            return jsonify(msg='Username taken'), 400
        user.username = data['username']
    user.bio = data.get('bio', user.bio)
    user.profile_pic_url = data.get('profile_pic_url', user.profile_pic_url)
    db.session.commit()
    return jsonify(msg='Profile updated'), 200

# -----------------------------------------------------------------------------
# Tweets
# -----------------------------------------------------------------------------
@app.route('/tweets', methods=['POST'])
@jwt_required()
def post_tweet():
    data = request.get_json()
    if len(data['content']) > 280:
        return jsonify(msg='Content exceeds 280 characters'), 400
    tweet = Tweet(user_id=int(get_jwt_identity()), content=data['content'])
    db.session.add(tweet)
    db.session.commit()
    return jsonify(msg='Tweet posted', tweet_id=tweet.id), 201

#EXTRA FEATURE, EDITTING POSTS
@app.route('/tweets/<int:tweet_id>', methods=['PUT'])
@jwt_required()
def edit_tweet(tweet_id):
    tweet = Tweet.query.get_or_404(tweet_id)
    if tweet.user_id != get_current_user_id():
        return jsonify(msg='Forbidden'), 403

    data = request.get_json()
    new_content = data.get('content', '')
    if not new_content:
        return jsonify(msg='Content cannot be empty'), 400
    if len(new_content) > 280:
        return jsonify(msg='Content exceeds 280 characters'), 400

    tweet.content = new_content
    tweet.edited = True
    tweet.created_at = datetime.utcnow() 
    db.session.commit()
    return jsonify(msg='Tweet updated'), 200



@app.route('/tweets/<int:tweet_id>', methods=['DELETE'])
@jwt_required()
def delete_tweet(tweet_id):
    tweet = Tweet.query.get_or_404(tweet_id)
    if tweet.user_id != get_current_user_id():
        return jsonify(msg='Forbidden'), 403
    db.session.delete(tweet)
    db.session.commit()
    return jsonify(msg='Tweet deleted'), 200

@app.route('/tweets/feed', methods=['GET'])
@jwt_required()
def get_feed():
    # get blocks where either direction blocks content
    blocked     = db.session.query(Block.blocked_id).filter_by(blocker_id=get_current_user_id())
    blocked_back= db.session.query(Block.blocker_id).filter(Block.blocked_id==get_current_user_id())
     
    # global feed, minus any tweets from blocked users (both directions)
    q = Tweet.query \
         .filter(~Tweet.user_id.in_(blocked.union(blocked_back))) \
         .order_by(Tweet.created_at.desc()) \
         .limit(int(request.args.get('limit', 50)))
    return jsonify([{
        'id': t.id,
        'author': t.author.username,
        'content': t.content,
        'created_at': t.created_at.isoformat()
    } for t in q])

# alias for refresh
@app.route('/tweets/refresh', methods=['GET'])
@jwt_required()
def refresh_feed():
    return get_feed()

# -----------------------------------------------------------------------------
# Follow / Unfollow
# -----------------------------------------------------------------------------
@app.route('/follow/<int:uid>', methods=['POST'])
@jwt_required()
def follow(uid):
    me = get_current_user_id()
    if me == uid:
        return jsonify(msg='Cannot follow yourself'), 400
    if not Follow.query.get((me, uid)):
        db.session.add(Follow(follower_id=me, followee_id=uid))
        db.session.commit()
    return jsonify(msg='Now following'), 200

@app.route('/unfollow/<int:uid>', methods=['POST'])
@jwt_required()
def unfollow(uid):
    me = get_current_user_id()
    f = Follow.query.get((me, uid))
    if f:
        db.session.delete(f)
        db.session.commit()
    return jsonify(msg='Unfollowed'), 200

# -----------------------------------------------------------------------------
# Block / Unblock
# -----------------------------------------------------------------------------
@app.route('/block/<int:uid>', methods=['POST'])
@jwt_required()
def block(uid):
    me = get_current_user_id()
    if me == uid:
        return jsonify(msg='Cannot block yourself'), 400
    if not Block.query.get((me, uid)):
        db.session.add(Block(blocker_id=me, blocked_id=uid))
        db.session.commit()
    return jsonify(msg='User blocked'), 200

@app.route('/unblock/<int:uid>', methods=['POST'])
@jwt_required()
def unblock(uid):
    me = get_current_user_id()
    b = Block.query.get((me, uid))
    if b:
        db.session.delete(b)
        db.session.commit()
    return jsonify(msg='User unblocked'), 200

# -----------------------------------------------------------------------------
# Like / Unlike
# -----------------------------------------------------------------------------
@app.route('/like/<int:tweet_id>', methods=['POST'])
@jwt_required()
def like(tweet_id):
    me = get_current_user_id()
    if not Like.query.get((me, tweet_id)):
        db.session.add(Like(user_id=me, tweet_id=tweet_id))
        db.session.commit()
    return jsonify(msg='Liked'), 200

@app.route('/unlike/<int:tweet_id>', methods=['POST'])
@jwt_required()
def unlike(tweet_id):
    me = get_current_user_id()
    l = Like.query.get((me, tweet_id))
    if l:
        db.session.delete(l)
        db.session.commit()
    return jsonify(msg='Unliked'), 200

# -----------------------------------------------------------------------------
# Retweet / Unretweet
# -----------------------------------------------------------------------------
@app.route('/retweet/<int:tweet_id>', methods=['POST'])
@jwt_required()
def retweet(tweet_id):
    me = get_current_user_id()
    if not Retweet.query.get((me, tweet_id)):
        db.session.add(Retweet(user_id=me, tweet_id=tweet_id))
        db.session.commit()
    return jsonify(msg='Retweeted'), 200

@app.route('/unretweet/<int:tweet_id>', methods=['POST'])
@jwt_required()
def unretweet(tweet_id):
    me = get_current_user_id()
    r = Retweet.query.get((me, tweet_id))
    if r:
        db.session.delete(r)
        db.session.commit()
    return jsonify(msg='Unretweeted'), 200

# -----------------------------------------------------------------------------
# Run
# -----------------------------------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True)