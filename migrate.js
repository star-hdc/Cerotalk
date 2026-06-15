import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

try {
  const state = JSON.parse(fs.readFileSync('./data/cerotalk-state.json', 'utf8'));

  const payload = {
    id: 'main',
    state: state,
    updated_at: new Date().toISOString()
  };

  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/cerotalk_state?on_conflict=id`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    console.error("Migration failed:", response.status, await response.text());
  } else {
    console.log("Migration successful!");
  }
} catch (err) {
  console.error("Error reading state or migrating:", err);
}
