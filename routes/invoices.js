const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');

const router = new express.Router();



router.get('/', async function(req,res,next){
    try{
        const result = await db.query(`SELECT id, comp_code FROM invoices`);

        return res.json({invoices: result.rows});
    }
    catch(err){
        return next(err);
    }
})


router.get('/:id', async function(req,res,next){
    try{
        const id = req.params.id;

        const invoice = await db.query(`SELECT id, amt, comp_code, paid, add_date, paid_date FROM invoices WHERE id=$1`,
                                        [id]);

        if(invoice.rows.length === 0){
            throw new ExpressError(`Invoice ${id} is not in the database`, 404);
        }

        const companyCode = invoice.rows[0].comp_code
        const company = await db.query(`SELECT name, description FROM companies WHERE code=$1`,
                                        [companyCode]);

        invoice.rows[0]['company'] = company.rows[0];

        return res.json({invoice: invoice.rows[0]});
    }
    catch(err){
        return next(err);
    }
})


router.post('/', async function(req,res,next){
    try{
        const {comp_code, amt} = req.body;

        const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                                        [comp_code, amt])

        if(result.rows.length === 0){
            throw new ExpressError(`Invoice ${id} is not in the database`, 404);
        }

        return res.json({invoice: result.rows[0]})
    }
    catch(err){
        return next(err)
    }
})


router.put('/:id', async function(req,res,next){
    try{
        const id = req.params.id;
        const {amt} = req.body;

        const result = await db.query(`UPDATE invoices SET amt=$1 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                                        [amt, id])

        if(result.rows.length === 0){
            throw new ExpressError(`Invoice ${id} is not in the database`, 404);
        }

        return res.json({invoice: result.rows[0]});
    }
    catch(err){
        return next(err);
    }
})


router.delete('/:id', async function(req,res,next){
    try{
        const id = req.params.id;

        const result = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING id`)

        if(result.rows.length === 0){
            throw new ExpressError(`Invoice ${id} is not in the database`, 404);
        }

        return res.json({status: 'deleted'})
    }
    catch(err){
        return next(err)
    }
})



module.exports = router;