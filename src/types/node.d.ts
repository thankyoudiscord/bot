import '@types/node';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: `${number}`;
      ADDR?: string;
      DISCORD_TOKEN: string;
      DISCORD_PUBLIC_KEY: string;

      POSTGRES_HOST: string;
      POSTGRES_PORT: `${number}`;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DB: string;

      SIGNATURE_ROLE: string;
    }
  }
}
