
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

const garlicArticle = {
    title: "Manfaat Bawang Putih yang Terbukti Secara Ilmiah: Lebih dari Sekadar Bumbu Dapur",
    slug: "manfaat-bawang-putih-ilmiah-bahasa",
    categorySlug: "health-wellness",
    categoryName: "Health & Wellness",
    categoryDesc: "Tips dan wawasan untuk gaya hidup sehat.",
    tags: ["kesehatan", "nutrisi", "herbal", "sains"],
    excerpt: "Sebuah tinjauan mendalam tentang manfaat bawang putih bagi kesehatan jantung, imunitas, dan pencegahan penyakit kronis berdasarkan jurnal ilmiah terkini.",
    contentMarkdown: `# Manfaat Bawang Putih yang Terbukti Secara Ilmiah

Bawang putih (*Allium sativum L.*) telah digunakan selama ribuan tahun, tidak hanya sebagai penyedap masakan tetapi juga sebagai obat tradisional. Hippocrates, bapak kedokteran modern, bahkan meresepkannya untuk mengobati berbagai penyakit. Namun, apa kata sains modern?

Penelitian ekstensif dalam beberapa dekade terakhir, termasuk berbagai meta-analisis dan uji klinis pada manusia, telah mengonfirmasi banyak manfaat kesehatan dari bawang putih. Sebagian besar efek terapeutik ini berasal dari senyawa bioaktifnya, terutama senyawa sulfur organik seperti **allicin**, yang terbentuk saat bawang putih dicincang atau dihancurkan.

Berikut adalah 5 manfaat kesehatan utama dari bawang putih yang didukung oleh bukti ilmiah yang kuat.

## 1. Menurunkan Kolesterol Jahat (LDL)
Bagi mereka yang berjuang dengan kolesterol tinggi, bawang putih bisa menjadi suplemen alami yang efektif.

Sejumlah meta-analisis studi manusia menunjukkan bahwa konsumsi bawang putih dapat **menurunkan kolesterol total dan kolesterol LDL (jahat)** secara signifikan.
*   **Bukti Ilmiah**: Sebuah studi yang diterbitkan dalam *Journal of the Science of Food and Agriculture* menemukan bahwa suplementasi bawang putih dapat mengurangi kolesterol total sekitar **9-12%** pada individu dengan kadar kolesterol tinggi [1].
*   Efek ini tampaknya tidak berdampak signifikan pada kolesterol HDL (baik) atau trigliserida secara konsisten, namun penurunan LDL saja sudah merupakan langkah besar dalam mengurangi risiko penyakit jantung.

## 2. Menurunkan Tekanan Darah (Hipertensi)
Penyakit kardiovaskular seperti serangan jantung dan stroke adalah pembunuh nomor satu di dunia. Tekanan darah tinggi adalah salah satu faktor risiko utamanya.

Penelitian menunjukkan bahwa bawang putih memiliki dampak signifikan dalam menurunkan tekanan darah pada penderita hipertensi.
*   **Bukti Ilmiah**: Dalam beberapa kasus, efektivitas suplemen bawang putih (terutama *Aged Garlic Extract*) setara dengan obat standar seperti Atenolol. Sebuah meta-analisis melaporkan penurunan rata-rata tekanan darah sistolik sebesar **10-12 mmHg** dan diastolik sebesar **6-9 mmHg** [2].
*   Mekanisme ini diyakini terkait dengan polisulfida dalam bawang putih yang merangsang pelebaran pembuluh darah.

## 3. Sifat Antioksidan yang Kuat (Mencegah Alzheimer & Demensia)
Kerusakan oksidatif akibat radikal bebas berkontribusi pada proses penuaan dan penyakit kognitif.

Bawang putih mengandung antioksidan kuat yang mendukung mekanisme perlindungan tubuh terhadap kerusakan oksidatif.
*   **Bukti Ilmiah**: Studi menunjukkan bahwa dosis tinggi suplemen bawang putih meningkatkan enzim antioksidan pada manusia, serta secara signifikan mengurangi stres oksidatif pada mereka yang memiliki tekanan darah tinggi [3]. Efek gabungan pada pengurangan kolesterol, tekanan darah, dan sifat antioksidan ini diyakini dapat mengurangi risiko penyakit otak umum seperti penyakit Alzheimer dan demensia.

## 4. Potensi Pencegahan Kanker
Penelitian observasional dan uji klinis telah menunjukkan hubungan antara konsumsi bawang putih dan penurunan risiko jenis kanker tertentu.

*   **Kanker Gastrointestinal**: Meta-analisis menunjukkan bahwa asupan tinggi sayuran *allium* (termasuk bawang putih) terkait dengan penurunan risiko kanker lambung dan kolorektal (usus besar). Sebuah tinjauan sistematis menemukan bahwa mereka yang rutin mengonsumsi bawang putih mentah memiliki risiko lebih rendah terkena kanker hati dan kerongkongan [4].
*   **Mekanisme**: Senyawa organosulfur dalam bawang putih diduga menghambat pembentukan zat karsinogenik dan memblokir pertumbuhan sel tumor.

## 5. Meningkatkan Sistem Kekebalan Tubuh
Bawang putih dikenal sebagai peningkat imunitas alami.

*   **Bukti Ilmiah**: Sebuah studi 12 minggu yang besar menemukan bahwa suplementasi bawang putih setiap hari mengurangi jumlah pilek sebesar **63%** dibandingkan dengan plasebo. Selain itu, durasi rata-rata gejala pilek juga berkurang sebesar 70%, dari 5 hari pada kelompok plasebo menjadi hanya 1,5 hari pada kelompok bawang putih [5].

---

### Referensi
1.  *Journal of the Science of Food and Agriculture*, "Garlic supplementation and serum lipids: a meta-analysis."
2.  *Pakistan Journal of Pharmaceutical Sciences*, "Effects of garlic on blood pressure in patients with essential hypertension."
3.  *Journal of Nutrition*, "Aged garlic extract reduces blood pressure in hypertensives and prevents progression of coronary atherosclerosis."
4.  *Asian Pacific Journal of Cancer Prevention*, "Allium vegetables and risk of prostate cancer: a population-based study."
5.  *Advances in Therapy*, "Preventing the common cold with a garlic supplement: a double-blind, placebo-controlled survey."

> **Catatan**: Meskipun bawang putih aman bagi kebanyakan orang, konsultasikan dengan dokter Anda sebelum memulai suplemen rutin, terutama jika Anda mengonsumsi obat pengencer darah atau memiliki kondisi medis tertentu.
`
};


