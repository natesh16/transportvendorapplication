app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", env: process.env.NODE_ENV });
});
