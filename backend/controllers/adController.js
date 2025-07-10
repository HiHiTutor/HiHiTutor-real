const Ad = require('../models/adModel');

// GET /api/ads?type=hero
exports.getAds = async (req, res) => {
  const filter = req.query.type ? { type: req.query.type } : {};
  const ads = await Ad.find(filter).sort({ order: 1 });
  res.json(ads);
};

// POST /api/ads
exports.createAd = async (req, res) => {
  const newAd = new Ad(req.body);
  const saved = await newAd.save();
  res.status(201).json(saved);
};

// PUT /api/ads/:id
exports.updateAd = async (req, res) => {
  const updated = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

// DELETE /api/ads/:id
exports.deleteAd = async (req, res) => {
  await Ad.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};

// PATCH /api/ads/:id/toggle
exports.toggleAdStatus = async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  ad.isActive = !ad.isActive;
  await ad.save();
  res.json(ad);
}; 