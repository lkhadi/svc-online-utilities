
import postgres from 'postgres';

// Load credentials directly since we are in a one-off script
const sql = postgres({
  host: '192.168.1.110', 
  port: 5432,
  database: 'meskipun',
  username: 'meskipun',
  password: 'yZ3*c8J#&H@YCJ',
});

const SLUG_TO_DELETE = 'node-js-mcp-sqlite-tutorial';

async function main() {
  console.log(`Attempting to delete post with slug: ${SLUG_TO_DELETE}`);
  
  try {
    const result = await sql`
      DELETE FROM blog_posts 
      WHERE slug = ${SLUG_TO_DELETE}
      RETURNING id, title
    `;
    
    if (result.length > 0) {
      console.log(`Successfully deleted post: "${result[0].title}" (ID: ${result[0].id})`);
    } else {
      console.log('No post found with that slug.');
    }
  } catch (err) {
    console.error('Error deleting post:', err);
  } finally {
    await sql.end();
  }
}

main();
