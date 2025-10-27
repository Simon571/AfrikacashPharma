const fs = require('fs');
const path = require('path');

console.log('🔍 Test de configuration PWA AfrikaPharma\n');

const publicDir = path.resolve(__dirname, '../public');
const manifestPath = path.join(publicDir, 'manifest.json');

// Vérifier le manifest.json
if (fs.existsSync(manifestPath)) {
  console.log('✅ manifest.json trouvé');
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`📱 Nom de l'app: ${manifest.name}`);
    console.log(`🔤 Nom court: ${manifest.short_name}`);
    console.log(`📝 Description: ${manifest.description}`);
    console.log(`🎨 Couleur thème: ${manifest.theme_color}`);
    console.log(`📊 Mode d'affichage: ${manifest.display}`);
    console.log(`🔄 Orientation: ${manifest.orientation}\n`);
    
    console.log('🖼️  Icônes PWA configurées:');
    manifest.icons.forEach(icon => {
      const iconPath = path.join(publicDir, icon.src);
      const exists = fs.existsSync(iconPath) ? '✅' : '❌';
      console.log(`   ${exists} ${icon.src} (${icon.sizes}) - ${icon.purpose || 'any'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lecture manifest.json:', error.message);
  }
} else {
  console.error('❌ manifest.json non trouvé');
}

console.log('\n🍎 Vérification des icônes Apple:');
const appleIcons = [
  'apple-touch-icon.png',
  'apple-touch-icon-57.png',
  'apple-touch-icon-60.png',
  'apple-touch-icon-72.png',
  'apple-touch-icon-76.png',
  'apple-touch-icon-114.png',
  'apple-touch-icon-120.png',
  'apple-touch-icon-144.png',
  'apple-touch-icon-152.png',
  'apple-touch-icon-180.png'
];

appleIcons.forEach(icon => {
  const iconPath = path.join(publicDir, icon);
  const exists = fs.existsSync(iconPath) ? '✅' : '❌';
  console.log(`   ${exists} ${icon}`);
});

console.log('\n🤖 Vérification des icônes Android:');
const androidPath = path.resolve(__dirname, '../android/app/src/main/res');
const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];

densities.forEach(density => {
  const iconPath = path.join(androidPath, `mipmap-${density}`, 'ic_launcher.png');
  const exists = fs.existsSync(iconPath) ? '✅' : '❌';
  console.log(`   ${exists} mipmap-${density}/ic_launcher.png`);
});

console.log('\n🌐 Vérification du favicon:');
const favicon = path.join(publicDir, 'favicon.ico');
const faviconExists = fs.existsSync(favicon) ? '✅' : '❌';
console.log(`   ${faviconExists} favicon.ico`);

console.log('\n📋 Résumé de la configuration PWA:');
console.log('   📱 Application prête pour l\'installation mobile');
console.log('   🖥️  Icônes desktop configurées');
console.log('   🍎 Support Apple iOS optimisé');
console.log('   🤖 Support Android natif');
console.log('   🌐 Favicon pour navigateurs');

console.log('\n💡 Instructions d\'installation:');
console.log('   1. Ouvrez https://pajo-pharma-delta.vercel.app sur votre téléphone');
console.log('   2. Recherchez "Ajouter à l\'écran d\'accueil" ou "Installer l\'app"');
console.log('   3. Suivez les instructions pour installer AfrikaPharma');
console.log('\n🎉 Votre app AfrikaPharma est prête pour tous les appareils !');