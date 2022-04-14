const express = require("express");
const res = require("express/lib/response");
const { NotFoundError } = require("../expressError");


const db = require("../db");
const router = new express.Router();

/** GET /invoices: get list of invoices */
router.get("/", async function (req, res) {
  const results = await db.query(
    'SELECT id, comp_code FROM invoices'
  );
  const invoices = results.rows;
  return res.json({ invoices });
});


/** GET /invoices/code: get an object of invoice information */
router.get("/:id", async function (req, res) {
  const id = req.params.id;

  const iResults = await db.query(`
    SELECT id, amt, paid, add_date, paid_date
    FROM invoices
    WHERE id = $1`, [id]);
  const invoice = iResults.rows[0];

  if (!invoice) throw new NotFoundError(`Not found: ${id}`);

  const cResults = await db.query(`
    SELECT code, name, description
    FROM companies
    WHERE code=$1`, [invoice.comp_code]);
  const company = cResults.rows[0];

  invoice.company = company;

  return res.json({ invoice });
});


module.exports = router;