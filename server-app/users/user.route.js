const router = require('express').Router();
const UserController = require('./user.controller');
const middleware = require('../middleware/authorization');

router.get('/:id', UserController.show);
router.post('/register', UserController.create);
router.post('/login', UserController.login)
router.put('/:id', middleware.verifyToken, UserController.update);

module.exports = router;
