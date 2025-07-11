const Ad = require('../models/adModel');

// GET /api/ads?type=hero
exports.getAds = async (req, res) => {
  const filter = req.query.type ? { type: req.query.type } : {};
  const ads = await Ad.find(filter).sort({ order: 1 });
  res.json(ads);
};

// GET /api/ads/:id
exports.getAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: '廣告不存在' });
    }
    res.json(ad);
  } catch (err) {
    res.status(500).json({ message: '讀取失敗' });
  }
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
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: '廣告不存在' });
    }
    
    ad.isActive = !ad.isActive;
    await ad.save();
    
    console.log(`✅ 廣告狀態已切換: ${ad._id} -> ${ad.isActive ? '啟用' : '停用'}`);
    res.json(ad);
  } catch (err) {
    console.error('❌ Toggle ad status error:', err);
    res.status(500).json({ message: '切換狀態失敗' });
  }
}; 