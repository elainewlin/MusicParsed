import rateLimit from "express-rate-limit";

// 1 minute in milliseconds
const ONE_MINUTE = 60 * 1000;

// 1 hour in milliseconds
const ONE_HOUR = 60 * ONE_MINUTE;

// 1 day in milliseconds
const ONE_DAY = 24 * ONE_HOUR;

export const loginLimiter = rateLimit({
  windowMs: ONE_HOUR,
  max: 10,
});

export const signupLimiter = rateLimit({
  windowMs: ONE_DAY,
  max: 10,
});

export const createSongLimiter = rateLimit({
  windowMs: ONE_DAY,
  max: 10,
});

// General purpose API limiter
export const apiLimiter = rateLimit({
  windowMs: ONE_MINUTE,
  max: 10,
});
