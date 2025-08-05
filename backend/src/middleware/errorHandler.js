const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let error = {
    message: err.message || 'Something went wrong',
    status: err.status || 500
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation failed';
    error.details = err.details || err.message;
  }

  // Database errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        error.status = 409;
        error.message = 'Resource already exists';
        break;
      case '23502': // Not null violation
        error.status = 400;
        error.message = 'Required field missing';
        break;
      case '23503': // Foreign key violation
        error.status = 400;
        error.message = 'Referenced resource not found';
        break;
      case '42P01': // Table doesn't exist
        error.status = 500;
        error.message = 'Database configuration error';
        break;
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.status = 400;
    error.message = 'File too large';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.status = 400;
    error.message = 'Unexpected file field';
  }

  // Rate limiting errors
  if (err.status === 429) {
    error.message = 'Too many requests. Please try again later.';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && error.status === 500) {
    error.message = 'Internal server error';
    delete error.details;
  }

  // Send error response
  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;