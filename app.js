const express = require("express");

const morgan = require("morgan");

const routes = require("./routes/index");

const rateLimit = require("express-rate-limit");

const helmet = require("helmet");

const mongosanitize = require("express-mongo-sanitize");
const xss = require("xss-clean"); // Node.js Connect middleware to sanitize user input coming from POST body, GET queries, and url params.
const bodyParser = require("body-parser"); // Node.js body parsing middleware.
const cors = require("cors"); // CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
const cookieParser = require("cookie-parser"); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
const session = require("cookie-session"); // Simple cookie-based session middleware.

const app = express();

app.use('/uploads', express.static('uploads'));
app.use(
  cors({
    origin: "*",

    methods: ["GET", "PATCH", "POST", "DELETE", "PUT"],

    credentials: true, //

    //   Access-Control-Allow-Credentials is a header that, when set to true , tells browsers to expose the response to the frontend JavaScript code. The credentials consist of cookies, authorization headers, and TLS client certificates.
  })
);

app.use(cookieParser());

app.use(express.json({ limit: "10kb" })); // Controls the maximum request body size. If this is a number, then the value specifies the number of bytes; if it is a string, the value is passed to the bytes library for parsing. Defaults to '100kb'.
app.use(bodyParser.json()); // Returns middleware that only parses json
app.use(bodyParser.urlencoded({ extended: true })); // Returns middleware that only parses urlencoded bodies

app.use(
  session({
    secret: "keyboard cat",
    proxy: true,
    resave: true,
    saveUnintialized: true,
    cookie: {
      secure: false,
    },
  })
);

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 3000,
  windowMs: 60 * 60 * 1000, // In one hour
  message: "Too many Requests from this IP, please try again in an hour!",
});

app.use("/tawk", limiter);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(mongosanitize());

app.use(xss());

app.use(routes);

module.exports = app;
