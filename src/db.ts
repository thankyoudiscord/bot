import {Client} from 'pg';

export class Database {
  #client: Client;

  constructor() {
    this.#client = new Client({
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    });
  }

  async connect() {
    await this.#client.connect();
  }

  async checkIfUserSigned(userID: string): Promise<boolean> {
    const {rowCount} = await this.#client.query(
      `SELECT 1
      FROM SIGNATURES
      WHERE user_id = $1
      LIMIT 1`,
      [userID]
    );

    return !!rowCount;
  }

  async topNReferralsIncludingUser(
    n: number,
    user: string
  ): Promise<ReferralLeaderboard[]> {
    const {rows} = await this.#client.query<ReferralLeaderboard>(
      `WITH ranked_by_referrals AS (
        SELECT
          referrer_id,
          RANK() OVER (
            ORDER BY COUNT(referrer_id) DESC
          ),
          COUNT(referrer_id) AS referralCount
        FROM signatures
        GROUP BY referrer_id
      ),
      rankings AS (
        SELECT
          ROW_NUMBER() OVER (
            ORDER BY ranked_by_referrals.rank ASC, signatures.created_at ASC
          ) AS position,
          ranked_by_referrals.referralCount,
          users.username,
          users.discriminator,
          users.user_id AS userID
        FROM signatures
        INNER JOIN users
        ON signatures.user_id = users.user_id
        INNER JOIN ranked_by_referrals
        ON ranked_by_referrals.referrer_id = signatures.user_id
        ORDER BY ranked_by_referrals.rank ASC, signatures.created_at ASC
      )
      (SELECT * FROM rankings LIMIT $1)
      UNION
      (SELECT * FROM rankings WHERE rankings.userID = $2)
      ORDER BY position`,
      [n, user]
    );

    return rows;
  }

  async getUserPosition(userID: string): Promise<number | undefined> {
    const {rows, rowCount} = await this.#client.query<{position: number}>(
      `SELECT position
		  FROM (
		  	SELECT
		  		user_id,
		  		ROW_NUMBER() OVER (
		  			ORDER BY created_at
		  		) AS position
		  	FROM signatures
		  )
		  AS ranked
		  WHERE user_id = $1`,
      [userID]
    );

    return rowCount ? rows[0].position : undefined;
  }
}

export interface ReferralLeaderboard {
  position: number;
  referralcount: number;
  userid: string;
  username: string;
  discriminator: string;
}
