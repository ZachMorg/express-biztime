const request = require('supertest');
const app = require('../app');
const {createData} = require('../_test-data');
const db = require('../db');


beforeEach(createData);

afterAll(async function(){
    await db.end()
})



describe('GET /', function(){

    test('It should respond with an array of companies', async function(){
        const res = await request(app).get('/companies/');

        expect(res.body).toEqual({
            companies: [
                {code: 'apple', name: 'Apple'},
                {code: 'ibm', name: 'IBM'}
            ]
        });
    });
});


describe('GET /apple', function(){

    test('It should respond with company info', async function(){
        const res = await request(app).get('/companies/apple');

        expect(res.body).toEqual({
            company: {
                code: 'apple',
                name: 'Apple',
                description: 'Maker of OSX.',
                invoices: [
                    {
                        id: 1,
                        amt: 100,
                        paid: false
                    },
                    {
                        id: 2,
                        amt: 200,
                        paid: true
                    }
                ]
            }
        });
    });

    test('It should respond with 404 for missing company', async function(){
        const res = await request(app).get('/companies/snapple');

        expect(res.status).toEqual(404);
    });
});


describe('POST /', function(){

    test('It should add a new company and respond with the new company info', async function(){
        const res = await request(app).post('/companies/').send({code: 'samsung', name: 'Samsung', description: 'Phones and the K9 Thunder howitzer tank'});

        expect(res.body).toEqual({
            company: {
                code: 'samsung',
                name: 'Samsung',
                description: 'Phones and the K9 Thunder howitzer tank'
            }
        });
    });

    test('It should respond with 500 for invalid company code', async function(){
        const res = await request(app).post('/companies/').send({code: 'apple', name: 'Apple', description: 'copyright infringement'});

        expect(res.status).toEqual(500);
    });
});


describe('PUT /', function(){

    test('It should update a company and respond with the updated info', async function(){
        const res = await request(app).put('/companies/apple').send({name: 'New Apple', description: 'New and improved'});

        expect(res.body).toEqual({
            company: {
                code: 'apple',
                name: 'New Apple',
                description: 'New and improved'
            }
        });
    });

    test('It should respond with 404 for missing company', async function(){
        const res = await request(app).put('/companies/snapple').send({name: 'New Snapple', description: 'juice'});

        expect(res.status).toEqual(404);
    });

    test('It should respond with 500 for missing body data', async function(){
        const res = await request(app).put('/companies/apple').send({});

        expect(res.status).toEqual(500);
    });
});


describe('DELETE /', function(){

    test('It should delete a company and respond with confirmation of deletion', async function(){
        const res = await request(app).delete('/companies/apple');

        expect(res.body).toEqual({
            status: 'deleted'
        });
    });

    test('It should respond with 404 for missing company', async function(){
        const res = await request(app).delete('/companies/snapple');

        expect(res.status).toEqual(404);
    });
})