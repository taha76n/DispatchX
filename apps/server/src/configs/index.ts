import "dotenv/config";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is missing`);
  }
  return value;
}

export const config = {
  MONGO_URI: getEnv("MONGO_URI"),
  PORT: getEnv("PORT"),
  NODE_ENV: getEnv("NODE_ENV") || "development",
  LOG_LEVEL: getEnv("LOG_LEVEL") || "debug",
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  REDIS_URL: getEnv("REDIS_URL"),
  SMTP_USER: getEnv("SMTP_USER"),
  SMTP_PASS: getEnv("SMTP_PASS"),
  RABBITMQ_URL: getEnv("RABBITMQ_URL")
};
