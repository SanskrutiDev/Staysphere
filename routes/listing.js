const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const express = require("express");
const router = express.Router();
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.get("/filter/:id", wrapAsync(listingController.filter));                              //Filter Route-----------------

router.get("/search", wrapAsync(listingController.search))     

// Combine index route and create route
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Combine show route and update route
router.route("/:id")
    // Show Route
    .get(wrapAsync(listingController.showListing))
    // Update Route
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    // Delete Route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

module.exports = router;
