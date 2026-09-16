const fs = require('fs');
const path = require('path');

exports.getAllDomains = (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../../data/domains.json'), 'utf-8');
    const domains = JSON.parse(data);
    res.json(domains);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
