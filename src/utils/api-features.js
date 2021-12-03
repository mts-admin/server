const R = require('ramda');

const moment = require('./moment');
const { getSearchMatch, getDateMatch } = require('./general');

const EXCLUDES_FIELDS = ['page', 'sort', 'skip', 'limit', 'fields', 'search'];

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // filter by fields in query
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

  sort(defaultField = 'createdAt') {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(`-${defaultField}`);
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

  select(fields) {
    this.query = this.query.select(fields.join(' '));

    return this;
  }

  search(...fields) {
    if (this.queryString.search && !R.isEmpty(fields)) {
      const match = getSearchMatch(this.queryString.search, fields);

      this.query = this.query.find(match);
    }

    return this;
  }

  dateFilter(fieldName) {
    const { start, end } = this.queryString;

    if (!start && !end) {
      this.query = this.query.find(
        getDateMatch(
          moment().startOf('month').format(),
          moment().endOf('month').format(),
          fieldName
        )
      );
    } else {
      this.query = this.query.find(getDateMatch(start, end, fieldName));
    }

    return this;
  }

  paginate() {
    if (this.queryString.page === -1) return this;

    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  populate(path, select) {
    this.query = this.query.populate(path, select);

    return this;
  }

  countDocuments() {
    return this.query.skip(0).limit(Infinity).countDocuments();
  }
}

module.exports = APIFeatures;
