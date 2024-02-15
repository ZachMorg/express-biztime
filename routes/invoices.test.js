const request = require('supertest');
const app = require('../app');
const {createData} = require('../_test-data');
const db = require('../db');


beforeEach(createData);

afterAll(async function(){
    await db.end()
})



describe('GET /', function(){

    test('It should respond with an array of invoices', async function(){
        const res = await request(app).get('/invoices/');
        expect(res.body).toEqual({
            invoices: [
                {id: 1, comp_code: 'apple'},
                {id: 2, comp_code: 'apple'},
                {id: 3, comp_code: 'ibm'}
            ]
        });
    });
});


describe('GET /1', function(){

    test('It should respond with invoice info', async function(){
        const res = await request(app).get('/invoices/1');
        expect(res.body).toEqual({
            invoice: {
                id: 1,
                amt: 100,
                comp_code: 'apple',
                add_date: '2018-01-01T05:00:00.000Z',
                paid: false,
                paid_date: null,
                company: {
                    name: 'Apple',
                    description: 'Maker of OSX.'
                }
            }
        });
    });

    test('It should respond with 404 for missing invoice', async function(){
        const res = await request(app).get('/invoices/9001');
        expect(res.status).toEqual(404);
    });
});


describe('POST /', function(){

    test('It should add a new invoice and respond with the new invoice info', async function(){
        const res = await request(app).post('/invoices/').send({comp_code: 'ibm', amt: 15000});
        expect(res.body).toEqual({
            invoice: {
                id: 4,
                comp_code: 'ibm',
                amt: 15000,
                paid: false,
                add_date: expect.any(String),
                paid_date: null
            }
        });
    });

    test('It should respond with 500 for missing data', async function(){
        const res = await request(app).post('/invoices/').send({});
        expect(res.status).toEqual(500);
    });
});


describe('PUT /', function(){

    test('It should update an invoice and respond with the updated invoice info', async function(){
        const res = await request(app).put('/invoices/1').send({amt: 1000, paid: false});
        expect(res.body).toEqual({
            invoice: {
                id: 1,
                comp_code: 'apple',
                amt: 1000,
                paid: false,
                add_date: expect.any(String),
                paid_date: null
            }
        });
    });

    test('It should respond with 404 for missing invoice', async function(){
        const res = await request(app).put('/invoices/9001').send({amt: 1000});
        expect(res.status).toEqual(404);
    });

    test('It should respond with 500 for missing data', async function(){
        const res = await request(app).put('/invoices/1').send({});
        expect(res.status).toEqual(500);
    });
});


describe('DELETE /', function(){

    test('It should delete an invoice and respond with conformation of deletion', async function(){
        const res = await request(app).delete('/invoices/1');
        expect(res.body).toEqual({
            status: 'deleted'
        });
    });

    test('It should respond with 404 for missing invoice', async function(){
        const res = await request(app).delete('/invoices/9001');
        expect(res.status).toEqual(404);
    })
})