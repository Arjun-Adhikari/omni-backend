export function notFound(req, res) {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
    data: null,
  });
}
