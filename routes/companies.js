const express = require("express");
const res = require("express/lib/response");
const { NotFoundError } = require("../expressError");


const db = require("../db");
const router = new express.Router();

/** GET /companies: get list of companies */
router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT code, name FROM companies
    ORDER BY name`
  );
  const companies = results.rows;
  return res.json({companies});
});

/** GET /companies/code: get an object of company information for requested company */
router.get("/:code", async function (req, res){
  const code = req.params.code;

  const cResults = await db.query(
    `SELECT code, name, description FROM companies
    WHERE code = $1`, [code]);

  let [company] = cResults.rows;

  const iResults = await db.query(
    `SELECT id, comp_code, amt, paid, add_date, paid_date
    FROM invoices
    WHERE comp_code = $1`, [code]);

  const invoices = iResults.rows;

  company.invoices = invoices;

  if (!company) throw new NotFoundError(`Not found: ${code}`);

  return res.json({company});
  });


/** Create new company, return company */

router.post("/", async function (req, res) {
  const { code, name, description } = req.body;

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
    [code, name, description],
  );
  const company = result.rows[0];
  return res.status(201).json({ company });
});

/** Update company, returning company */

router.put("/:code", async function (req, res) {
  const { code, name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
           SET code=$1,
               name=$2,
               description=$3
           WHERE code = $1
           RETURNING code, name, description`,
    [req.params.code, name, description],
  );
  const company = result.rows[0];

  if (!company) throw new NotFoundError(`Not found: ${code}`);

  return res.json({ company });
});

/** Delete company, returning {message: "Deleted"} */

router.delete("/:code", async function (req, res) {
  const code = req.params.code;

  const company = await db.query(
    "DELETE FROM companies WHERE code = $1",
    [req.params.code],
  );

  if (!company.rowCount) throw new NotFoundError(`Not found: ${code}`);

  return res.json({ message: "Deleted" });
});


module.exports = router;