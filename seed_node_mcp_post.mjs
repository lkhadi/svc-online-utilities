
import fs from 'fs';

const API_BASE = 'http://localhost:3000/api/blog';
const ARTICLE_PATH = './node_mcp_article.md';

// --- Helper Functions ---

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
       const data = await res.json();
       if (!res.ok) {
        throw new Error(`API Error ${res.status}: ${JSON.stringify(data)}`);
       }
       return data;
    } else {
        if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
        return null;
    }
  } catch (err) {
    throw err;
  }
}

async function getCategories() {
  const res = await fetchJson(`${API_BASE}/categories`);
  return res.data || [];
}

async function createCategory(name, slug, description = '') {
  console.log(`Creating category: ${name}`);
  return await fetchJson(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, slug, description })
  });
}

async function createPost(post) {
  console.log(`Creating post: ${post.title}`);
  return await fetchJson(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post)
  });
}

async function main() {
  console.log("Starting Node.js MySQL MCP Tutorial Seeding...");
  
  let contentMarkdown;
  try {
      contentMarkdown = fs.readFileSync(ARTICLE_PATH, 'utf8');
  } catch (e) {
      console.error(`Error reading article file at ${ARTICLE_PATH}:`, e);
      process.exit(1);
  }

  const articleMeta = {
      title: "How to Build a MySQL-Connected MCP Server with Node.js",
      slug: "node-js-mcp-mysql-tutorial",
      categorySlug: "tutorials", 
      categoryName: "Tutorials",
      categoryDesc: "Step-by-step guides for developers.",
      tags: ["nodejs", "mcp", "mysql", "tutorial", "backend", "ai"],
      excerpt: "Learn how to build a powerful MCP server that gives AI agents direct SQL access to your MySQL database using Node.js."
  };

  const existingCategories = await getCategories();
  let catId = existingCategories.find(c => c.slug === articleMeta.categorySlug)?.id;

  if (!catId) {
     try {
        const newCat = await createCategory(articleMeta.categoryName, articleMeta.categorySlug, articleMeta.categoryDesc);
        if (newCat && newCat.data) {
           catId = newCat.data.id;
        }
     } catch (e) {
        console.error(`Failed to create category ${articleMeta.categoryName}`, e);
     }
  } else {
      console.log(`Using existing category: ${articleMeta.categoryName} (ID: ${catId})`);
  }

  const payload = {
    title: articleMeta.title,
    slug: articleMeta.slug,
    excerpt: articleMeta.excerpt,
    contentMarkdown: contentMarkdown,
    categoryId: catId,
    tags: articleMeta.tags,
    status: 'published',
    publishedAt: new Date().toISOString()
  };
    
  try {
    await createPost(payload);
    console.log(`Successfully created: ${articleMeta.title}`);
  } catch (e) {
    if ((e.message && e.message.includes('409')) || (e.toString().includes('409'))) {
        console.log(`Post already exists (skipped): ${articleMeta.title}`);
    } else {
        console.error(`Error creating post ${articleMeta.title}:`, e);
    }
  }

  console.log("Seeding completed.");
}

main().catch(console.error);
