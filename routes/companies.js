const express = require('express');
const slugify = require('slugify');
const ExpressError = require('../expressError');
const db = require('../db');

const router = new express.Router();


router.get('/', async function(req,res,next){
    try{
        const result = await db.query(`SELECT code, name FROM companies`);
        return res.json({companies: result.rows});
    }
    catch(err){
        return next(err);
    }
});


router.get('/:code', async function(req,res,next){
    try{
        const compCode = req.params.code;
        const company = await db.query(`SELECT c.code, c.name, c.description, i.industry
                                        FROM companies AS c
                                        LEFT JOIN companies_industries AS ci
                                        ON c.code = ci.company_code
                                        LEFT JOIN industries AS i ON ci.industry_code = i.code
                                        WHERE c.code=$1`, [compCode]);

        if(company.rows.length === 0){
            throw new ExpressError(`Company ${compCode} is not in the database`, 404);
        }

        const invoices = await db.query(`SELECT id, amt, paid FROM invoices WHERE comp_code=$1`,
                                        [compCode]);

        let {code, name, description} = company.rows[0]

        let invoicesObject = invoices.rows[0];

        let industries = company.rows.map(r => r.industry);

        return res.json({code, name, description, invoicesObject, industries});
    }
    catch(err){
        return next(err);
    }
});


router.post('/', async function(req,res,next){
    try{
        let {name, description} = req.body;
        let code = slugify(name, {lower: true});

        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
                                        [code, name, description]);

        return res.status(201).json({company: result.rows[0]});
    }
    catch(err){
        return next(err);
    }
})


router.put('/:code', async function(req,res,next){
    try{
        let {name, description} = req.body;
        let code = req.params.code;

        const result = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code = $3 RETURNING code, name, description`,
                                        [name, description, code]);

        if(result.rows.length === 0){
            throw new ExpressError(`Company ${code} is not in the database`, 404);
        }

        return res.json({company: result.rows[0]});
    }
    catch(err){
        return next(err);
    }
})


router.delete('/:code', async function(req,res,next){
    try{
        let code = req.params.code;

        const result = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code`,
                                        [code]);

        if(result.rows.length === 0){
            throw new ExpressError(`Company ${code} is not in the database`, 404);
        }
        
        return res.json({status: 'deleted'});
    }
    catch(err){
        return next(err);
    }
})


module.exports = router;