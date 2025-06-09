-- db/seed.sql

-- 0) Make sure we’re in the right database
CREATE DATABASE IF NOT EXISTS twitter_clone;
USE twitter_clone;

-- 1) 25 dummy profiles
SET @i := 0;
INSERT INTO profiles (username, password_hash, display_name, bio)
SELECT
  CONCAT('user', @i := @i + 1)       AS username,
  ''                                 AS password_hash,
  CONCAT('User ', @i)                AS display_name,
  CONCAT('This is bio for user ', @i)AS bio
FROM information_schema.columns
LIMIT 25;

-- 2) 200 dummy tweets
SET @j := 0;
INSERT INTO tweets (author_id, content, created_at)
SELECT
  FLOOR(RAND()*25) + 1                          AS author_id,
  CONCAT('Tweet #', @j := @j+1,
         ' from user', FLOOR(RAND()*25)+1)       AS content,
  NOW() - INTERVAL FLOOR(RAND()*30) DAY         AS created_at
FROM information_schema.columns
LIMIT 200;

-- 3) ~150 follows (no self-follow, duplicates ignored)
INSERT IGNORE INTO follows (follower_id, followee_id, followed_at)
SELECT
  t.follower_id,
  t.followee_id,
  NOW() - INTERVAL FLOOR(RAND()*20) DAY
FROM (
  SELECT
    FLOOR(RAND()*25)+1 AS follower_id,
    FLOOR(RAND()*25)+1 AS followee_id
  FROM information_schema.columns
  LIMIT 150
) AS t
WHERE t.follower_id <> t.followee_id;

-- 4) ~80 blocks (no self-block, duplicates ignored)
INSERT IGNORE INTO blocks (blocker_id, blocked_id, blocked_at)
SELECT
  t.blocker_id,
  t.blocked_id,
  NOW() - INTERVAL FLOOR(RAND()*15) DAY
FROM (
  SELECT
    FLOOR(RAND()*25)+1 AS blocker_id,
    FLOOR(RAND()*25)+1 AS blocked_id
  FROM information_schema.columns
  LIMIT 80
) AS t
WHERE t.blocker_id <> t.blocked_id;

-- 5) ~500 likes (duplicates ignored)
INSERT IGNORE INTO likes (profile_id, tweet_id, liked_at)
SELECT
  FLOOR(RAND()*25)+1,
  FLOOR(RAND()*200)+1,
  NOW() - INTERVAL FLOOR(RAND()*30) HOUR
FROM information_schema.columns
LIMIT 500;

-- 6) ~300 retweets (duplicates ignored)
INSERT IGNORE INTO retweets (profile_id, tweet_id, retweeted_at)
SELECT
  FLOOR(RAND()*25)+1,
  FLOOR(RAND()*200)+1,
  NOW() - INTERVAL FLOOR(RAND()*30) HOUR
FROM information_schema.columns
LIMIT 300;

-- 7) 400 comments
SET @k := 0;
INSERT INTO comments (profile_id, tweet_id, content, created_at)
SELECT
  FLOOR(RAND()*25)+1,
  FLOOR(RAND()*200)+1,
  CONCAT('Comment #', @k := @k+1),
  NOW() - INTERVAL FLOOR(RAND()*20) DAY
FROM information_schema.columns
LIMIT 400;

-- 8) Sanity check
SELECT
  (SELECT COUNT(*) FROM profiles)   AS total_profiles,
  (SELECT COUNT(*) FROM tweets)     AS total_tweets,
  (SELECT COUNT(*) FROM follows)    AS total_follows,
  (SELECT COUNT(*) FROM blocks)     AS total_blocks,
  (SELECT COUNT(*) FROM likes)      AS total_likes,
  (SELECT COUNT(*) FROM retweets)   AS total_retweets,
  (SELECT COUNT(*) FROM comments)   AS total_comments;
