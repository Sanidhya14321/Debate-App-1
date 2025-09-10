// middleware/errorHandler.js
export default function errorHandler(err, req, res, next) {
  console.error("[Error Handler]", err?.message || err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
}
