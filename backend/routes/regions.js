const express = require('express');
const router = express.Router();
const REGION_OPTIONS = require('../constants/regionOptions');

router.get('/', (req, res) => {
  res.json(REGION_OPTIONS);
});

module.exports = router; 