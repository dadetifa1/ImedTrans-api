const express = require("express");
const xss = require("xss");
const ImedTransService = require("./IMedTrans-service");

const ImedTransportRouter = express.Router();
const jsonParser = express.json();

const serializePosting = (post) => ({
  Posting_id: post.id,
  po_number: xss(post.po_number),
  sales_number: xss(post.sales_number),
  dollar_amount: xss(post.dollar_amount),
  invoice: xss(post.invoice),
  commission_percentage_fraction: post.commission_percentage_fraction,
  commission_amount: post.commission_amount,
  customer: xss(post.customer),
  territory: xss(post.territory),
  vendor: xss(post.vendor),
  date_paid:
    post.date_paid !== null
      ? post.date_paid.toISOString().split("T")[0]
      : post.date_paid,
  paid: post.paid,
  sale_person_firstname: xss(post.first_name),
  sale_person_lastname: xss(post.last_name),
  sale_person_id: post.sales_person_id,
});

ImedTransportRouter.route("/transport")
  .get((req, res, next) => {
    ImedTransService.getAllLoggedTransports(req.app.get("db"))
      .then((data) => {
        res.json(data);
        next();
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const {
      sales_number,
      invoice,
      dollar_amount,
      commission_percentage_fraction,
      commission_amount,
      po_number,
      customer,
      territory,
      date_paid,
      vendor,
      paid,
      sales_person_id,
    } = req.body;
    const PostToAdd = {
      sales_number,
      invoice,
      dollar_amount,
      commission_percentage_fraction,
      commission_amount,
      po_number,
      customer,
      territory,
      vendor,
      paid,
    };

    for (const [key, value] of Object.entries(PostToAdd)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    if (!sales_person_id) {
      return res.status(400).json({
        error: { message: `Missing 'Sales_person_id' in request body` },
      });
    }

    PostToAdd.date_paid = date_paid === "" ? null : date_paid;

    ImedTransService.insertPostings(req.app.get("db"), PostToAdd)
      .then((AddedPost) => {
        let posting_id = AddedPost.id;
        let commission_rate = 100;
        let update_commission_amount =
          Number(PostToAdd.dollar_amount) * commission_percentage_fraction;

        saleCommission = {
          posting_id,
          sales_person_id,
          commission_rate,
          commission_amount: update_commission_amount,
        };

        ImedTransService.insertSaleCommission(req.app.get("db"), saleCommission)
          .then((data) => "do nothing")
          .catch(next);
        return AddedPost;
      })
      .then((completedPost) => {
        res
          .status(201)
          .location(`/api/postings/${completedPost.id}`)
          .json(serializePosting(completedPost));
      })
      .catch(next);
  });

ImedTransportRouter.route("/:requested_userId")
  .all((req, res, next) => {
    if (isNaN(parseInt(req.params.requested_userId))) {
      return res.status(404).json({
        error: { message: `Invalid id` },
      });
    }
    ImedTransService.getTransportByUserId(
      req.app.get("db"),
      req.params.requested_userId
    )
      .then((loggedTransport) => {
        if (!loggedTransport) {
          return res.status(404).json({
            error: { message: `Transport log doesn't exist` },
          });
        }
        res.loggedTransport = loggedTransport;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializePosting(res.loggedTransport));
  })
  .delete((req, res, next) => {
    ImedTransService.deleteTransportLog(
      req.app.get("db"),
      req.params.requested_userId
    )
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const {
      sales_number,
      invoice,
      dollar_amount,
      commission_percentage_fraction,
      commission_amount,
      po_number,
      customer,
      territory,
      date_paid,
      vendor,
      paid,
      sales_person_id,
    } = req.body;
    const PostToAdd = {
      sales_number,
      invoice,
      dollar_amount,
      commission_percentage_fraction,
      commission_amount,
      po_number,
      customer,
      territory,
      vendor,
      paid,
    };

    for (const [key, value] of Object.entries(PostToAdd)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    if (!sales_person_id) {
      return res.status(400).json({
        error: { message: `Missing 'Sales_person_id' in request body` },
      });
    }

    PostToAdd.date_paid = date_paid === "" ? null : date_paid;

    ImedTransService.TransportLog(
      req.app.get("db"),
      req.params.requested_userId,
      PostToAdd
    )
      .then((updatedPost) => {
        commission_rate = 100;
        posting_id = req.params.requested_userId;
        let update_commission_amount =
          Number(PostToAdd.dollar_amount) * commission_percentage_fraction;

        saleCommission = {
          posting_id,
          sales_person_id,
          commission_rate,
          commission_amount: update_commission_amount,
        };

        ImedTransService.updateSaleCommission(req.app.get("db"), saleCommission)
          .then((data) => "do nothing")
          .catch(next);
        return updatedPost;
      })
      .then((updatedPost) => {
        res.status(200).json(serializePosting(updatedPost[0]));
      })
      .catch(next);
  });

module.exports = ImedTransportRouter;
