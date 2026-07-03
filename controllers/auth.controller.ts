import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";
import { generateToken } from "../utils/jwt";
import {COOKIE_OPTIONS} from "../utils/cookie"


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

      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const [user] = await db
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
        })
        .returning();

      const token = generateToken(user.id);

      res.cookie("token", token, COOKIE_OPTIONS);

      return res.status(201).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(error);

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

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials.",
        });
      }

      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
      );

      if (!isPasswordCorrect) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials.",
        });
      }

      const token = generateToken(user.id);

      res.cookie("token", token, COOKIE_OPTIONS);

      return res.json({
        success: true,
        message: "Logged in successfully.",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(error);

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