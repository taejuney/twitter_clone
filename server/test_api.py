# server/tests/test_api.py
import os
import json
import pytest

# Before importing your app, force it into TEST mode and point at SQLite-memory
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'

from server.app import app, db

@pytest.fixture
def client():
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": os.getenv('DATABASE_URL'),
        "JWT_ACCESS_TOKEN_EXPIRES": False
    })
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def register(client, username, password):
    return client.post('/register', json={
        'username': username,
        'password': password
    })

def login(client, username, password):
    return client.post('/login', json={
        'username': username,
        'password': password
    })

def auth_header(token):
    return {'Authorization': f'Bearer {token}'}

def test_register_and_login_flow(client):
    # register
    rv = register(client, 'alice', 'password1')
    assert rv.status_code == 201
    assert rv.get_json()['msg'] == 'Account created'

    # duplicate register fails
    rv = register(client, 'alice', 'password1')
    assert rv.status_code == 400

    # login
    rv = login(client, 'alice', 'password1')
    assert rv.status_code == 200
    token = rv.get_json()['access_token']
    assert token

def test_protected_endpoints_require_auth(client):
    rv = client.get('/tweets/feed')
    assert rv.status_code == 401

def test_post_and_get_tweet(client):
    register(client, 'bob', 'password2')
    jwt = login(client, 'bob', 'password2').get_json()['access_token']

    # post a tweet
    rv = client.post('/tweets', headers=auth_header(jwt),
                     json={'content': 'Hello world'})
    assert rv.status_code == 201
    tweet_id = rv.get_json()['tweet_id']

    # fetch feed
    rv = client.get('/tweets/feed', headers=auth_header(jwt))
    feed = rv.get_json()
    assert any(t['id'] == tweet_id and t['content']=='Hello world' for t in feed)

def test_profile_and_follow(client):
    # create two users
    register(client, 'u1', 'password3')
    token1 = login(client, 'u1', 'password3').get_json()['access_token']
    register(client, 'u2', 'password4')
    token2 = login(client, 'u2', 'password4').get_json()['access_token']

    # u1 follows u2
    rv = client.post('/follow/2', headers=auth_header(token1))
    assert rv.status_code == 200

    # get u2’s profile as u1
    rv = client.get('/users/u2', headers=auth_header(token1))
    data = rv.get_json()
    assert data['user']['username'] == 'u2'
    assert data['is_following'] is True

def test_commenting_and_get_comments(client):
    # setup user and tweet
    register(client, 'charlie', 'password5')
    jwt = login(client, 'charlie', 'password5').get_json()['access_token']
    tweet_id = client.post('/tweets', headers=auth_header(jwt),
                           json={'content':'hey'}).get_json()['tweet_id']

    # post a comment
    rv = client.post('/comments', headers=auth_header(jwt),
                     json={'tweet_id': tweet_id, 'content':'nice!'})
    assert rv.status_code == 201
    comment_id = rv.get_json()['comment_id']

    # fetch comments
    rv = client.get(f'/comments?tweet_id={tweet_id}', headers=auth_header(jwt))
    comments = rv.get_json()
    assert any(c['comment_id']==comment_id and c['content']=='nice!' for c in comments)
