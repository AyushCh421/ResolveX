const router = require('express').Router();
const { listIssues, updateIssue, getAnalytics } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin'));

router.get('/issues', listIssues);
router.patch('/issues/:id', updateIssue);
router.get('/analytics', getAnalytics);

module.exports = router;
