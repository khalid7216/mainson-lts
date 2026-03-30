// backend/routes/mediaRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { protect, adminOnly } = require('../middleware/auth');
const {
  uploadMedia,
  getAllMedia,
  deleteMedia
} = require('../controllers/mediaController');

// All media routes are strictly for Admins
router.route('/upload')
  .post(protect, adminOnly, upload.single('file'), uploadMedia);

router.route('/')
  .get(protect, adminOnly, getAllMedia);

router.route('/:id')
  .delete(protect, adminOnly, deleteMedia);

module.exports = router;
