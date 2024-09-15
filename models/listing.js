const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: String,
    description: String,
    image: {
        url: String,
        filename: String
    },
    price: Number,
    category: [String], 
    location: String,
    country: String,
    reviews: [{ 
        type: Schema.Types.ObjectId,
        ref: "Review",
    }],
    
    // geometry: {
    //     type: {
    //         type: String, 
    //         enum: ['Point'],  // 'Point' is required for GeoJSON data
    //         required: true
    //     },
    //     coordinates: {
    //         type: [Number],  // Array of numbers: [longitude, latitude]
    //         required: true
    //     }
    //},
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});
listingSchema.index({ geometry: '2dsphere' });

// Middleware to delete associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (listing) {
    if (listing) {
        // Delete associated reviews
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

module.exports = mongoose.model("Listing", listingSchema);
