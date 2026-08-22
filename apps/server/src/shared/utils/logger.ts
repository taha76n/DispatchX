import winston from "winston";
import { config } from "../../configs/index.js";

const { combine, timestamp, errors, json } = winston.format;

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    json()
  ),
  transports: [new winston.transports.Console()],
});