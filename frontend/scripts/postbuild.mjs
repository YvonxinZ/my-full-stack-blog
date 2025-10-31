import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import rss from './rss.mjs';

async function postbuild() {
  await rss();
}

postbuild();
