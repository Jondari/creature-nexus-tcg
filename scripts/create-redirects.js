#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function createNetlifyRedirects() {
  const distPath = path.join(__dirname, '..', 'dist');
  const redirectsPath = path.join(distPath, 'server', '_redirects');
  
  if (!fs.existsSync(path.join(distPath, 'server'))) {
    console.error('Error: dist/server folder not found - run build first');
    process.exit(1);
  }

  const redirectsContent = `# Static assets
/_expo/* /client/_expo/:splat 200
/assets/* /client/assets/:splat 200
/favicon.ico /client/favicon.ico 200

# Route handling
/ /(tabs)/index.html 200
/auth /(auth)/index.html 200
/collection /(tabs)/collection.html 200
/profile /(tabs)/profile.html 200
/_sitemap /_sitemap.html 200

# Catch-all fallback
/* /+not-found.html 404`;

  try {
    fs.writeFileSync(redirectsPath, redirectsContent);
    console.log('✅ Netlify _redirects file created successfully');
  } catch (error) {
    console.error('Error creating _redirects file:', error.message);
    process.exit(1);
  }
}

createNetlifyRedirects();