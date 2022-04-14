const express = require("express");
const res = require("express/lib/response");
const { NotFoundError, BadRequestError } = require("../expressError");


const db = require("../db");
const router = new express.Router();

/** GET /companies: get list of companies */
router.get("/", async function (req, res) {
  const results = await db.query(
    'SELECT code, name FROM companies'
  );

  const companies = results.rows;
  return res.json({companies});
});

/** GET /companies/code: get an object of company information for requested company */
router.get("/:code", async function (req, res){
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description FROM companies
    WHERE code = $1`, [code]);
  const [company] = results.rows;

  return res.json({company});
  });








/** DELETE /users/[id]: delete user, return {message: Deleted} */
router.delete("/:id", function (req, res) {
  db.User.delete(req.params.id);
  return res.json({ message: "Deleted" });
});

module.exports = router;