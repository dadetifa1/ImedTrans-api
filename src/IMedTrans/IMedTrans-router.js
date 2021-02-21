const express = require("express");
const xss = require("xss");
const ImedTransService = require("./IMedTrans-service");

const ImedTransportRouter = express.Router();
const jsonParser = express.json();

const serializeUserData = (post) => ({
  userid: post.userid,
  useremail: xss(post.useremail),
});

ImedTransportRouter.route("/user/transportlog/:imed_userid")
  .all((req, res, next) => {
    if (isNaN(parseInt(req.params.imed_userid))) {
      return res.status(404).json({
        error: { message: `Invalid user id` },
      });
    }
    ImedTransService.getTransportByUserId(
      req.app.get("db"),
      req.params.imed_userid
    )
      .then((userdata) => {
        if (!userdata) {
          return res.status(404).json({
            error: { message: `There are not transport(s) setup for the user` },
          });
        }
        res.userdata = userdata;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(res.userdata);
  });

ImedTransportRouter.route("/user").post(jsonParser, (req, res, next) => {
  const { useremail, userpassword } = req.body;
  const newUserRegistration = {
    useremail,
    userpassword,
  };

  for (const [key, value] of Object.entries(newUserRegistration)) {
    if (value == null) {
      return res.status(400).json({
        error: { message: `Missing '${key}' in request body` },
      });
    }
  }

  ImedTransService.insertImedTransportUser(
    req.app.get("db"),
    newUserRegistration
  )
    .then((AddedImedTranportUser) => {
      console.log(AddedImedTranportUser);
      res
        .status(201)
        .location(`/imedtransport/${AddedImedTranportUser.userid}`)
        .json(serializeUserData(AddedImedTranportUser));
    })
    .catch(next);
});

ImedTransportRouter.route("/user/:requested_userId")
  .all((req, res, next) => {
    if (isNaN(parseInt(req.params.requested_userId))) {
      return res.status(404).json({
        error: { message: `Invalid user id` },
      });
    }
    ImedTransService.getImedUser(req.app.get("db"), req.params.requested_userId)
      .then((userdata) => {
        if (!userdata) {
          return res.status(404).json({
            error: { message: `The requested user doesn't exist` },
          });
        }
        res.userdata = userdata;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeUserData(res.userdata));
  });

ImedTransportRouter.route("/adminlogs").get((req, res, next) => {
  ImedTransService.getAllLoggedTransports(req.app.get("db"))
    .then((data) => {
      res.json(data);
      next();
    })
    .catch(next);
});

module.exports = ImedTransportRouter;
