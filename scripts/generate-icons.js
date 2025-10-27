const fs = require('fs');
const path = require('path');
let sharp = null;
let jimp = null;
try {
  sharp = require('sharp');
} catch (e) {
  // sharp not available, try jimp
  try {
    jimp = require('jimp');
  } catch (e2) {
    // will error later
  }
}

// Configuration des icônes AfrikaPharma
const sizes = {
  // Icônes Android
  'mdpi': 48,
  'hdpi': 72,
  'xhdpi': 96,
  'xxhdpi': 144,
  'xxxhdpi': 192,
  // Icônes PWA
  'icon-16': 16,
  'icon-32': 32,
  'icon-48': 48,
  'icon-72': 72,
  'icon-96': 96,
  'icon-144': 144,
  'icon-192': 192,
  'icon-384': 384,
  'icon-512': 512,
  // Icônes Apple
  'apple-touch-icon-57': 57,
  'apple-touch-icon-60': 60,
  'apple-touch-icon-72': 72,
  'apple-touch-icon-76': 76,
  'apple-touch-icon-114': 114,
  'apple-touch-icon-120': 120,
  'apple-touch-icon-144': 144,
  'apple-touch-icon-152': 152,
  'apple-touch-icon-180': 180,
  'apple-touch-icon': 180 // icône principale Apple
};

const svgPath = path.resolve(__dirname, '../public/pajo-logo.svg');
const publicDir = path.resolve(__dirname, '../public');
const androidRes = path.resolve(__dirname, '../android/app/src/main/res');

async function generate() {
  console.log('🎨 Génération des icônes AfrikaPharma...\n');

  if (!fs.existsSync(svgPath)) {
    console.warn('⚠️  SVG source non trouvé:', svgPath);
    console.log('📝 Création d\'un logo AfrikaPharma de base...\n');
    
    // Créer un logo SVG simple si pas trouvé
    const simpleLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="256" cy="256" r="240" fill="url(#grad)" stroke="#ffffff" stroke-width="32"/>
      <text x="256" y="280" font-family="Arial, sans-serif" font-size="180" font-weight="bold" 
            fill="white" text-anchor="middle" dominant-baseline="middle">AP</text>
    </svg>`;
    
    fs.writeFileSync(svgPath, simpleLogo);
    console.log('✅ Logo AfrikaPharma créé:', svgPath);
  }

  // Ensure public dir exists
  fs.mkdirSync(publicDir, { recursive: true });

  console.log('📱 Génération des icônes pour tous les appareils...\n');

  for (const [name, size] of Object.entries(sizes)) {
    let outName;
    
    // Déterminer le nom de fichier approprié
    if (name.startsWith('icon-')) {
      outName = `${name}.png`;
    } else if (name.startsWith('apple-touch-icon')) {
      outName = `${name}.png`;
    } else {
      outName = `ic_launcher_${name}.png`;
    }
    
    const outPublic = path.join(publicDir, outName);

    try {
      if (sharp) {
        await sharp(svgPath)
          .resize(size, size, { 
            fit: 'cover',
            background: { r: 59, g: 130, b: 246, alpha: 1 }
          })
          .png()
          .toFile(outPublic);
        console.log(`✅ ${outName} (${size}x${size}) - sharp`);
      } else if (jimp) {
        // use jimp to rasterize the svg by loading via buffer
        const svgBuffer = fs.readFileSync(svgPath);
        const image = await jimp.read(svgBuffer);
        image.cover(size, size).write(outPublic);
        console.log(`✅ ${outName} (${size}x${size}) - jimp`);
      } else {
        console.error('❌ Ni sharp ni jimp ne sont disponibles. Installez-en un pour générer les icônes.');
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la génération de ${outName}:`, error.message);
      continue;
    }

    // Copier vers Android si nécessaire
    if (fs.existsSync(androidRes) && !name.startsWith('icon-') && !name.startsWith('apple-touch-icon')) {
      const mipmapName = `mipmap-${name}`;
      const destDir = path.join(androidRes, mipmapName);
      fs.mkdirSync(destDir, { recursive: true });
      const destPath = path.join(destDir, 'ic_launcher.png');
      
      try {
        fs.copyFileSync(outPublic, destPath);
        console.log(`📱 Copié vers Android: ${mipmapName}/ic_launcher.png`);
      } catch (error) {
        console.error(`❌ Erreur copie Android ${mipmapName}:`, error.message);
      }
    }
  }

  // Créer favicon.ico en copiant l'icône 32x32
  const favicon32 = path.join(publicDir, 'icon-32.png');
  const faviconIco = path.join(publicDir, 'favicon.ico');
  
  if (fs.existsSync(favicon32)) {
    fs.copyFileSync(favicon32, faviconIco);
    console.log('🌐 Favicon créé: favicon.ico');
  }

  console.log('\n🎉 Génération des icônes AfrikaPharma terminée !');
  console.log('\n📋 Icônes créées :');
  console.log('   • Icônes PWA (16px à 512px) ✅');
  console.log('   • Icônes Android (toutes densités) ✅');
  console.log('   • Icônes Apple Touch ✅');
  console.log('   • Favicon pour navigateurs ✅');
  console.log('\n💡 Votre app AfrikaPharma est maintenant prête pour tous les appareils !');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
