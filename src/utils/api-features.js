const R = require('ramda');
const { getSearchMatch } = require('./general');

const EXCLUDES_FIELDS = ['page', 'sort', 'skip', 'limit', 'fields', 'search'];

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = R.omit(EXCLUDES_FIELDS, this.queryString);

    // Advanced filtering
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  search(...fields) {
    if (this.queryString.search && !R.isEmpty(fields)) {
      const match = getSearchMatch(this.queryString.search, fields);

      this.query = this.query.find(match);
    }

    return this;
  }
}

module.exports = APIFeatures;
