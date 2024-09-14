const axios = require("axios");
const Listing = require("../models/listing");



module.exports.index = async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    } catch (error) {
        console.error('Error in index route:', error);
        res.status(500).send("An error occurred");
    }
};

module.exports.renderNewForm = (req, res) => {
    console.log('Rendering new form'); // Add this line
    res.render("listings/new.ejs");
};

module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
            options: { strictPopulate: false }
        },
    })
    .populate("owner");
    
    

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    
    res.render("listings/show.ejs", { listing });
};




module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    if (!req.user) {
        req.flash("error", "You must be logged in to create a listing.");
        return res.redirect("/login");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { filename, url };

    try {
        // Geocoding the address using Nominatim API
        const address = `${newListing.location}, ${newListing.country}`;  // Assuming location & country are in req.body
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

        const response = await axios.get(geocodeUrl);
        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            newListing.geometry = {
                type: "Point",
                coordinates: [lon, lat] // Longitude first, latitude second
            };
        } else {
            req.flash("error", "Could not geocode address");
            return res.redirect("/listings/new");
        }

        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect(`/listings/${newListing._id}`);

    } catch (error) {
        console.error("Error during geocoding:", error);
        req.flash("error", "Failed to create listing due to geocoding error.");
        res.redirect("/listings/new");
    }
};




module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    // Check if listing has an image URL
    let originalImageUrl;
    if (listing.image && listing.image.url) {
        // Modify the URL as intended
        originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
    } else {
        // Set a default image URL or leave it undefined
        originalImageUrl = "https://via.placeholder.com/250"; // or any default image link
    }

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};



module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    try {
        // Geocode the new address if the location has been updated
        const address = `${listing.location}, ${listing.country}`;
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

        const response = await axios.get(geocodeUrl);
        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            listing.geometry = {
                type: "Point",
                coordinates: [lon, lat]
            };
            await listing.save();
        } else {
            req.flash("error", "Could not geocode address");
        }

        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);

    } catch (error) {
        console.error("Error during geocoding:", error);
        req.flash("error", "Failed to update listing due to geocoding error.");
        res.redirect(`/listings/${id}/edit`);
    }
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};