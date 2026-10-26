function isPositiveInteger(val) {
  if (typeof val === 'number') {
    return Number.isInteger(val) && val > 0;
  }
  if (typeof val !== 'string') return false;
  return /^[1-9]\d*$/.test(val.trim());
}

function parsePagination(query = {}) {
  const pageStr = query.page !== undefined ? query.page : '1';
  const limitStr = query.limit !== undefined ? query.limit : '10';

  if (!isPositiveInteger(pageStr) || !isPositiveInteger(limitStr)) {
    return {
      error: 'page and limit must be positive integers',
    };
  }

  const page = parseInt(pageStr, 10);
  let limit = parseInt(limitStr, 10);
  if (limit > 50) {
    limit = 50;
  }

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}

function formatPaginationMeta(total, page, limit) {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

const userSummarySelect = {
  id: true,
  username: true,
  fullname: true,
};

module.exports = {
  isPositiveInteger,
  parsePagination,
  formatPaginationMeta,
  userSummarySelect,
};
