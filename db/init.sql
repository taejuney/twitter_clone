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
  display_name VARCHAR(60)    NOT NULL,
  bio          TEXT           NULL,
  password_hash VARCHAR(256)  NOT NULL,
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