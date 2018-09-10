// set dependencies
const express = require('express');
var cors = require('cors')
const app = express();
app.use(cors())
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mean-angular6', { promiseLibrary: require('bluebird') })
  .then(() => console.log('connection successful'))
  .catch((err) => console.error(err));

var Celestial = require('./models/celestial.js');
var System = require('./models/system.js');
var User = require('./models/user.js');

// enable the use of request body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Create middleware for checking the JWT
const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://makeplanets.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://makeplanets.auth0.com/`,
  algorithms: ['RS256']
});
app.get('/user/:auth_id', checkJwt, function (req, res) {
  console.log("==> GET by " + req.user.sub);
  console.log('/user/' + req.params.auth_id);

  User.findOne({ 'auth_id': req.params.auth_id }).exec(function (err, post) {
    if (err) {
      console.log(err);
      return res.json({ status: "Error" });
    }
    if (post == null) {
      console.log("No system at ID!");
      return res.json({ status: "User doesn't exist!" });
    }

    res.json(post);
  });
});
app.get('/myself', checkJwt, function (req, res) {
  console.log("==> GET by " + req.user.sub);
  console.log('/myself/');

  User.findOne({ 'auth_id': req.user.sub }).exec(function (err, post) {
    if (err) {
      console.log(err);
      return res.json({ status: "Error" });
    }
    if (post == null) {
      console.log("No system at ID!");
      return res.json({ status: "You doesn't exist!" });
    }

    res.json(post);
  });
});
app.put('/user/:auth_id', checkJwt, function (req, res) {
  console.log("==> PUT by " + req.user.sub);
  console.log('/user/' + req.params.auth_id);

  //Make sure the user is allowed to access the system in question
  var accessGranted = false;
  User.findOne({ 'auth_id': req.params.auth_id }, function (err, post) {
    if (err || post == null) {
      console.log("No user at auth_id!");
      return res.json({ status: "User doesn't exist!" });
    }


    if (post.auth_id == req.user.sub) {

      User.findOneAndUpdate({ 'auth_id': req.params.auth_id }, req.body, function (err, post) {
        if (err) return next(err);
        res.json({ status: "Updated User!" });
      });

    } else {
      console.log('Access denied');
      res.json({ status: "Cannot change someone else's user data" });
    }
  });
});
app.post('/user/', checkJwt, function (req, res) {
  console.log("==> POST by " + req.user.sub);
  console.log('/user/');

  var newUser = new User({
    auth_id: req.user.sub,
    username: req.user.nickname,
    tagline: ""
  });

  User.findOne({ 'auth_id': req.user.sub }, function (err, user) {
    if (user) {
      res.json({ status: 'You already have a user object!' });
    } else {
      User.create(newUser, function (err, post) {
        if (err) return next(err);
        res.json(post);
      });
    }
  });
});

app.get('/systems/', checkJwt, function (req, res) {
  console.log("==> GET by " + req.user.sub);
  console.log('/systems/');

  System.find({ owner: req.user.sub }, function (err, post) {
    console.log("Sending systems... (" + post.length + ") found");
    res.json(post);
  });
});

