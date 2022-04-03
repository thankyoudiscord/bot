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
}
