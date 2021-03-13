const express = require("express");
const xss = require("xss");
const AuthService = require("../auth/auth-service");
const ImedTransService = require("./IMedTrans-service");
const { requireAuth } = require("../middleware/jwt-auth");

const ImedTransportRouter = express.Router();
const jsonParser = express.json();

const serializeUserData = (post) => ({
  userid: post.userid,
  useremail: xss(post.useremail),
});

ImedTransportRouter.route("/user/transportlog/")
  .all(requireAuth, (req, res, next) => {
    if (req.user.user_name !== "admin") {
      ImedTransService.getTransportByUserId(req.app.get("db"), req.user.userid)
        .then((userdata) => {
          if (!userdata) {
            return res.status(404).json({
              error: {
                message: `There are not transport(s) setup for the user`,
              },
            });
          }
          res.userdata = userdata;
          next();
        })
        .catch(next);
    } else {
      ImedTransService.getAllLoggedTransports(req.app.get("db"))
        .then((userdata) => {
          if (!userdata) {
            return res.status(404).json({
              error: {
                message: `There are no transport(s) setup for the user`,
              },
            });
          }

          res.userdata = userdata;
          next();
        })
        .catch(next);
    }
  })
  .get((req, res, next) => {
    res.json(res.userdata);
  });

ImedTransportRouter.route("/user").post(jsonParser, (req, res, next) => {
  const { useremail, user_name, userpassword } = req.body;
  const newUserRegistration = {
    useremail,
    user_name,
    userpassword,
  };

  for (const [key, value] of Object.entries(newUserRegistration)) {
    if (value == null) {
      return res.status(400).json({
        error: { message: `Missing '${key}' in request body` },
      });
    }
  }

  ImedTransService.hasUserWithUserName(req.app.get("db"), user_name)
    .then((hasUserWithUserName) => {
      if (hasUserWithUserName)
        return res.status(400).json({ error: `Username already taken` });

      return AuthService.hashPassword(newUserRegistration.userpassword).then(
        (hashedPassword) => {
          newUserRegistration.userpassword = hashedPassword;

          return ImedTransService.insertImedTransportUser(
            req.app.get("db"),
            newUserRegistration
          ).then((AddedImedTranportUser) => {
            res
              .status(201)
              .location(`/imedtransport/${AddedImedTranportUser.userid}`)
              .json(serializeUserData(AddedImedTranportUser));
          });
        }
      );
    })
    .catch(next);
});

ImedTransportRouter.route("/user/transportreq")
  .all(requireAuth, (req, res, next) => {
    res.userdata = req.user;
    next();
  })
  .get((req, res, next) => {
    res.json(serializeUserData(res.userdata));
  })
  .post(jsonParser, (req, res, next) => {
    const {
      starting_location,
      destination_location,
      date_of_transport,
      mileage,
    } = req.body;
    const newUserRegistration = {
      starting_location,
      destination_location,
      date_of_transport,
      mileage,
    };

    for (const [key, value] of Object.entries(newUserRegistration)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    newUserRegistration["requested_user"] = req.user.userid;

    ImedTransService.insertTransport(req.app.get("db"), newUserRegistration)
      .then((AddedImedTranportUser) => {
        res
          .status(201)
          .location(`/user/${AddedImedTranportUser.transportid}`)
          .json(AddedImedTranportUser);
      })
      .catch(next);
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
