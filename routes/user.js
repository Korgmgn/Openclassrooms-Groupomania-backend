const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.put('/modify', auth, userCtrl.modifyUser);
router.delete('/delete', auth, multer, userCtrl.delete);
router.get('/account', auth, userCtrl.userAccount)

module.exports = router;