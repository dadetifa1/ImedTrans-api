require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const errorHandler = require("./middleware/error-handler");
const logger = require("./logger");
const iMedtransRouter = require("./IMedTrans/IMedTrans-router");
const authRouter = require("./auth/auth-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(
  morgan(morganOption, {
    skip: () => NODE_ENV === "test",
  })
);
app.use(cors());
app.use(helmet());

app.use("/api/imedtransport/auth", authRouter);
app.use("/api/imedtransport", iMedtransRouter);

app.use(errorHandler);

module.exports = app;
