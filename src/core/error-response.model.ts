import { RequestInit, Response } from 'node-fetch';

export type ErrorResponse<T> = {
  statusCode: number,
  message: string,
  error: T,
  response: Response,
  options: RequestInit
}