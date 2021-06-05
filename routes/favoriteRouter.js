const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const favoriteRouter = express.Router();
const cors = require("./cors");

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then((favorite) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          req.body.forEach(fav => {
            if (!favorite.campsites.includes(fav._id)) {
              favorite.campsites.push(fav._id);
            }
          });
          favorite.save()
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch(err => next(err));
        } else {
          Favorite.create({ user: req.user._id })
            .then(favorite => {
              req.body.forEach(fav => {
                if (!favorite.campsites.includes(fav._id)) {
                  favorite.campsites.push(fav._id);
                }
              });
              favorite.save()
                .then(favorite => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                })
                .catch(err => next(err));
            })
        }
      })
      .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /favorites");
      })
      .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
          .then((favorite) => {
            if (favorite) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            } else {
              res.setHeader("Content-Type", "text/plain");
              res.end("You do not have any favorites to delete.");
            }
          })
          .catch((err) => next(err));
      });

    favoriteRouter
      .route("/:campsiteId")
      .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
      .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
          .populate("user")
          .populate("campsites")
          .then((favorite) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          })
          .catch((err) => next(err));
      })
      .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(
          `POST operation not supported on /favorites/${ req.params.campsiteId }`
        );
      })
      .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findByIdAndUpdate(
          req.params.campsiteId,
          {
            $set: req.body,
          },
          { new: true }
        )
          .then((favorite) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          })
          .catch((err) => next(err));
      })
      .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findByIdAndDelete(req.params.campsiteId)
          .then((response) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(response);
          })
          .catch((err) => next(err));
      });
    module.exports = favoriteRouter;