// --- Main Execution ---

async function main() {
  console.log("Starting Garlic Article Seeding...");
  
  // 1. Manage Category
  const existingCategories = await getCategories();
  let catId = existingCategories.find(c => c.slug === garlicArticle.categorySlug)?.id;

  if (!catId) {
     try {
        const newCat = await createCategory(garlicArticle.categoryName, garlicArticle.categorySlug, garlicArticle.categoryDesc);
        if (newCat && newCat.data) {
           catId = newCat.data.id;
        }
     } catch (e) {
        console.error(`Failed to create category ${garlicArticle.categoryName}`, e);
        return;
     }
  }

  // 2. Create Post
  const payload = {
    title: garlicArticle.title,
    slug: garlicArticle.slug,
    excerpt: garlicArticle.excerpt,
    contentMarkdown: garlicArticle.contentMarkdown,
    categoryId: catId,
    tags: garlicArticle.tags, // API expects array of slugs
    status: 'published',
    publishedAt: new Date().toISOString()
  };
    
  try {
    await createPost(payload);
    console.log(`Successfully created: ${garlicArticle.title}`);
  } catch (e) {
    if (e.message.includes('409')) {
        console.log(`Post already exists (skipped): ${garlicArticle.title}`);
    } else {
        console.error(`Error creating post ${garlicArticle.title}:`, e);
    }
  }

  console.log("Seeding completed.");
}

main().catch(console.error);
