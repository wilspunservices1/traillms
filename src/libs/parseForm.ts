import { NextRequest } from "next/server";
import multer from "multer";

export const parseForm = (req: NextRequest, middleware: any) => {
  return new Promise<{ fields: any; files: any }>((resolve, reject) => {
    middleware(req as any, {} as any, (err: any) => {
      if (err) reject(err);
      resolve({
        fields: req.body,
        files: (req as any).file ? { file: [(req as any).file] } : {},
      });
    });
  });
};
