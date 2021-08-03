export interface Config {
  serverUrl: string;
}

const { env } = window as any;

export const config: Config = {
  serverUrl: env?.SERVER_URL || '',
};
