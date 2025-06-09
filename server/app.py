# server/app.py

from dotenv import load_dotenv
load_dotenv()   # so os.getenv('DATABASE_URL') works

import os
from datetime import datetime, timedelta

from flask import Flask, request, jsonify, abort
from flask_cors import CORS
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

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI']        = os.getenv('DATABASE_URL', 'mysql+pymysql://root@localhost/twitter_clone')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY']                 = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES']       = timedelta(hours=2)

db      = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt     = JWTManager(app)

# simple in-memory token-blacklist
blacklist = set()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    return jwt_payload['jti'] in blacklist

def get_current_user_id():
    return int(get_jwt_identity())

def get_current_user():
    return User.query.get(get_current_user_id())


# -----------------------------------------------------------------------------
# Models (match your MySQL tables exactly, no email column)
# -----------------------------------------------------------------------------

class User(db.Model):
    __tablename__ = 'profiles'

    profile_id      = db.Column(db.Integer, primary_key=True)
    username        = db.Column(db.String(30),  nullable=False, unique=True)
    display_name    = db.Column(db.String(60),  nullable=False)
    bio             = db.Column(db.Text,        nullable=True)
    password_hash   = db.Column(db.String(256), nullable=False)
    # profile_pic_url = db.Column(db.String(256), nullable=False, default='')
    created_at      = db.Column(db.DateTime,    nullable=False, default=datetime.utcnow)

    tweets = db.relationship(
        'Tweet',
        backref='author',
        lazy=True,
        primaryjoin='User.profile_id==Tweet.author_id'
    )

    def check_password(self, pw):
        return check_password_hash(self.password_hash, pw)


class Tweet(db.Model):
    __tablename__ = 'tweets'

    tweet_id       = db.Column(db.Integer, primary_key=True)
    author_id      = db.Column(db.Integer, db.ForeignKey('profiles.profile_id'), nullable=False)
    content        = db.Column(db.Text,    nullable=False)
    created_at     = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    last_edited_at = db.Column(db.DateTime, nullable=True)
    is_edited      = db.Column(db.Boolean,  nullable=False, default=False)


class Follow(db.Model):
    __tablename__ = 'follows'

    follower_id = db.Column(db.Integer, db.ForeignKey('profiles.profile_id'), primary_key=True)
    followee_id = db.Column(db.Integer, db.ForeignKey('profiles.profile_id'), primary_key=True)
    followed_at = db.Column(db.DateTime,  nullable=False, default=datetime.utcnow)


class Block(db.Model):
    __tablename__ = 'blocks'

    blocker_id = db.Column(db.Integer, db.ForeignKey('profiles.profile_id'), primary_key=True)
    blocked_id = db.Column(db.Integer, db.ForeignKey('profiles.profile_id'), primary_key=True)
    blocked_at = db.Column(db.DateTime,  nullable=False, default=datetime.utcnow)


class Like(db.Model):
    __tablename__ = 'likes'

    like_id    = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.profile_id'), nullable=False)
    tweet_id   = db.Column(db.Integer, db.ForeignKey('tweets.tweet_id'),     nullable=False)
    liked_at   = db.Column(db.DateTime,  nullable=False, default=datetime.utcnow)


class Retweet(db.Model):
    __tablename__ = 'retweets'

    retweet_id   = db.Column(db.Integer, primary_key=True)
    profile_id   = db.Column(db.Integer, db.ForeignKey('profiles.profile_id'), nullable=False)
    tweet_id     = db.Column(db.Integer, db.ForeignKey('tweets.tweet_id'),     nullable=False)
    retweeted_at = db.Column(db.DateTime,  nullable=False, default=datetime.utcnow)


