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