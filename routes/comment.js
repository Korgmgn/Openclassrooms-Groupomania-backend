const express = require('express');
const router = express.Router();

const commentCtrl = require('../controllers/comment');
const auth = require('../middleware/auth');

router.post('/create/:postUuid', auth, commentCtrl.createComment);
router.put('/modify/:commentUuid', auth, commentCtrl.modifyComment);
router.delete('/delete/:commentUuid', auth, commentCtrl.deleteComment);

router.get('/allcomments/:postUuid', auth, commentCtrl.allComments);

module.exports = router;