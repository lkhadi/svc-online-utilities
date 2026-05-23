
import fs from 'fs/promises';
import path from 'path';

const API_BASE = 'http://localhost:3000/api/blog';

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
    console.error(`Request failed: ${url}`, err.message);
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

// --- Content Data ---

const articlesMeta = [
  {
    filePath: '/Users/lkhadi/docker/htdocs/webutility/articles/n8n-automation-complete-guide.md',
    title: "n8n Automation: A Complete Guide with Real-World Use Cases",
    slug: "n8n-automation-complete-guide",
    categorySlug: "technology",
    categoryName: "Technology",
    tags: ["automation", "n8n", "workflows", "guide"],
    excerpt: "Discover how n8n represents a paradigm shift in workflow automation, enabling organizations to connect over 800 services with a visual, self-hostable platform."
  },
  {
    filePath: '/Users/lkhadi/docker/htdocs/webutility/articles/platform-engineering-2.0.md',
    title: "Platform Engineering 2.0: The Next Evolution in Software Delivery Infrastructure",
    slug: "platform-engineering-2-0",
    categorySlug: "technology",
    categoryName: "Technology",
    tags: ["platform-engineering", "devops", "infrastructure", "software-delivery"],
    excerpt: "Explore the evolution of Platform Engineering from experimental hype to a mature discipline centered on Internal Developer Platforms and golden paths."
  }
];

// --- Main Execution ---

async function main() {
  console.log("Starting Extra Blog Post Seeding...");
  
  // 1. Manage Categories
  const existingCategories = await getCategories();
  const categoryMap = new Map(); // slug -> id
  existingCategories.forEach(c => categoryMap.set(c.slug, c.id));

  // Ensure "Technology" exists (it likely does, but just in case)
  const neededCategories = [
    { name: "Technology", slug: "technology", description: "Latest technology trends and breakthroughs." }
  ];

  for (const cat of neededCategories) {
    if (categoryMap.has(cat.slug)) {
      console.log(`Category exists: ${cat.name}`);
    } else {
      try {
        const newCat = await createCategory(cat.name, cat.slug, cat.description);
        if (newCat && newCat.data) {
           categoryMap.set(cat.slug, newCat.data.id);
        }
      } catch (e) {
        console.error(`Failed to create category ${cat.name}`, e);
      }
    }
  }

  // 2. Create Posts
  for (const articleMeta of articlesMeta) {
    // Read content
    try {
        const contentMarkdown = await fs.readFile(articleMeta.filePath, 'utf-8');
        
        // Check if category ID is available
        const catId = categoryMap.get(articleMeta.categorySlug);
        if (!catId) {
            console.error(`Skipping ${articleMeta.title}: Category ID not found for ${articleMeta.categorySlug}`);
            continue;
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
        
        // We try to create. If it fails due to duplicate slug (409), we ignore it.
        try {
            await createPost(payload);
            console.log(`Successfully created: ${articleMeta.title}`);
        } catch (e) {
            if (e.message.includes('409')) {
                console.log(`Post already exists (skipped): ${articleMeta.title}`);
            } else {
                console.error(`Error creating post ${articleMeta.title}:`, e);
            }
        }

    } catch (readErr) {
        console.error(`Failed to read file for ${articleMeta.title}: ${readErr.message}`);
    }
  }

  console.log("Seeding completed.");
}

main().catch(console.error);
