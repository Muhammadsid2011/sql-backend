import { Request, Response } from "express";
import { AuthService } from "../services/auth.services";
import { COOKIE_OPTIONS } from "../utils/cookie";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields are required.",
        });
      }

      const { token, user } = await AuthService.register(
        name,
        email,
        password
      );

      res.cookie("token", token, COOKIE_OPTIONS);

      return res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error(error);

      if (error instanceof Error && error.message === "EMAIL_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Email already exists.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required.",
        });
      }

      const { token } = await AuthService.login(email, password);

      res.cookie("token", token, COOKIE_OPTIONS);

      return res.json({
        success: true,
        message: "Logged in successfully.",
      });
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error &&
        error.message === "INVALID_CREDENTIALS"
      ) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const user = await AuthService.getMe(req.user!.id);

      return res.json({
        success: true,
        user,
      });
    } catch (error) {
      console.error(error);

      if (error instanceof Error && error.message === "USER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  static logout(req: Request, res: Response) {
    res.clearCookie("token");

    return res.json({
      success: true,
      message: "Logged out successfully.",
    });
  }
}