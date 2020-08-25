require("express")().listen(1343);

const db = require("quick.db");
const discord = require("discord.js");
const client = new discord.Client({ disableEveryone: true });
client.login(process.env.TOKEN);
const fetch = require("node-fetch");
const fs = require("fs");
const express = require("express");
const app = express();
const helmet = require("helmet");
const moment = require('moment');

const md = require("marked");

app.use(express.static("public"));

const request = require("request");
const url = require("url");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const LevelStore = require("level-session-store")(session);
const Strategy = require("passport-discord").Strategy;
  app.use(
    "/css",
    express.static(path.resolve(__dirname + `/css`))
  );
  const templateDir = path.resolve(__dirname + `/src/pages/`); 

app.locals.domain = process.env.PROJECT_DOMAIN;

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

setInterval(() => {
  var links = db.get("linkler");
  if (!links) return;
  var linkA = links.map(c => c.url);
  linkA.forEach(link => {
    try {
      fetch(link);
    } catch (e) {
     // console.log("" + e);
    }
  });
  let zaman = new Date();
  console.log("Pong! Requests sent");
}, 60000);

client.on("ready", () => {
  if (!Array.isArray(db.get("linkler"))) {
    db.set("linkler", []);
  }
});


client.on("ready", () => {
  client.user.setActivity(`by Alfonzo#1921 and cenap#4160`);
  passport.use(
    new Strategy(
      {
        clientID: process.env.clientID,
        clientSecret: process.env.AuthSecret,
        callbackURL: process.env.callbackurl,
        scope: ["identify"]
      },
      (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
      }
    )
  );

  app.use(
    session({
      secret: "123",
      resave: false,
      saveUninitialized: false
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  let linkss;
  app.use(helmet());
  let links = db.get("linkler");
  let sahipp;
  var linkA = links.map(c => c.url);
  var sahip = links.map(c => c.owner);
      try {
linkss = linkA
 sahipp = sahip
    } catch (e) {
      console.log("" + e);
    }
  
  const renderTemplate = (res, req, template, data = {}) => {
    const baseData = {
      bot: client,
      path: req.path,
      db: db,
      user: req.isAuthenticated() ? req.user : null,
      saat: `${moment().locale('tr').format('LLL')}`,
      linkss: linkss,
      sahipp: sahipp
    };
    res.render(
      path.resolve(`${templateDir}${path.sep}${template}`),
      Object.assign(baseData, data)
    );
  };
  app.get(
    "/login",
    (req, res, next) => {
      if (req.session.backURL) {
        req.session.backURL = req.session.backURL;
      } else if (req.headers.referer) {
        const parsed = url.parse(req.headers.referer);
        if (parsed.hostname === app.locals.domain) {
          req.session.backURL = parsed.path;
        }
      } else {
        req.session.backURL = "/";
      }
      next();
    },
    passport.authenticate("discord")
  );

  app.get("/logout", function(req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect("/");
    });
  });

  function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  }

  app.get("/autherror", (req, res) => {
    res.send(
      "Auth Error!"
    );
  });

  app.get(
    "/callback",
    passport.authenticate("discord", { failureRedirect: "/autherror" }),
    async (req, res) => {
      if (req.session.backURL) {
        const url = req.session.backURL;
        req.session.backURL = null;
        res.redirect(url);
      } else {
        res.redirect("/");
      }
    }
  );
  app.get("/", (req, res) => {
    renderTemplate(res, req, "index.ejs");
  });
  app.get("/add", checkAuth, (req, res) => {
    renderTemplate(res, req, "add.ejs");
  });
  app.get("/profile", (req, res) => {
    renderTemplate(res, req, "profile.ejs");
  });
   
  app.post("/add", checkAuth, (req, res) => {
    let ayar = req.body;
  let link = ayar["link"];
    if (!ayar["link"]) return res.send("You didn't fill out the link!");

 if(db.get("linkler").map(z => z.url).includes(link)) {
      return res.send("Already in the system!");
    } else {
      db.push("linkler", { url: link, owner: req.user.id });
      res.send("Added " + req.user.id);
    }
  });

  const listener = app.listen(process.env.PORT, () => {
    console.log("Port:" + listener.address().port);
  });
  console.log(`Logined!`);
});

const Discord = require("discord.js");

const log = message => {
  console.log(`${message}`);
};

