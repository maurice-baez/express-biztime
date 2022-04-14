const express = require("express");

const db = require("../db");
const router = new express.Router();

/** GET /users: get list of companies */
router.get("/", async function (req, res) {
  const results = await db.query(
    'SELECT code, name, description FROM companies'
  )

  const companies = results.rows;
  return res.json({companies});
});

/** DELETE /users/[id]: delete user, return {message: Deleted} */
router.delete("/:id", function (req, res) {
  db.User.delete(req.params.id);
  return res.json({ message: "Deleted" });
});

module.exports = router;