/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcryptjs";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../shared/utils/error.js";
import { User } from "./user.model.js";
import {
  generateAccessToken,
  generateHashRefreshToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../shared/utils/generateToken.js";
import {
  generateVerificationToken,
  verifyVerificationToken,
} from "../../shared/utils/otp.js";
import { Role } from "@dispatchx/shared";
import { RefreshToken } from "./refreshToken.model.js";
import { logger } from "../../shared/utils/logger.js";
import { verificationEmailTemplate } from "../../shared/utils/emailTemplates.js";
import { publishToQueue } from "../../configs/rabbitmq.js";

const Register = async (
  name: string,
  email: string,
  password: string,
  role: Role
) => {
  const existingUser = await User.findOne({ email }).select("-hashedPassword");

  if (existingUser?.isVerified === true) {
    throw new BadRequestError(
      "User is already registered with this email. Please Login"
    );
  }

  if (existingUser?.isVerified === false) {
    await User.deleteOne({ email });
    throw new BadRequestError("Please Register Again");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name,
    email: email,
    hashedPassword: hashedPassword,
    role: role,
    isVerified: false,
  });

  const verificationUrl = await generateVerificationToken(email);

  const msg = {
    to: email,
    subject: "Account Verification URL",
    text: verificationUrl,
    html: verificationEmailTemplate({name, verificationUrl})
  }

  publishToQueue("verification-email-queue", msg)
  logger.info(verificationUrl)

  return { user, verificationUrl };
};

const Verify = async (token: string) => {
  const email = await verifyVerificationToken(token);
  const user = await User.findOne({ email }).select("-hashedPassword");

  if (!user) {
    throw new NotFoundError("User does not exist. Please Register");
  }

  user.isVerified = true;

  await user?.save();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const refreshTokenHash = generateHashRefreshToken(refreshToken);

  const sessionId = crypto.randomUUID();

  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const refreshTokenDocument = await RefreshToken.create({
    tokenHash: refreshTokenHash,
    userId: user._id,
    sessionId: sessionId,
    expiresAt: sevenDaysFromNow,
    isUsed: false,
  });

  return { user, accessToken, refreshToken, refreshTokenDocument };
};

const Login = async (email: string, password: string) => {
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new BadRequestError("Invalid email or password"); //to prevent hackers from guessing is the email in use or not
  }

  if (existingUser.isVerified === false) {
    throw new BadRequestError("User is not verified. Please register again");
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.hashedPassword
  );

  if (!isPasswordCorrect) {
    throw new BadRequestError("Invalid email or password"); //to prevent hackers from guessing is the email in use or not
  }

  const accessToken = generateAccessToken(existingUser);
  const refreshToken = generateRefreshToken(existingUser);

  const refreshTokenHash = generateHashRefreshToken(refreshToken);

  const sessionId = crypto.randomUUID();

  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const refreshTokenDocument = await RefreshToken.create({
    tokenHash: refreshTokenHash,
    userId: existingUser._id,
    sessionId: sessionId,
    expiresAt: sevenDaysFromNow,
    isUsed: false,
  });

  const safeUser = {
    _id: existingUser._id,
    name: existingUser.name,
    email: existingUser.email,
    role: existingUser.role,
  };

  return { user: safeUser, accessToken, refreshToken, refreshTokenDocument };
};

const userProfile = async (userId: string) => {
  const user = await User.findById(userId).select("-hashedPassword");

  if (!user) {
    throw new NotFoundError("User with this id does not exist");
  }

  return user;
};

const rotateRefreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = verifyRefreshToken(refreshToken);

  if (!verifiedRefreshToken) {
    throw new UnauthorizedError("Refresh token is expired or invalid");
  }

  const hashedRefreshToken = generateHashRefreshToken(refreshToken);

  const refreshTokenDocument = await RefreshToken.findOne({
    tokenHash: hashedRefreshToken,
  });

  if (!refreshTokenDocument) {
    throw new UnauthorizedError("Refresh token is expired or invalid");
  }

  if (refreshTokenDocument.expiresAt < new Date()) {
    throw new UnauthorizedError("Refresh token is expired or invalid");
  }

  if (refreshTokenDocument && refreshTokenDocument.isUsed === true) {
    const sessionId = refreshTokenDocument.sessionId;

    await RefreshToken.deleteMany({ sessionId });

    throw new UnauthorizedError("Refresh token was reused. Please login again");
  }

  refreshTokenDocument.isUsed = true;

  await refreshTokenDocument.save();

  const user = await User.findById(refreshTokenDocument.userId);

  if (!user) {
    throw new UnauthorizedError("User not found. Please login again");
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  const refreshTokenHash = generateHashRefreshToken(newRefreshToken);

  const sessionId = refreshTokenDocument.sessionId;

  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const newRefreshTokenDocument = await RefreshToken.create({
    tokenHash: refreshTokenHash,
    userId: user._id,
    sessionId: sessionId,
    expiresAt: sevenDaysFromNow,
    isUsed: false,
  });

  return { newAccessToken, newRefreshToken };
};

const Logout = async (refreshToken: string) => {
  const verifiedRefreshToken = verifyRefreshToken(refreshToken);

  if (!verifiedRefreshToken) {
    throw new UnauthorizedError("Refresh token is expired or invalid");
  }

  const hashedRefreshToken = generateHashRefreshToken(refreshToken);

  const refreshTokenDocument = await RefreshToken.findOne({
    tokenHash: hashedRefreshToken,
  });

  if (!refreshTokenDocument) {
    throw new UnauthorizedError("Refresh token is expired or invalid");
  }

  if (refreshTokenDocument) {
    const sessionId = refreshTokenDocument.sessionId;

    await RefreshToken.deleteMany({ sessionId });
  }
};

export const authService = {
  Register,
  Verify,
  Login,
  userProfile,
  rotateRefreshToken,
  Logout,
};
