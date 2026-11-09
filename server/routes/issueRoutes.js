const router = require('express').Router();
const { createIssue, getMyIssues, getIssue, addComment } = require('../controllers/issueController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/', upload.single('image'), createIssue);
router.get('/mine', getMyIssues); // must stay above '/:id'
router.get('/:id', getIssue);
router.post('/:id/comments', addComment);

module.exports = router;
