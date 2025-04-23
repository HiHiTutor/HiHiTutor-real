const https = require('https');
const fs = require('fs');
const path = require('path');

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(fs.createWriteStream(filepath))
                .on('error', reject)
                .once('close', () => resolve(filepath));
      } else {
        response.resume();
        reject(new Error(`Request Failed With a Status Code: ${response.statusCode}`));
      }
    });
  });
};

const images = {
  'logo.png': 'https://placehold.co/120x40/FFDD00/000000.png?text=HiHiTutor',
  'hero-illustration.png': 'https://placehold.co/800x400/FFE5CC/000000.png?text=Hero+Illustration',
  'app-store.png': 'https://placehold.co/140x42/000000/FFFFFF.png?text=App+Store',
  'google-play.png': 'https://placehold.co/140x42/000000/FFFFFF.png?text=Google+Play',
  'app-gallery.png': 'https://placehold.co/140x42/000000/FFFFFF.png?text=AppGallery',
};

// Create avatars for tutors
for (let i = 1; i <= 6; i++) {
  images[`avatars/teacher${i}.png`] = `https://placehold.co/100x100/CCCCCC/000000.png?text=Teacher${i}`;
}

const publicDir = path.join(__dirname, '../public');
const avatarsDir = path.join(publicDir, 'avatars');

// Create directories if they don't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir);
}

// Download all images
Object.entries(images).forEach(([filename, url]) => {
  const filepath = path.join(publicDir, filename);
  downloadImage(url, filepath)
    .then(filepath => console.log(`Downloaded: ${filepath}`))
    .catch(err => console.error(`Error downloading ${filename}:`, err));
}); 