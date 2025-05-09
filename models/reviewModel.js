// review / rating / createAt/ ref to tour / ref to user

const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
      maxlength: [4000, 'Oops, did not expected to be this long!!!'],
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating cannot be belower than 1.0'],
      max: [5, 'Rating cannot be higher than 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// QUERY MIDDLEWARE:

reviewSchema.pre(/^find/, function (next) {
  //   this.populate([
  //     {
  //       path: 'tour',
  //       select: 'name',
  //     },
  //     {
  //       path: 'user',
  //       select: 'name photo',
  //     },
  //   ]);

  this.populate([
    {
      path: 'user',
      select: 'name photo',
    },
  ]);
  next();
});

reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this point to the current review
  this.constructor.calcAverageRating(this.tour);
});

//findByIdAndUpdate
//findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //this.review is to pass the data from pre-middleware to post-middleware
  //this point to the current query
  this.review = await this.clone().findOne(); // CANNOT use this.findOne(), Mongoose no longer allows executing the same query object twice
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, the query has already been executed
  await this.review.constructor.calcAverageRating(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
