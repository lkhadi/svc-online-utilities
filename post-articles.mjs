const fs = require('fs');
const https = require('https');

const API_BASE_URL = 'http://localhost:3000/api/blog';
const CATEGORY_API_URL = `${API_BASE_URL}/categories`;
const POST_API_URL = `${API_BASE_URL}/posts`;

const categories = [
  {
    slug: 'platform-engineering',
    name: 'Platform Engineering',
    description: 'Articles about platform engineering, Internal Developer Platforms (IDP), and developer experience optimization'
  },
  {
    slug: 'automation',
    name: 'Automation',
    description: 'Articles about workflow automation, integration tools, and productivity enhancement'
  }
];

const posts = [
  {
    title: 'Platform Engineering 2.0: The Next Evolution in Software Delivery Infrastructure',
    slug: 'platform-engineering-2.0-next-evolution',
    contentMarkdown: fs.readFileSync('./articles/platform-engineering-2.0.md', 'utf8'),
    excerpt: 'Platform Engineering 2.0 represents the maturation phase of this discipline, emphasizing pragmatic implementation, data-driven decision making, and a focus on delivering measurable business value.',
    categoryId: null,
    metaTitle: 'Platform Engineering 2.0: From Hype to Reality',
    metaDescription: 'Discover how Platform Engineering 2.0 is transforming software delivery with AI augmentation, golden paths, and Pareto efficiency principles.',
    status: 'published',
    tags: ['platform-engineering', 'devops', 'idp', 'golden-paths', 'ai-augmented-engineering'],
    categorySlug: 'platform-engineering'
  },
  {
    title: 'n8n Automation: A Complete Guide with Real-World Use Cases',
    slug: 'n8n-automation-complete-guide',
    contentMarkdown: fs.readFileSync('./articles/n8n-automation-complete-guide.md', 'utf8'),
    excerpt: 'A comprehensive guide to n8n workflow automation covering 10 essential use cases, from social media management to database backups, with real-world implementation examples.',
    categoryId: null,
    metaTitle: 'n8n Automation Guide: Workflows, Integrations, and Use Cases',
    metaDescription: 'Master n8n automation with this complete guide covering social media management, data synchronization, CRM automation, and advanced AI capabilities.',
    status: 'published',
    tags: ['automation', 'n8n', 'workflows', 'productivity', 'ai-automation', 'rag'],
    categorySlug: 'automation'
  }
];

function fixDoubleEscapedNewlines(content) {
  return content.replace(/\\n/g, "\n");
}

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: jsonData });
          } else {
            reject({ status: res.statusCode, error: jsonData.error || data });
          }
        } catch (e) {
          reject({ status: res.statusCode, error: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (e) => {
      reject({ error: e.message });
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function createCategories() {
  console.log('Step 1: Creating categories...\n');

  for (const category of categories) {
    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      };

      const result = await makeRequest(CATEGORY_API_URL, options);
      console.log(`✓ Category "${category.name}" created (ID: ${result.data.data.id})`);

      if (category.slug === 'platform-engineering') {
        posts[0].categoryId = result.data.data.id;
      } else if (category.slug === 'automation') {
        posts[1].categoryId = result.data.data.id;
      }
    } catch (error) {
      if (error.status === 409) {
        console.log(`⚠ Category "${category.name}" already exists (slug: ${category.slug})`);
        try {
          const listResult = await makeRequest(CATEGORY_API_URL, { method: 'GET' });
          const existingCategory = listResult.data.data.find(c => c.slug === category.slug);
          if (existingCategory) {
            if (category.slug === 'platform-engineering') {
              posts[0].categoryId = existingCategory.id;
            } else if (category.slug === 'automation') {
              posts[1].categoryId = existingCategory.id;
            }
            console.log(`  → Using existing category ID: ${existingCategory.id}`);
          }
        } catch (listError) {
          console.error(`  ✗ Failed to fetch category list:`, listError);
        }
      } else {
        console.error(`  ✗ Failed to create category "${category.name}":`, error);
      }
    }
  }

  console.log('\n');
}

async function createPosts() {
  console.log('Step 2: Creating posts...\n');

  for (const post of posts) {
    try {
      const fixedContent = fixDoubleEscapedNewlines(post.contentMarkdown);

      const postData = {
        title: post.title,
        slug: post.slug,
        contentMarkdown: fixedContent,
        excerpt: post.excerpt,
        categoryId: post.categoryId,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        status: post.status,
        tags: post.tags
      };

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      };

      const result = await makeRequest(POST_API_URL, options);
      console.log(`✓ Post "${post.title}" created (ID: ${result.data.data.id})`);
      console.log(`  Slug: ${result.data.data.slug}`);
    } catch (error) {
      if (error.status === 409) {
        console.log(`⚠ Post "${post.title}" already exists (slug: ${post.slug})`);
      } else {
        console.error(`  ✗ Failed to create post "${post.title}":`, error);
      }
    }
    console.log('');
  }
}

async function main() {
  try {
    console.log('=== Blog Article Seeder ===\n');
    console.log(`API Base URL: ${API_BASE_URL}\n`);

    await createCategories();
    await createPosts();

    console.log('=== All operations completed ===\n');
    console.log('\nNext steps:');
    console.log('1. Verify posts at: ' + `${POST_API_URL}?status=published`);
    console.log('2. Check database for correct data rendering');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
