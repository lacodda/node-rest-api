const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const noteRoutes = require('./note.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('apidoc'));

router.use('/users', userRoutes);
router.use('/auth', authRoutes);

/**
 * GET/POST/PUT/DELETE v1/notes
 */
router.use('/notes', noteRoutes);

module.exports = router;
