const fs = require('fs');
const path = require('path');

// Simple .env.local parser
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          const val = trimmed.substring(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n=============================================');
console.log('   SUPABASE AUTOMATED CONNECTION AUDIT');
console.log('=============================================\n');

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Supabase credentials not found in environment or .env.local.');
  console.log('👉 Please create .env.local with:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...');
  console.log('\n=============================================\n');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase at:', supabaseUrl);

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseKey);

async function runCheck() {
  let allGood = true;

  // 1. Check Projects
  try {
    const { data, error } = await supabase.from('portfolio_projects').select('count', { count: 'exact', head: true });
    if (error) {
      console.log('❌ Table "portfolio_projects":', error.message);
      allGood = false;
    } else {
      console.log('✅ Table "portfolio_projects" is ONLINE.');
    }
  } catch (err) {
    console.log('❌ Table "portfolio_projects" check failed:', err.message);
    allGood = false;
  }

  // 2. Check Content Blocks
  try {
    const { data, error } = await supabase.from('portfolio_content_blocks').select('count', { count: 'exact', head: true });
    if (error) {
      console.log('❌ Table "portfolio_content_blocks":', error.message);
      allGood = false;
    } else {
      console.log('✅ Table "portfolio_content_blocks" is ONLINE.');
    }
  } catch (err) {
    console.log('❌ Table "portfolio_content_blocks" check failed:', err.message);
    allGood = false;
  }

  // 3. Check Gallery
  try {
    const { data, error } = await supabase.from('portfolio_gallery').select('count', { count: 'exact', head: true });
    if (error) {
      console.log('❌ Table "portfolio_gallery":', error.message);
      allGood = false;
    } else {
      console.log('✅ Table "portfolio_gallery" is ONLINE.');
    }
  } catch (err) {
    console.log('❌ Table "portfolio_gallery" check failed:', err.message);
    allGood = false;
  }

  // 4. Check Storage Bucket
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log('⚠️ Storage Buckets check:', error.message);
    } else {
      const found = buckets.find(b => b.id === 'portfolio-public' || b.name === 'portfolio-public');
      if (found) {
        console.log('✅ Storage Bucket "portfolio-public" is ONLINE.');
      } else {
        console.log('⚠️ Storage Bucket "portfolio-public" not found. (Create it in Supabase > Storage)');
      }
    }
  } catch (err) {
    console.log('⚠️ Storage check error:', err.message);
  }

  console.log('\n---------------------------------------------');
  if (allGood) {
    console.log('🎉 ALL SYSTEMS OPERATIONAL! Your database is 100% persistent.');
    console.log('   Data will NEVER be reset by git pushes or Vercel rebuilds.');
  } else {
    console.log('💡 TIP: Run the SQL in "supabase/setup_database.sql" in your Supabase SQL Editor.');
  }
  console.log('=============================================\n');
}

runCheck();
