const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');

const router = new express.Router();


router.get('/', async function(req,res,next){
    try{
        const industryQuery = await db.query(`SELECT industry, code FROM industries`);

        let result = [];
        for(let industry of industryQuery.rows){
            const companyQuery = await db.query(`SELECT company_code AS code
                                                 FROM companies_industries
                                                 WHERE industry_code=$1`,
                                                 [industry['code']]);

            industry['companies'] = companyQuery.rows;
            result.push(industry)
        }
        

        return res.json({industries: result});
    }
    catch(err){
        return next(err);
    }
});


router.post('/', async function(req,res,next){
    try{
        let {code, industry} = req.body;

        const result = await db.query(`INSERT INTO industries VALUES ($1, $2) RETURNING code, industry`,
                                       [code, industry]);
        
        return res.status(201).json({industry: result.rows[0]});
    }
    catch(err){
        return next(err);
    }
});


router.post('/relationship', async function(req,res,next){
    try{
        let{compCode, indCode} = req.body;

        const result = await db.query(`INSERT INTO companies_industries VALUES ($1, $2) RETURNING company_code, industry_code`,
                                       [compCode, indCode]);
        
        return res.status(201).json({comp_ind: result.rows[0]});
    }
    catch(err){
        return next(err);
    }
});



module.exports = router;