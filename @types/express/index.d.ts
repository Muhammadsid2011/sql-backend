import "express";

declare global {
  namespace Express {
    interface User {
      id: number; // or string, depending on your database
    }

    interface Request {
      user?: User;
    }
  }
}

export {};