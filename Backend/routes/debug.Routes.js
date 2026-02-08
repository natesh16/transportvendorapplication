const router = require("express").Router();

router.get("/env", (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    port: process.env.PORT
  });
});

module.exports = router;
