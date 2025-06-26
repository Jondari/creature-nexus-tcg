#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ENV_SAMPLE_PATH = path.join(__dirname, '..', '.env.sample');
const ENV_PATH = path.join(__dirname, '..', '.env');

function setupEnv() {
  try {
    if (!fs.existsSync(ENV_SAMPLE_PATH)) {
      console.error('Error: .env.sample file not found');
      process.exit(1);
    }

    const envSampleContent = fs.readFileSync(ENV_SAMPLE_PATH, 'utf8');
    const envLines = envSampleContent.split('\n').map(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '' || trimmedLine.startsWith('#')) {
        return line;
      }

      const [key] = trimmedLine.split('=');
      if (key) {
        const envValue = process.env[key] || '';
        return `${key}=${envValue}`;
      }
      
      return line;
    });

    const envContent = envLines.join('\n');
    fs.writeFileSync(ENV_PATH, envContent);
    
    console.log('✅ Environment file created successfully from .env.sample');
  } catch (error) {
    console.error('Error setting up environment file:', error.message);
    process.exit(1);
  }
}

function createNetlifyRedirects() {
  const distPath = path.join(__dirname, '..', 'dist');
  const redirectsPath = path.join(distPath, 'server', '_redirects');
  
  if (!fs.existsSync(path.join(distPath, 'server'))) {
    console.log('⚠️  Skipping _redirects creation - server folder not found');
    return;
  }

  const redirectsContent = `# Static assets
/_expo/* /client/_expo/:splat 200
/assets/* /client/assets/:splat 200
/favicon.ico /client/favicon.ico 200

# Route handling
/ /(tabs)/index.html 200
/collection /(tabs)/collection.html 200
/profile /(tabs)/profile.html 200

# Catch-all fallback
/* /+not-found.html 404`;

  try {
    fs.writeFileSync(redirectsPath, redirectsContent);
    console.log('✅ Netlify _redirects file created successfully');
  } catch (error) {
    console.error('Error creating _redirects file:', error.message);
  }
}

setupEnv();
createNetlifyRedirects();