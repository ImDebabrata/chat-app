import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // or specify a more precise type based on your decoded token
    }
  }
} 