const knex = require("knex");
const app = require("../src/app");

describe("Protech API:", function () {
  let db;
  let postingData = [
    {
      sales_number: "11111A",
      invoice: "invoice1",
      dollar_amount: 200,
      commission_percentage_fraction: 0.09,
      commission_amount: 180,
      po_number: "PO number 1",
      customer: "customer 1",
      territory: "territory 1",
      vendor: "vendor 1",
      date_paid: null,
      paid: false,
    },
    {
      sales_number: "11111B",
      invoice: "invoice2",
      dollar_amount: 300,
      commission_percentage_fraction: 0.09,
      commission_amount: 190,
      po_number: "PO number 2",
      customer: "customer 2",
      territory: "territory 2",
      vendor: "vendor 2",
      date_paid: null,
      paid: false,
    },
    {
      sales_number: "11111C",
      invoice: "invoice3",
      dollar_amount: 400,
      commission_percentage_fraction: 0.09,
      commission_amount: 150,
      po_number: "PO number 3",
      customer: "customer 3",
      territory: "territory 3",
      vendor: "vendor 3",
      date_paid: null,
      paid: false,
    },
    {
      sales_number: "11111D",
      invoice: "invoice4",
      dollar_amount: 500,
      commission_percentage_fraction: 0.09,
      commission_amount: 160,
      po_number: "PO number 4",
      customer: "customer 4",
      territory: "territory 4",
      vendor: "vendor 4",
      date_paid: null,
      paid: false,
    },
    {
      sales_number: "11111E",
      invoice: "invoice5",
      dollar_amount: 600,
      commission_percentage_fraction: 0.09,
      commission_amount: 180,
      po_number: "PO number 5",
      customer: "customer 5",
      territory: "territory 5",
      vendor: "vendor 5",
      date_paid: null,
      paid: false,
    },
  ];

  let salePersonData = [{ first_name: "Test", last_name: "Master" }];

  let saleCommissionData = [
    {
      sales_person_id: 1,
      posting_id: 1,
      commission_rate: 100,
      commission_amount: 20,
    },
    {
      sales_person_id: 1,
      posting_id: 2,
      commission_rate: 100,
      commission_amount: 20,
    },
    {
      sales_person_id: 1,
      posting_id: 3,
      commission_rate: 100,
      commission_amount: 20,
    },
    {
      sales_person_id: 1,
      posting_id: 4,
      commission_rate: 100,
      commission_amount: 20,
    },
    {
      sales_person_id: 1,
      posting_id: 5,
      commission_rate: 100,
      commission_amount: 20,
    },
  ];

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  before("cleanup", () =>
    db.raw("Truncate TABLE Protech_Posting RESTART IDENTITY CASCADE;")
  );
  before("insert a Salesperson", () => {
    return db("protech_saleperson").insert(salePersonData);
  });
  before("insert some Posting", () => {
    return db("protech_posting").insert(postingData);
  });
  before("insert a Sales commission hist", () => {
    return db("protech_sales_commission_hist").insert(saleCommissionData);
  });

  after("cleanup", () =>
    db.raw("Truncate TABLE Protech_Posting RESTART IDENTITY CASCADE;")
  );
  after("cleanup", () =>
    db.raw("Truncate TABLE protech_saleperson RESTART IDENTITY CASCADE;")
  );

  after("disconnect from the database", () => db.destroy());

  describe("GET `/api/postings` all the collected postings", () => {
    it("should respond to GET `/api/postings` with an array of Postings and status 200", function () {
      return supertest(app)
        .get("/api/postings")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.a("array");
          expect(res.body).to.have.length(postingData.length);
          res.body.forEach((item) => {
            expect(item).to.be.a("object");
            expect(item).to.include.keys("id", "sales_number", "dollar_amount");
          });
        });
    });
  });

  describe("GET /api/postings/:id", () => {
    it("should respond with a 404 when given an invalid id", () => {
      return supertest(app)
        .get("/api/postings/aaaaaaaaaaaa")
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(404);
    });

    it("responds with 200 and the specified posting", () => {
      const postId = 1;
      return supertest(app)
        .get(`/api/postings/${postId}`)
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(200, {
          Posting_id: 1,
          po_number: "PO number 1",
          sales_number: "11111A",
          dollar_amount: "$200.00",
          invoice: "invoice1",
          commission_percentage_fraction: "0.0900",
          commission_amount: 180,
          customer: "customer 1",
          territory: "territory 1",
          vendor: "vendor 1",
          date_paid: null,
          paid: false,
          sale_person_firstname: "Test",
          sale_person_lastname: "Master",
          sale_person_id: 1,
        });
    });
  });

  describe("POST /api/postings", function () {
    it("should create and return a new posting when provided valid data", function () {
      const newPost = {
        sales_number: "444444",
        invoice: "444444",
        dollar_amount: 101,
        commission_percentage_fraction: "0.02",
        commission_amount: 10,
        po_number: "33333333",
        customer: "Dele test2",
        territory: "ATL",
        vendor: "SEL",
        date_paid: null,
        paid: false,
        sales_person_id: 1,
      };

      return supertest(app)
        .post("/api/postings")
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .send(newPost)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.be.a("object");
          expect(res.body).to.include.keys(
            "Posting_id",
            "po_number",
            "sales_number"
          );
          expect(res.body.sales_number).to.equal(newPost.sales_number);
          expect(res.body.paid).to.be.false;
          expect(res.headers.location).to.equal(
            `/api/postings/${res.body.Posting_id}`
          );
        });
    });
  });

  describe("PATCH /api/postings/:id", () => {
    it("should update posting when given valid data and an id", function () {
      const updatedPost = {
        sales_number: "11111AA",
        invoice: "invoice1",
        dollar_amount: 200,
        commission_percentage_fraction: 0.09,
        commission_amount: 180,
        po_number: "PO number 1",
        customer: "customer 1",
        territory: "territory 1",
        vendor: "vendor 1",
        date_paid: "",
        paid: false,
        sales_person_id: 1,
      };

      return supertest(app)
        .patch("/api/postings/1")
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .send(updatedPost)
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.a("object");
          expect(res.body).to.include.keys(
            "invoice",
            "po_number",
            "sales_number"
          );
          expect(res.body.sales_number).to.equal(updatedPost.sales_number);
          expect(res.body.paid).to.be.false;
        });
    });
  });

  describe("DELETE /api/postings/:id", () => {
    it("should delete an item by id", function () {
      return supertest(app)
        .delete(`/api/postings/${1}`)
        .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
        .expect(204);
    });
  });
});
