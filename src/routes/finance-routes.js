const router = require('express').Router();

const { protect } = require('../middlewares/auth');
const {
  getStatsValidator,
  getFinanceListValidator,
  createFinanceItemValidator,
  updateFinanceItemValidator,
} = require('./validators/finance-validator');
const {
  getFinanceList,
  getFinanceItem,
  createFinanceItem,
  updateFinanceItem,
  deleteFinanceItem,
  getFinanceStatisticByDate,
  getFinanceFullStatistic,
} = require('../controllers/finance-controller');

// Protect all routes after this middleware
router.use(protect);

router
  .route('/')
  .get(getFinanceListValidator, getFinanceList)
  .post(createFinanceItemValidator, createFinanceItem);

router
  .route('/:id')
  .get(getFinanceItem)
  .patch(updateFinanceItemValidator, updateFinanceItem)
  .delete(deleteFinanceItem);

router.get('/stats/date', getStatsValidator, getFinanceStatisticByDate);

router.get('/stats/full', getStatsValidator, getFinanceFullStatistic);

module.exports = router;
