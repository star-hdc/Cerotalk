import fs from 'fs';

async function sync() {
  try {
    const state = JSON.parse(fs.readFileSync('./data/cerotalk-state.json', 'utf8'));

    const response = await fetch('https://cerotalk.vercel.app/api/cero-state', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(state)
    });

    if (!response.ok) {
      console.error("Sync failed:", response.status, await response.text());
    } else {
      console.log("Sync successful! Local state uploaded to Vercel.");
    }
  } catch (err) {
    console.error("Error during sync:", err);
  }
}

sync();
