-- ======================================
-- 1) Create and Use the Database
-- ======================================
CREATE DATABASE IF NOT EXISTS twitter_clone;
USE twitter_clone;

-- ======================================
-- 2) Drop Existing Tables
-- ======================================
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS retweets;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS blocks;
DROP TABLE IF EXISTS follows;
DROP TABLE IF EXISTS tweets;
DROP TABLE IF EXISTS profiles;

-- ======================================
-- 3) Create Tables
-- ======================================
CREATE TABLE profiles (
  profile_id   INT AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(30)    NOT NULL UNIQUE,
  email        VARCHAR(100)   NOT NULL UNIQUE,
  display_name VARCHAR(60)    NOT NULL,
  bio          TEXT           NULL,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tweets (
  tweet_id       INT AUTO_INCREMENT PRIMARY KEY,
  author_id      INT        NOT NULL,
  content        TEXT       NOT NULL,
  created_at     DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_edited_at DATETIME   NULL,
  is_edited      BOOLEAN    NOT NULL DEFAULT FALSE,
  FOREIGN KEY (author_id) REFERENCES profiles(profile_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE follows (
  follower_id  INT NOT NULL,
  followee_id  INT NOT NULL,
  followed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, followee_id),
  FOREIGN KEY (follower_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
  FOREIGN KEY (followee_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
  CHECK (follower_id <> followee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE blocks (
  blocker_id  INT NOT NULL,
  blocked_id  INT NOT NULL,
  blocked_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (blocker_id, blocked_id),
  FOREIGN KEY (blocker_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
  CHECK (blocker_id <> blocked_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE likes (
  like_id    INT AUTO_INCREMENT PRIMARY KEY,
  profile_id INT NOT NULL,
  tweet_id   INT NOT NULL,
  liked_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (profile_id, tweet_id),
  FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
  FOREIGN KEY (tweet_id) REFERENCES tweets(tweet_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE retweets (
  retweet_id  INT AUTO_INCREMENT PRIMARY KEY,
  profile_id  INT NOT NULL,
  tweet_id    INT NOT NULL,
  retweeted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (profile_id, tweet_id),
  FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
  FOREIGN KEY (tweet_id) REFERENCES tweets(tweet_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE comments (
  comment_id  INT AUTO_INCREMENT PRIMARY KEY,
  profile_id  INT NOT NULL,
  tweet_id    INT NOT NULL,
  content     TEXT NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE,
  FOREIGN KEY (tweet_id) REFERENCES tweets(tweet_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ======================================
-- 4) Populate Dummy Data

-- 25 profiles
INSERT INTO profiles (username, email, display_name, bio)
SELECT 
  CONCAT('user', n),
  CONCAT('user', n, '@example.com'),
  CONCAT('User ', n),
  CONCAT('This is bio for user ', n)
FROM (
  SELECT ROW_NUMBER() OVER () AS n
  FROM information_schema.columns
  LIMIT 25
) AS numbers;


-- 200 tweets
INSERT INTO tweets (author_id, content, created_at)
SELECT 
  FLOOR(RAND() * 25) + 1,
  CONCAT('Tweet #', n, ' from user', FLOOR(RAND() * 25) + 1),
  NOW() - INTERVAL FLOOR(RAND() * 30) DAY
FROM (
  SELECT ROW_NUMBER() OVER () AS n
  FROM information_schema.columns
  LIMIT 200
) AS numbers;


-- 150 follows (skip self-follow)
INSERT IGNORE INTO follows (follower_id, followee_id, followed_at)
SELECT f1.id, f2.id, NOW() - INTERVAL FLOOR(RAND() * 20) DAY
FROM (SELECT profile_id AS id FROM profiles) f1, (SELECT profile_id AS id FROM profiles) f2
WHERE f1.id <> f2.id
LIMIT 150;

-- 80 blocks
INSERT IGNORE INTO blocks (blocker_id, blocked_id, blocked_at)
SELECT f1.id, f2.id, NOW() - INTERVAL FLOOR(RAND() * 15) DAY
FROM (SELECT profile_id AS id FROM profiles) f1, (SELECT profile_id AS id FROM profiles) f2
WHERE f1.id <> f2.id
LIMIT 80;


-- 500 likes
INSERT IGNORE INTO likes (profile_id, tweet_id, liked_at)
SELECT FLOOR(RAND() * 25) + 1, FLOOR(RAND() * 200) + 1, NOW() - INTERVAL FLOOR(RAND() * 30) HOUR
FROM (
  SELECT * FROM information_schema.columns LIMIT 500
) AS filler;

-- 300 retweets
INSERT IGNORE INTO retweets (profile_id, tweet_id, retweeted_at)
SELECT FLOOR(RAND() * 25) + 1, FLOOR(RAND() * 200) + 1, NOW() - INTERVAL FLOOR(RAND() * 30) HOUR
FROM (
  SELECT * FROM information_schema.columns LIMIT 300
) AS filler;


-- 400 comments
-- Insert 400 comments using existing tweet IDs
INSERT INTO comments (profile_id, tweet_id, content, created_at)
SELECT 
  p.profile_id,
  t.tweet_id,
  CONCAT('Comment #', ROW_NUMBER() OVER (ORDER BY RAND())),
  NOW() - INTERVAL FLOOR(RAND() * 20) DAY
FROM 
  (SELECT profile_id FROM profiles ORDER BY RAND() LIMIT 400) AS p
JOIN 
  (SELECT tweet_id FROM tweets ORDER BY RAND() LIMIT 400) AS t
LIMIT 400;

-- ======================================
-- 5) Final Sanity Check
-- ======================================
SELECT 
  (SELECT COUNT(*) FROM profiles) AS total_profiles,
  (SELECT COUNT(*) FROM tweets) AS total_tweets,
  (SELECT COUNT(*) FROM follows) AS total_follows,
  (SELECT COUNT(*) FROM blocks) AS total_blocks,
  (SELECT COUNT(*) FROM likes) AS total_likes,
  (SELECT COUNT(*) FROM retweets) AS total_retweets,
  (SELECT COUNT(*) FROM comments) AS total_comments;