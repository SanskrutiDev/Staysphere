const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow('', null) // Allows an empty string or null for the image field
    }).required() // Ensures the "listing" object is required
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5), // Rating must be a number between 1 and 5
        comment: Joi.string().required() // Comment must be a non-empty string
    }).required() // Ensures the "review" object is required
});

