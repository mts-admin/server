const router = require('express').Router();

const { protect, restrictTo } = require('../middlewares/auth');
const {
  getMyBonuses,
  getUserBonuses,
  getBonus,
  createBonus,
  updateBonus,
  deleteBonus,
} = require('../controllers/bonuses-controller');
const {
  getBonusesListValidator,
  createBonusValidator,
  updateBonusValidator,
} = require('./validators/bonus-validator');
const { USER_ROLE } = require('../constants/users');

// Protect all routes after this middleware
router.use(protect);

router.get('/', getBonusesListValidator, getMyBonuses);
router.get('/:id', getBonus);

router.use(restrictTo(USER_ROLE.ADMIN, USER_ROLE.OWNER));

router.get('/user/:userId', getBonusesListValidator, getUserBonuses);
router.post('/', createBonusValidator, createBonus);
router
  .route('/:id')
  .patch(updateBonusValidator, updateBonus)
  .delete(deleteBonus);

module.exports = router;
