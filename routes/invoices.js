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

  const codeResults = await db.query(`
    SELECT comp_code FROM invoices
    WHERE id = $1`, [id]);
  const comp  = codeResults.rows[0];

  const iResults = await db.query(`
    SELECT id, amt, paid, add_date, paid_date
    FROM invoices
    WHERE id = $1`, [id]);
  let invoice = iResults.rows[0];

  if (!invoice) throw new NotFoundError(`Not found: ${id}`);

  const cResults = await db.query(`
    SELECT code, name, description
    FROM companies
    WHERE code=$1`, [comp.comp_code]);
  const [company] = cResults.rows;

  invoice["company"] = company;

  return res.json({ invoice });
});

/** Create new invoice, return invoice */

router.post("/", async function (req, res) {
  const { comp_code, amt } = req.body;

  const compResults = await db.query(
    `SELECT code FROM companies
    WHERE code = $1`, [comp_code]);

  const [company] = compResults.rows;

  if (!company) throw new NotFoundError(`Not found: ${comp_code}`);

  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
           VALUES ($1, $2)
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt],
  );
  const invoice = result.rows[0];

  return res.status(201).json({ invoice });
});

/** Update invoice, returning invoice */

router.put("/:id", async function (req, res) {
  const { amt } = req.body;
  const invoiceId = req.params.id;

  const result = await db.query(
    `UPDATE invoices
           SET amt=$1
           WHERE id = $2
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, invoiceId]
  );
  const invoice = result.rows[0];

  if (!invoice) throw new NotFoundError(`Not found: ${invoiceId}`);

  return res.json({ invoice });
});


/** Delete an invoice, returning {status: "Deleted"} */

router.delete("/:id", async function (req, res) {
  const id = req.params.id;

  const invoice = await db.query(
    "DELETE FROM invoices WHERE id = $1",
    [req.params.id],
  );

  if (!invoice.rowCount) throw new NotFoundError(`Not found: ${id}`);

  return res.json({ status: "Deleted" });
});


module.exports = router;