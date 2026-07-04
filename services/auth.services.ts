import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";
import { generateToken } from "../utils/jwt";

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string
  ) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new Error("EMAIL_EXISTS");
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

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  static async login(email: string, password: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = generateToken(user.id);

    return { token };
  }

  static async getMe(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}