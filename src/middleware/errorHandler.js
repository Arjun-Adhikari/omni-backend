import { AppError } from '../utils/AppError.js';

export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(', ');
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body too large';
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    data: null,
  });
}