app.get('/system/:id', checkJwt, function (req, res) {
  console.log("==> GET by " + req.user.sub);
  console.log('/system/' + req.params.id);

  System.findById(req.params.id).populate('celestials').exec(function (err, post) {
    if (err) {
      console.log(err);
      return res.json({ status: "Error" });
    }
    if (post == null) {
      console.log("No system at ID!");
      return res.json({ status: "System doesn't exist!" });
    }

    //Make sure the user is allowed to access the system in question
    var systemOwner = post.owner;
    if (systemOwner == req.user.sub) {
      console.log('Access granted [is owner]');
      res.json(post);
    } else {
      console.log('Access denied');
      res.json({ status: "Cannot access systems that aren't yours!" });
    }
  });
});
app.post('/system/', checkJwt, function (req, res) {
  console.log("==> POST by " + req.user.sub);
  console.log('/system/');

  //Associate the new system with the POSTing user's id
  req.body.owner = req.user.sub;

  //Add a single star to the new system
  var cel = new Celestial({
    owner: req.user.sub,
    name: 'Untitled Star',
    type: 'star',
    parent_id: 'root'
  });

  Celestial.create(cel, function (err, post) {
    if (err) return next(err);

    req.body.celestials = [];
    req.body.celestials.push(post);

    System.create(req.body, function (err, post) {
      if (err) return next(err);
      res.json(post);
    });
  });
});
app.put('/system/:id', checkJwt, function (req, res) {
  console.log("==> PUT by " + req.user.sub);
  console.log('/system/' + req.params.id);

  //Make sure the user is allowed to access the system in question
  var accessGranted = false;
  System.findById(req.params.id, function (err, post) {
    if (err || post == null) {
      console.log("No system at ID!");
      return res.json({ status: "System doesn't exist!" });
    }


    var systemOwner = post.owner;
    if (systemOwner == req.user.sub) {

      console.log("Updating celestials...");
      var celestials = req.body.celestials;
      var tempMap = {};
      for (var i = 0; i < celestials.length; i++) {
        console.log(celestials[i]._id + "; " + celestials[i].name);
        tempMap[celestials[i]._id] = celestials[i];

        console.log("> Updating " + celestials[i].name + " (" + celestials[i]._id + ")");

        //Make sure the user is allowed to access the celestial in question
        Celestial.findById(celestials[i]._id, function (err, post) {

          if (err || post == null) {
            console.log("> No celestial at ID " + celestials[i]._id);
          }


          var celestialOwner = post.owner;
          if (celestialOwner == req.user.sub) {

            console.log('>> Access granted [is owner]');
            Celestial.findOneAndUpdate({ '_id': post._id }, tempMap[post._id], function (err, post) {
              if (err) console.log(err);
            });

          } else {
            console.log('>> Access denied');
          }
        });
      }

      console.log('Access granted [is owner]');
      req.body.owner = req.user.sub;
      System.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json({ status: "Updated System!" });
      });

    } else {
      console.log('Access denied');
      res.json({ status: "Cannot overwrite systems that aren't yours!" });
    }
  });
});
app.delete('/system/:id', checkJwt, function (req, res) {
  console.log("==> DELETE by " + req.user.sub);
  console.log('/system/' + req.params.id);

  System.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    if (post == null) {
      console.log("No system at ID!");
      return res.json({ status: "System doesn't exist!" });
    }

    var systemOwner = post.owner;
    if (systemOwner == req.user.sub) {

      console.log('Access granted [is owner]');
      req.body.owner = req.user.sub;
      System.findByIdAndRemove(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json({ status: "Deleted System!" });
      });

    } else {
      console.log('Access denied');
      res.json({ status: "Cannot delete systems that aren't yours!" });
    }
  });
});

/*
 * Adding and deleting Celestial objects
 */

app.get('/celestial/:id', checkJwt, function (req, res) {
  console.log("==> GET by " + req.user.sub);
  console.log('/celestial/' + req.params.id);

  Celestial.findById(req.params.id).exec(function (err, post) {
    if (err) {
      console.log(err);
      return res.json({ status: "Error" });
    }
    if (post == null) {
      console.log("No celestial at ID!");
      return res.json({ status: "Celestial doesn't exist!" });
    }

    //Make sure the user is allowed to access the system in question
    var celestialOwner = post.owner;
    if (celestialOwner == req.user.sub) {
      console.log('Access granted [is owner]');
      res.json(post);
    } else {
      console.log('Access denied');
      res.json({ status: "Cannot access celestials that aren't yours!" });
    }
  });
});
app.post('/celestial/', checkJwt, function (req, res) {
  console.log("==> POST by " + req.user.sub);
  console.log('/celestial/');

  //Associate the new system with the POSTing user's id
  var cel = new Celestial({ owner: req.user.sub, binary: req.body.binary });
  console.log(cel);

  Celestial.create(cel, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});


app.put('/celestial/:id', checkJwt, function (req, res) {
  console.log("==> PUT by " + req.user.sub);
  console.log('/celestial/' + req.params.id);

  //Make sure the user is allowed to access the celestial in question
  Celestial.findById(req.params.id, function (err, post) {
    if (err || post == null) {
      console.log("No celestial at ID!");
      return res.json({ status: "Celestial doesn't exist!" });
    }


    var celestialOwner = post.owner;
    if (celestialOwner == req.user.sub) {

      console.log('Access granted [is owner]');
      req.body.owner = req.user.sub;
      Celestial.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json({ status: "Updated Celestial!" });
      });

    } else {
      console.log('Access denied');
      res.json({ status: "Cannot overwrite celestials that aren't yours!" });
    }
  });
});
app.delete('/celestial/:id', checkJwt, function (req, res) {
  console.log("==> DELETE by " + req.user.sub);
  console.log('/celestial/' + req.params.id);

  Celestial.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    if (post == null) {
      console.log("No celestial at ID!");
      return res.json({ status: "Celestial doesn't exist!" });
    }

    var celestialOwner = post.owner;
    if (celestialOwner == req.user.sub) {

      console.log('Access granted [is owner]');
      req.body.owner = req.user.sub;
      Celestial.findByIdAndRemove(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json({ status: "Deleted Celestial!" });
      });

    } else {
      console.log('Access denied');
      res.json({ status: "Cannot delete celestials that aren't yours!" });
    }
  });
});

// launch the API Server at localhost:8000
app.listen(8000);
console.log("Hosting server on 8000");
