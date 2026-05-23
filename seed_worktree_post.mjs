
import fs from 'fs';

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

const worktreeArticle = {
    title: "Mastering Git Worktree: A Developer's Guide to Efficient Multitasking",
    slug: "mastering-git-worktree-guide",
    categorySlug: "technology",
    categoryName: "Technology",
    categoryDesc: "Latest technology trends, tools, and best practices.",
    tags: ["git", "workflow", "devops", "productivity"],
    excerpt: "Stop stashing and cloning! Learn how Git Worktree can revolutionize your development workflow with parallel working directories.",
    contentMarkdown: `# Mastering Git Worktree

Every developer knows the struggle: You're deep in the zone working on a new feature, numerous files are modified, the app is in a broken state... and suddenly, a critical bug report comes in. "Can you fix this ASAP?"

In the old days, you had two painful choices:
1.  **Git Stash**: \`git stash save "wip feature"\` -> switch branch -> fix bug -> \`git stash pop\`. This is fast but risky. Resolving stash conflicts is a nightmare, and your \`node_modules\` or build artifacts might be out of sync.
2.  **Git Clone**: Clone the entire repo again into a new folder. This is safe but slow, wastes disk space, and requires setting up your \`env\` files and dependencies all over again.

Enter **Git Worktree**.

## What is Git Worktree?

Introduced in Git 2.5, \`git worktree\` allows you to have **multiple working directories** attached to the **same repository**.

Imagine specific folders on your disk for specific branches:
*   \`/projects/my-app/main\` (checked out to \`main\`)
*   \`/projects/my-app/feature-x\` (checked out to \`feature/x\`)
*   \`/projects/my-app/hotfix\` (checked out to \`hotfix/login-bug\`)

All of them share the same \`.git\` object database. This means:
*   **Zero overhead**: No need to re-download the repo history.
*   **Instant switching**: Just \`cd\` into the folder.
*   **Isolated environments**: You can run different versions of the app, run tests, or install different dependencies simultaneously without them conflicting.

## Basic Usage

### 1. Adding a Worktree

Let's say you are in your main project folder and want to start a hotfix without touching your current work.

\`\`\`bash
# Syntax: git worktree add <path> <branch>
git worktree add ../my-app-hotfix master
\`\`\`

This command creates a new folder \`../my-app-hotfix\` at the same level as your current folder and checks out the \`master\` branch there.

If you want to create a *new* branch in that worktree:

\`\`\`bash
git worktree add -b fix/urgent-bug ../my-app-hotfix master
\`\`\`

### 2. Listing Worktrees

To see all your active worktrees:

\`\`\`bash
git worktree list
\`\`\`

Output:
\`\`\`text
/Users/dev/projects/my-app         (main)
/Users/dev/projects/my-app-hotfix  (fix/urgent-bug)
\`\`\`

### 3. Removing a Worktree

Once you are done with the hotfix and have merged it:

\`\`\`bash
# 1. Delete the folder
rm -rf ../my-app-hotfix

# 2. Tell git to clean up metadata
git worktree prune
\`\`\`

Alternatively, you can use \`git worktree remove ../my-app-hotfix\`, which handles both steps safely (it warns you if you have uncommitted changes).

---

## Pro Workflow: The "Bare Repository" Method

For the ultimate clean setup, many senior developers use a **Bare Repository**.

Standard cloning puts the \`.git\` folder *inside* your working directory. A bare clone *is* the \`.git\` folder. This allows you to treat *all* branches as equal worktrees, keeping your project directory clean.

### Step 1: Clone as Bare

Instead of a normal clone, create a directory for your project and clone with \`--bare\`.

\`\`\`bash
mkdir my-super-app
cd my-super-app
git clone --bare git@github.com:username/repo.git .bare
\`\`\`

Now, create a special \`.git\` file that points to this bare directory so standard git commands work in the root.

\`\`\`bash
echo "gitdir: ./.bare" > .git
\`\`\`

**Note**: You need to configure the bare repo to fetch remote branches correctly:
\`\`\`bash
cd .bare
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
cd ..
\`\`\`

### Step 2: Create Worktrees

Now, never work in the root. Create a worktree for everything.

\`\`\`bash
# Create main branch folder
git worktree add main

# Create feature folder
git worktree add -b feature/login features/login
\`\`\`

### Step 3: Enjoy the Structure

Your folder structure now looks like this:

\`\`\`text
my-super-app/
├── .bare/            # The Git database (do not touch)
├── .git              # Pointer file
├── main/             # The main branch code
├── features/
│   └── login/        # The feature branch code
└── hotfixes/
    └── urgent/       # The hotfix branch code
\`\`\`

Now you can run the backend in \`main/\` while developing the frontend in \`features/login/\` simultaneously!

## Best Practices & Pitfalls

1.  **Don't checkout the same branch twice**: Git won't let you checkout \`main\` in two different worktrees simultaneously to prevent state corruption.
2.  **Dependency Management**: Remember that each worktree is a fresh checkout. You will need to run \`npm install\` (or equivalent) in each new worktree. This is a good thing—it ensures your dependencies are exactly what that branch expects.
3.  **Local Config**: Since they share the \`.git\` folder, your global \`.git/config\` is shared. However, files ignored by git (like \`.env\`) need to be copied to each worktree.

## Conclusion

\`git worktree\` is a powerful tool that, once adopted, makes it hard to go back. It encourages smaller, more focused workspaces and enables true multitasking without the headache of context switching. Give it a try on your next complex feature!
`
};


// --- Main Execution ---

async function main() {
  console.log("Starting Git Worktree Article Seeding...");
  
  // 1. Manage Category
  const existingCategories = await getCategories();
  let catId = existingCategories.find(c => c.slug === worktreeArticle.categorySlug)?.id;

  if (!catId) {
     try {
        const newCat = await createCategory(worktreeArticle.categoryName, worktreeArticle.categorySlug, worktreeArticle.categoryDesc);
        if (newCat && newCat.data) {
           catId = newCat.data.id;
        }
     } catch (e) {
        console.error(`Failed to create category ${worktreeArticle.categoryName}`, e);
        // Fallback: try to find it again or just skip (if reusing existing "Technology" it should be found)
     }
  } else {
      console.log(`Using existing category: ${worktreeArticle.categoryName} (ID: ${catId})`);
  }

  // 2. Create Post
  const payload = {
    title: worktreeArticle.title,
    slug: worktreeArticle.slug,
    excerpt: worktreeArticle.excerpt,
    contentMarkdown: worktreeArticle.contentMarkdown,
    categoryId: catId,
    tags: worktreeArticle.tags, // API expects array of slugs
    status: 'published',
    publishedAt: new Date().toISOString()
  };
    
  try {
    await createPost(payload);
    console.log(`Successfully created: ${worktreeArticle.title}`);
  } catch (e) {
    if (e.message.includes('409')) {
        console.log(`Post already exists (skipped): ${worktreeArticle.title}`);
    } else {
        console.error(`Error creating post ${worktreeArticle.title}:`, e);
    }
  }

  console.log("Seeding completed.");
}

main().catch(console.error);
