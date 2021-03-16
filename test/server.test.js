const knex = require("knex");
const app = require("../src/app");
const helper = require("./test-helper");

describe("Protech API:", function () {
  let db;
  let transportRequestData = [
    {
      starting_location:
        '{"pickUpFullAddress":"222 Jumpover street,minneapolis,mn,55113","lat":45.9932159,"lng":-90.155328}',
      destination_location:
        '{"desFullAddress":"111 Jump street,minneapolis,mn,55410","lat":11.9125439,"lng":-22.3128862}',
      date_of_transport: "03-25-2021",
      mileage: 14,
      requested_user: 1,
    },
  ];

  let userData = {
    userid: 1,
    useremail: "tester@yahoo.com",
    user_name: "tester",
    userpassword: helper.hashValue("123"),
  };

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  before("cleanup", () =>
    db.raw("Truncate TABLE transport_entry RESTART IDENTITY CASCADE;")
  );
  before("insert a user", () => {
    return db("med_users").insert(userData);
  });
  before("insert a transport entry", () => {
    return db("transport_entry").insert(transportRequestData);
  });

  after("cleanup", () =>
    db.raw("Truncate TABLE transport_entry RESTART IDENTITY CASCADE;")
  );
  after("cleanup", () =>
    db.raw("Truncate TABLE med_users RESTART IDENTITY CASCADE;")
  );

  after("disconnect from the database", () => db.destroy());

  describe("POST /api/imedtransport/auth/login", () => {
    it("should respond with a 400 when required data is missing", () => {
      return supertest(app)
        .post("/api/imedtransport/auth/login")
        .set("Authorization", helpers.makeAuthHeader(userData))
        .expect(400);
    });

    it("responds with 200 for logging in ", () => {
      let userLoginData = {
        user_name: "",
        password: "tester@yahoo.com",
      };
      return supertest(app)
        .post("/api/imedtransport/auth/login")
        .set("Authorization", helpers.makeAuthHeader(userData))
        .send(userLoginData)
        .expect(200);
    });
  });

  describe("GET `/api/imedtransport/user/transportlog` all the user requested transportations", () => {
    it("should respond to GET `/api/postings` with an array of Postings and status 200", function () {
      return supertest(app)
        .get("/api/imedtransport/user/transportlog")
        .set("Accept", "application/json")
        .set("Authorization", helpers.makeAuthHeader(userData))
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.a("array");
          expect(res.body).to.have.length(transportRequestData.length);
          res.body.forEach((item) => {
            expect(item).to.be.a("object");
            expect(item).to.include.keys(
              "transportid",
              "starting_location",
              "destination_location",
              "date_of_transport",
              "mileage",
              "user_name"
            );
          });
        });
    });
  });

  describe("POST /api/imedtransport/user", function () {
    it("responds with 201 and the specified registered user", () => {
      let newUserData = {
        user_name: "tester2",
        useremail: "tester2@yahoo.com",
        userpassword: "123",
      };

      return supertest(app)
        .post("/api/imedtransport/user")
        .set("Authorization", helpers.makeAuthHeader(userData))
        .send(newUserData)
        .expect(201, {
          userid: 1,
          useremail: newUserData.useremail,
        });
    });
  });

  describe("POST /api/postings/:id", () => {
    it("should update posting when given valid data and an id", function () {
      return supertest(app)
        .post("/api/imedtransport/user/transportreq")
        .set("Authorization", helpers.makeAuthHeader(userData))
        .send(transportRequestData)
        .expect(201);
    });
  });
});