class Comment(db.Model):
    __tablename__ = 'comments'

    comment_id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('profiles.profile_id'), nullable=False)
    tweet_id   = db.Column(db.Integer, db.ForeignKey('tweets.tweet_id'),     nullable=False)
    content    = db.Column(db.Text,    nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


# -----------------------------------------------------------------------------
# Auth
# -----------------------------------------------------------------------------

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username     = data.get('username','').strip()
    password     = data.get('password','')
    display_name = data.get('display_name', username)

    if not username or len(username) > 30:
        return jsonify(msg='Username 1–30 chars'), 400
    if User.query.filter_by(username=username).first():
        return jsonify(msg='Username taken'), 400

    if len(password) < 8 or not any(c.isdigit() for c in password) or not any(c.isalpha() for c in password):
        return jsonify(msg='Password must be ≥8 chars with letters & numbers'), 400

    user = User(
      username      = username,
      password_hash = generate_password_hash(password),
      display_name  = display_name
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(msg='Account created'), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username','')).first()
    if not user or not user.check_password(data.get('password','')):
        return jsonify(msg='Bad credentials'), 401

    token = create_access_token(identity=str(user.profile_id))
    return jsonify(access_token=token), 200


@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    blacklist.add(jti)
    return jsonify(msg='Logged out'), 200


# -----------------------------------------------------------------------------
# Profile
# -----------------------------------------------------------------------------

@app.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user = get_current_user()
    data = request.get_json()

    if 'username' in data and data['username'] != user.username:
        if len(data['username']) > 30 or User.query.filter_by(username=data['username']).first():
            return jsonify(msg='Invalid or taken username'), 400
        user.username = data['username']

    user.display_name    = data.get('display_name', user.display_name)
    user.bio             = data.get('bio', user.bio)
    user.profile_pic_url = data.get('profile_pic_url', user.profile_pic_url)
    db.session.commit()
    return jsonify(msg='Profile updated'), 200


@app.route('/users/<string:username>', methods=['GET'])
@jwt_required()
def get_user_profile(username):
    target = User.query.filter_by(username=username).first_or_404()
    me_id  = get_current_user_id()
    is_following = bool(Follow.query.get((me_id, target.profile_id)))

    tweets = Tweet.query \
      .filter_by(author_id=target.profile_id) \
      .order_by(Tweet.created_at.desc()) \
      .all()

    return jsonify({
      "user": {
        "id":              target.profile_id,
        "username":        target.username,
        "display_name":    target.display_name,
        "bio":             target.bio,
        "profile_pic_url": target.profile_pic_url,
        "created_at":      target.created_at.isoformat()
      },
      "is_following": is_following,
      "tweets": [
        {
          "id":          t.tweet_id,
          "content":     t.content,
          "created_at":  t.created_at.isoformat(),
          "is_edited":   t.is_edited
        }
        for t in tweets
      ]
    }), 200


# -----------------------------------------------------------------------------
# Tweets
# -----------------------------------------------------------------------------

@app.route('/tweets', methods=['POST'])
@jwt_required()
def post_tweet():
    data    = request.get_json()
    content = data.get('content','').strip()
    if not content or len(content) > 280:
        return jsonify(msg='Content 1–280 chars'), 400

    t = Tweet(author_id=get_current_user_id(), content=content)
    db.session.add(t)
    db.session.commit()
    return jsonify(msg='Tweet posted', tweet_id=t.tweet_id), 201


@app.route('/tweets/<int:tweet_id>', methods=['PUT'])
@jwt_required()
def edit_tweet(tweet_id):
    t  = Tweet.query.get_or_404(tweet_id)
    me = get_current_user_id()
    if t.author_id != me:
        return jsonify(msg='Forbidden'), 403

    new_c = request.get_json().get('content','').strip()
    if not new_c or len(new_c) > 280:
        return jsonify(msg='Content 1–280 chars'), 400

    t.content        = new_c
    t.is_edited      = True
    t.last_edited_at = datetime.utcnow()
    db.session.commit()
    return jsonify(msg='Tweet updated'), 200


@app.route('/tweets/<int:tweet_id>', methods=['DELETE'])
@jwt_required()
def delete_tweet(tweet_id):
    t = Tweet.query.get_or_404(tweet_id)
    if t.author_id != get_current_user_id():
        return jsonify(msg='Forbidden'), 403
    db.session.delete(t)
    db.session.commit()
    return jsonify(msg='Tweet deleted'), 200


@app.route('/tweets/feed', methods=['GET'])
@jwt_required()
def get_feed():
    me = get_current_user_id()

    blocked      = db.session.query(Block.blocked_id).filter_by(blocker_id=me)
    blocked_back = db.session.query(Block.blocker_id).filter_by(blocked_id=me)

    q = Tweet.query \
         .filter(~Tweet.author_id.in_(blocked.union(blocked_back))) \
         .order_by(Tweet.created_at.desc()) \
         .limit(request.args.get('limit', 50, type=int))

    return jsonify([
      {
        'id':         t.tweet_id,
        'author_id':  t.author_id,
        'author':     t.author.username,
        'content':    t.content,
        'created_at': t.created_at.isoformat(),
        'is_edited':  t.is_edited
      } for t in q
    ]), 200


# -----------------------------------------------------------------------------
# Comments
# -----------------------------------------------------------------------------

@app.route('/comments', methods=['POST'])
@jwt_required()
def create_comment():
    data = request.get_json()
    c = Comment(
      profile_id=get_current_user_id(),
      tweet_id  =data['tweet_id'],
      content   =data['content']
    )
    db.session.add(c)
    db.session.commit()
    return jsonify(msg='Comment created', comment_id=c.comment_id), 201


@app.route('/comments', methods=['GET'])
@jwt_required()
def get_comments():
    tid = request.args.get('tweet_id', type=int)
    if not tid:
        return jsonify(msg='Must provide tweet_id'), 400

    comments = Comment.query \
       .filter_by(tweet_id=tid) \
       .order_by(Comment.created_at.asc()) \
       .all()

    return jsonify([
      {
        'comment_id': c.comment_id,
        'profile_id': c.profile_id,
        'author':     User.query.get(c.profile_id).username,
        'content':    c.content,
        'created_at': c.created_at.isoformat()
      } for c in comments
    ]), 200


# -----------------------------------------------------------------------------
# Follow / Unfollow, Block / Unblock, Like / Unlike, Retweet / Unretweet
# -----------------------------------------------------------------------------
# (unchanged—the model names still match your schema)

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
    f  = Follow.query.get((me, uid))
    if f:
        db.session.delete(f)
        db.session.commit()
    return jsonify(msg='Unfollowed'), 200

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
    b  = Block.query.get((me, uid))
    if b:
        db.session.delete(b)
        db.session.commit()
    return jsonify(msg='User unblocked'), 200

@app.route('/like/<int:tweet_id>', methods=['POST'])
@jwt_required()
def like(tweet_id):
    me = get_current_user_id()
    if not Like.query.get((me, tweet_id)):
        db.session.add(Like(profile_id=me, tweet_id=tweet_id))
        db.session.commit()
    return jsonify(msg='Liked'), 200

@app.route('/unlike/<int:tweet_id>', methods=['POST'])
@jwt_required()
def unlike(tweet_id):
    me = get_current_user_id()
    l  = Like.query.get((me, tweet_id))
    if l:
        db.session.delete(l)
        db.session.commit()
    return jsonify(msg='Unliked'), 200

@app.route('/retweet/<int:tweet_id>', methods=['POST'])
@jwt_required()
def retweet(tweet_id):
    me = get_current_user_id()
    if not Retweet.query.get((me, tweet_id)):
        db.session.add(Retweet(profile_id=me, tweet_id=tweet_id))
        db.session.commit()
    return jsonify(msg='Retweeted'), 200

@app.route('/unretweet/<int:tweet_id>', methods=['POST'])
@jwt_required()
def unretweet(tweet_id):
    me = get_current_user_id()
    r  = Retweet.query.get((me, tweet_id))
    if r:
        db.session.delete(r)
        db.session.commit()
    return jsonify(msg='Unretweeted'), 200


# -----------------------------------------------------------------------------
# Run
# -----------------------------------------------------------------------------

if __name__ == '__main__':
    app.run(debug=True)
