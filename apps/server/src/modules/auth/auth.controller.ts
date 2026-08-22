import { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { logger } from "../../shared/utils/logger.js";

const Register = async (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;
  let {role} = req.body;

  const roles: string[] = ["customer", "restaurant", "rider"];

  if (role) {
    role = role.toLowerCase();
  }

  if (!roles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role can only be customer, restaurant, rider",
    });
  }

  if (!name || !email || !password || !confirmPassword || !role) {
    return res.status(400).json({
      success: false,
      message:
        "Name, Email, Password, Confirm Password and Role are required to register",
    });
  }

  if (typeof name !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Name should be of type string" });
  }

  if (typeof email !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Email should be of type string" });
  }
  if (typeof password !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Password should be of type string" });
  }
  if (typeof confirmPassword !== "string") {
    return res.status(400).json({
      success: false,
      message: "Confirm Password should be of type string",
    });
  }

  if (password.length < 8 || confirmPassword.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password should be atleast eight chracters long",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Password and confirm password should be same",
    });
  }

  const { user, verificationUrl } = await authService.Register(
    name,
    email,
    password,
    role
  );

  return res.status(201).json({
    success: true,
    message: "User Registered Successfully",
    user,
    verificationUrl,
  });
};

interface verifyParams {
  token: string;
}

const Verify = async (req: Request<verifyParams>, res: Response) => {
  const token = req.params.token;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Verification token is required" });
  }

  const { user, accessToken, refreshToken } = await authService.Verify(token);

  return res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .status(200)
    .json({
      success: true,
      message: "User Verified Successfully",
      user,
      accessToken,
      refreshToken,
    });
};

const Login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  logger.info(email, password)

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and Password are required to register",
    });
  }

  if (typeof email !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Email should be of type string" });
  }
  if (typeof password !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Password should be of type string" });
  }

  const { user, accessToken, refreshToken } = await authService.Login(
    email,
    password
  );

  return res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .status(200)
    .json({
      success: true,
      message: "User Logged in Successfully",
      user,
      accessToken,
    });
};

const userProfile = async (req: Request, res: Response) => {
  const userId = req._id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "UserId is required",
    });
  }

  const user = await authService.userProfile(userId);

  return res
    .status(200)
    .json({ success: true, message: "User Fetched Successfully", user });
};

const Logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({success: false, message: "Refresh token is required for logout"})
  }

  await authService.Logout(refreshToken);

  return res.
  clearCookie("accessToken").
  clearCookie("refreshToken").
  status(200).json({success: true, message: "Logout Successfull"})
};

const rotateRefreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(400)
      .json({
        success: false,
        message:
          "Refresh Token is required for successful refresh token rotation",
      });
  }

  const {newAccessToken, newRefreshToken, newRefreshTokenDocument} = await authService.rotateRefreshToken(refreshToken);

  return res
  .cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000
  })
  .cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
  .status(200)
  .json({ success: true, message: "Refresh Token is rotated successfully", newAccessToken, newRefreshToken, newRefreshTokenDocument });
};

export const authController = {
  Register,
  Verify,
  Login,
  userProfile,
  rotateRefreshToken,
  Logout,
};
