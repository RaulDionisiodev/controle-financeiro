declare global {
  namespace Express {
    interface Request {
      usuario?: {
        email: string;
        nome?: string;
      };
    }
  }
}

export {};