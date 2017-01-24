import {expect} from 'chai';
import supertest from 'supertest';
import app from '../app';

describe('Auth', ()=> {
  let mock, request;

  before((done)=> {
    mock = app.listen(32451, ()=> {
      request = supertest.agent(mock);
      done();
    });
  })

  after((done)=> {
    mock.close(done);
  })

  xit('/auth/signup', async ()=> {
    let {body} = await request.post('/auth/signup').send({
      email: 'test@adbund.com',
      password: 'test',
      firstname: 'test',
      lastname: 'test'
    });
    expect(body.status).to.equal(1);
    expect(body.message).to.equal('success');
  })

  it('/auth/login', async()=> {
    let {body} = await request.post('/auth/login').send({
      email: 'test@adbund.com',
      password: 'test'
    });
    console.log(body);
    expect(body.token).to.be.a('string');
    expect(body.token.length).to.be.above(10);
  })

  it('/account/check', async ()=> {
  })
})
