WITH ranked_by_referrals AS (
  SELECT
    referrer_id,
    RANK() OVER (
      ORDER BY COUNT(referrer_id) DESC
    ),
    COUNT(referrer_id) AS referral_count
  FROM signatures
  GROUP BY referrer_id
),
rankings AS (
  SELECT
    ROW_NUMBER() OVER (
      ORDER BY ranked_by_referrals.rank ASC, signatures.created_at ASC
    ) AS position,
    ranked_by_referrals.referral_count,
    users.username,
    users.discriminator,
    users.user_id
  FROM signatures
  INNER JOIN users
  ON signatures.user_id = users.user_id
  INNER JOIN ranked_by_referrals
  ON ranked_by_referrals.referrer_id = signatures.user_id
  ORDER BY ranked_by_referrals.rank ASC, signatures.created_at ASC
)
(SELECT * FROM rankings LIMIT 10)
UNION
(SELECT * FROM rankings WHERE rankings.user_id = '')
ORDER BY position;
