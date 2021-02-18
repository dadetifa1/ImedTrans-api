process.env.TZ = 'UTC'
process.env.NODE_ENV = 'test'
require('dotenv').config()

process.env.TEST_DB_URL = process.env.TEST_DATABASE_URL

const { expect } = require('chai')
const supertest = require('supertest')

global.expect = expect
global.supertest = supertest


// require('dotenv').config()
// const { expect } = require('chai')
// const supertest = require('supertest')

// global.expect = expect
// global.supertest = supertest