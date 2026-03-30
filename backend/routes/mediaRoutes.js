// backend/routes/mediaRoutes.js
const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/multer');
const { protect, adminOnly } = require('../middleware/auth');
const {
  uploadMedia,
  getAllMedia,
  deleteMedia,
  bulkDeleteMedia,
} = require('../controllers/mediaController');

// All media routes are strictly for Admins
router.post('/upload',       protect, adminOnly, upload.array('files', 10), uploadMedia);
router.get('/',              protect, adminOnly, getAllMedia);
router.delete('/bulk',       protect, adminOnly, bulkDeleteMedia);
router.delete('/:id',        protect, adminOnly, deleteMedia);

module.exports = router;
