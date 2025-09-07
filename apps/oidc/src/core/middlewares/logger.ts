import type { NextFunction, Request, Response } from 'express';

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.on('finish', () => {
    if (req.method !== 'OPTIONS') {
      console.log('MCP resource server request coming in', {
        reqBody: req.body,
        reqHeaders: req.headers,
        reqMethod: req.method,
        reqUrl: req.url,
        resHeaders: res.getHeaders(),
        resStatusCode: res.statusCode,
      });
    }
  });
  next();
};
