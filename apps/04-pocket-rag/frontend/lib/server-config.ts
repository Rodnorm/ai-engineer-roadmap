const MINIMUM_SECRET_LENGTH = 32;

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export interface ServerConfig {
  backendUrl: string;
  apiKey: string;
  sessionSecret: string;
}

export function getServerConfig(): ServerConfig {
  const sessionSecret = required('POCKET_RAG_SESSION_SECRET');
  if (sessionSecret.length < MINIMUM_SECRET_LENGTH) {
    throw new Error('POCKET_RAG_SESSION_SECRET must contain at least 32 characters');
  }

  return {
    backendUrl: required('BACKEND_URL').replace(/\/+$/, ''),
    apiKey: required('POCKET_RAG_API_KEY'),
    sessionSecret,
  };
}
