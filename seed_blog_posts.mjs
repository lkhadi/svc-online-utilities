
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

async function getTags() {
  const res = await fetchJson(`${API_BASE}/tags`);
  return res.data || [];
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

const articles = [
  // --- PETS (English) ---
  {
    title: "Pets & Animals Trends 2026: Wellness, Tech, and Lifestyle",
    slug: "pets-animals-trends-2026-english",
    categorySlug: "pets-animals",
    categoryName: "Pets & Animals",
    tags: ["trends-2026", "pets", "wellness"],
    rawTags: ["Trends 2026", "Pets", "Wellness"],
    excerpt: "From a $500B industry boom to breed-specific nutrition, explore the top 5 trends shaping the pet world in 2026.",
    contentMarkdown: `# Pets & Animals Trends in 2026

The bond between humans and their animal companions continues to deepen, transforming the pet industry into a powerhouse of innovation and care. As we look towards 2026, several key trends are set to redefine how we live with and care for our pets.

## 1. Global Pet Industry to Reach $500B
The pet economy is thriving. By 2030, the global pet industry is projected to reach a staggering **$500 billion**. This growth is driven by the humanization of pets, where owners treat their furry friends as integral family members, willing to spend more on premium healthcare, food, and services.

## 2. Rise of Calming Treats and Immune Boosters
As pet owners become more health-conscious, the market for functional treats is surging. In 2026, expect to see a massive increase in:
*   **Calming Treats**: To help pets cope with separation anxiety and noise phobias.
*   **Immune-Boosting Supplements**: Probiotics and nutrient-rich formats designed to prolong lifespan and vitality.

## 3. Pet-Centric Interior Design
"Barkitecture" is going mainstream. Home design is no longer just about human comfort. We are seeing a boom in:
*   **Cat Walls**: Vertical playgrounds integrated into living room decor.
*   **Cat Sofas**: Furniture designed to withstand scratching while looking stylish.
*   **Integrated Pet Furniture**: Crates that double as side tables and hidden litter boxes.

## 4. The Wellness Connection
There is a growing recognition of the **connection between pet wellness and human wellness**. A healthy pet contributes to a happy home. Apps and services that track pet health are integrating with human wellness platforms, encouraging activities like walking and outdoor play that benefit both owner and pet.

## 5. Breed-Specific Nutrition and Safety
One size does not fit all. 2026 will see a refinement in products tailored to specific breeds. From **breed-specific nutrition plans** that address unique genetic health predispositions to safety gear designed for specific body shapes, personalization is the new standard.
`
  },
  // --- PETS (Bahasa) ---
  {
    title: "Tren Hewan Peliharaan 2026: Kesejahteraan dan Gaya Hidup",
    slug: "tren-hewan-peliharaan-2026-bahasa",
    categorySlug: "pets-animals",
    categoryName: "Pets & Animals",
    tags: ["trends-2026", "pets", "kesejahteraan"],
    rawTags: ["Trends 2026", "Pets", "Wellness"],
    excerpt: "Dari industri senilai $500M hingga nutrisi khusus ras, jelajahi 5 tren utama yang membentuk dunia hewan peliharaan di tahun 2026.",
    contentMarkdown: `# Tren Hewan Peliharaan & Hewan di Tahun 2026

Ikatan antara manusia dan hewan peliharaan mereka terus mendalam, mengubah industri hewan peliharaan menjadi pusat inovasi dan perawatan. Menatap tahun 2026, beberapa tren utama akan mendefinisikan ulang cara kita hidup bersama dan merawat hewan peliharaan kita.

## 1. Industri Hewan Peliharaan Global Mencapai $500 Miliar
Ekonomi hewan peliharaan sedang berkembang pesat. Pada tahun 2030, industri hewan peliharaan global diproyeksikan mencapai **$500 miliar**. Pertumbuhan ini didorong oleh "manusiawi-sasi" hewan peliharaan, di mana pemilik memperlakukan teman berbulu mereka sebagai anggota keluarga inti, dan bersedia membelanjakan lebih banyak untuk perawatan kesehatan, makanan, dan layanan premium.

## 2. Lonjakan Camilan Penenang dan Peningkat Imun
Seiring pemilik hewan peliharaan menjadi lebih sadar kesehatan, pasar untuk camilan fungsional melonjak. Pada tahun 2026, kita akan melihat peningkatan besar dalam:
*   **Camilan Penenang**: Membantu hewan mengatasi kecemasan perpisahan dan fobia suara.
*   **Suplemen Peningkat Imun**: Probiotik dan format kaya nutrisi yang dirancang untuk memperpanjang usia dan vitalitas.

## 3. Desain Interior Ramah Hewan
"Barkitecture" menjadi arus utama. Desain rumah tidak lagi hanya tentang kenyamanan manusia. Kita melihat ledakan dalam:
*   **Dinding Kucing**: Taman bermain vertikal yang terintegrasi ke dalam dekorasi ruang tamu.
*   **Sofa Kucing**: Furnitur yang dirancang untuk tahan cakaran namun tetap terlihat bergaya.
*   **Furnitur Hewan Terintegrasi**: Kandang yang berfungsi ganda sebagai meja samping dan kotak pasir tersembunyi.

## 4. Koneksi Kesejahteraan (Wellness)
Ada pengakuan yang kian tumbuh tentang **hubungan antara kesejahteraan hewan dan manusia**. Hewan peliharaan yang sehat berkontribusi pada rumah yang bahagia. Aplikasi dan layanan yang melacak kesehatan hewan mulai berintegrasi dengan platform kesehatan manusia, mendorong aktivitas seperti berjalan kaki dan bermain di luar ruangan yang bermanfaat bagi pemilik dan hewan peliharaan.

## 5. Nutrisi dan Keamanan Spesifik Ras
Satu ukuran tidak cocok untuk semua. Tahun 2026 akan melihat penyempurnaan dalam produk yang disesuaikan untuk ras tertentu. Dari **rencana nutrisi spesifik ras** yang menangani predisposisi kesehatan genetik unik hingga perlengkapan keamanan yang dirancang untuk bentuk tubuh tertentu, personalisasi adalah standar baru.
`
  },
  // --- TECH (English) ---
  {
    title: "Technology Trends 2026: The Year of Truth for AI",
    slug: "technology-trends-2026-english",
    categorySlug: "technology",
    categoryName: "Technology",
    tags: ["trends-2026", "ai", "computing"],
    rawTags: ["Trends 2026", "AI", "Computing"],
    excerpt: "2026 marks a shift from hype to impact for AI, alongside breakthroughs in quantum computing and edge AI.",
    contentMarkdown: `# Technology Trends in 2026

The technological landscape moves at breakneck speed. As we enter 2026, the focus shifts from experimental hype to tangible, real-world utility across several frontiers.

## 1. The Year of Truth for AI
After years of skyrocketing expectations, 2026 represents a maturing point. It is the **Year of Truth for AI**, marking a shift from hype to measurable impact. Companies and consumers alike are demanding productivity gains and reliable performance over novel demonstrations. The focus is no longer just on what AI *can* do, but what it *does* effectively reliably.

## 2. Quantum Outperforming Classical
We are approaching a pivotal moment where **Quantum computers are expected to outperform classical supercomputers** in specific, highly complex tasks. This "quantum advantage" will begin to unlock new possibilities in materials science, cryptography, and complex system simulations that were previously impossible.

## 3. Neuromorphic and Edge AI Advancements
Computing is becoming more brain-like and decentralized.
*   **Neuromorphic Computing**: Chips designed to mimic the human brain's neural structure are becoming more viable, offering massive efficiency gains.
*   **Edge AI**: Processing power is moving to the device itself (the "edge"), reducing latency and reliance on the cloud for real-time applications like autonomous vehicles and IoT.

## 4. Robotaxi Expansion
Autonomous mobility is scaling up. **Robotaxi services are expanding** beyond limited test beds to freeways and new major cities. Regulatory frameworks are catching up, allowing for broader commercial deployment and changing the fabric of urban transportation.

## 5. Datacenters Going Global
The infrastructure powering our digital lives is decentralizing. **Datacenters are proliferating beyond the US and China**, creating a more robust and distributed global network. This expansion is driven by data sovereignty laws, the need for lower latency in emerging markets, and the insatiable energy demands of AI training clusters.
`
  },
  // --- TECH (Bahasa) ---
  {
    title: "Tren Teknologi 2026: Tahun Kebenaran bagi AI",
    slug: "tren-teknologi-2026-bahasa",
    categorySlug: "technology",
    categoryName: "Technology",
    tags: ["trends-2026", "ai", "komputasi"],
    rawTags: ["Trends 2026", "AI", "Computing"],
    excerpt: "2026 menandai pergeseran dari hype ke dampak nyata bagi AI, bersama dengan terobosan dalam komputasi kuantum dan edge AI.",
    contentMarkdown: `# Tren Teknologi di Tahun 2026

Lanskap teknologi bergerak dengan kecepatan luar biasa. Memasuki tahun 2026, fokus bergeser dari eksperimen yang penuh "hype" menjadi utilitas nyata di dunia nyata di berbagai lini.

## 1. Tahun Kebenaran bagi AI
Setelah bertahun-tahun ekspektasi yang melambung tinggi, 2026 mewakili titik kedewasaan. Ini adalah **Tahun Kebenaran bagi AI**, menandai pergeseran dari hype ke dampak yang terukur. Perusahaan dan konsumen sama-sama menuntut peningkatan produktivitas dan kinerja yang andal daripada sekadar demonstrasi baru. Fokusnya bukan lagi hanya pada apa yang *bisa* dilakukan AI, tetapi apa yang *dilakukannya* secara efektif dan andal.

## 2. Kuantum Mengungguli Klasik
Kita mendekati momen penting di mana **komputer Kuantum diperkirakan akan mengungguli superkomputer klasik** dalam tugas-tugas spesifik yang sangat kompleks. "Keunggulan kuantum" ini akan mulai membuka kemungkinan baru dalam sains material, kriptografi, dan simulasi sistem kompleks yang sebelumnya mustahil.

## 3. Kemajuan Neuromorphic dan Edge AI
Komputasi menjadi semakin mirip otak dan terdesentralisasi.
*   **Komputasi Neuromorphic**: Chip yang dirancang untuk meniru struktur saraf otak manusia menjadi semakin layak, menawarkan keuntungan efisiensi yang masif.
*   **Edge AI**: Kekuatan pemrosesan bergerak ke perangkat itu sendiri ("edge"), mengurangi latensi dan ketergantungan pada cloud untuk aplikasi real-time seperti kendaraan otonom dan IoT.

## 4. Ekspansi Robotaxi
Mobilitas otonom sedang meningkat. **Layanan Robotaxi berkembang** melampaui area uji coba terbatas ke jalan raya dan kota-kota besar baru. Kerangka kerja regulasi mulai mengejar ketertinggalan, memungkinkan penyebaran komersial yang lebih luas dan mengubah tatanan transportasi perkotaan.

## 5. Pusat Data Mengglobal
Infrastruktur yang mendukungi kehidupan digital kita sedang mendesentralisasi. **Pusat data (datacenters) berkembang biak di luar AS dan Cina**, menciptakan jaringan global yang lebih kuat dan terdistribusi. Ekspansi ini didorong oleh undang-undang kedaulatan data, kebutuhan akan latensi yang lebih rendah di pasar berkembang, dan permintaan energi yang tak terpuaskan dari kluster pelatihan AI.
`
  },
  // --- SPORTS (English) ---
  {
    title: "Sports Trends 2026: Major Events and New Games",
    slug: "sports-trends-2026-english",
    categorySlug: "sports",
    categoryName: "Sports",
    tags: ["trends-2026", "sports", "football"],
    rawTags: ["Trends 2026", "Sports", "Football"],
    excerpt: "From the FIFA World Cup 2026 driving US soccer growth to the explosion of Padel, discover what's shaping sports in 2026.",
    contentMarkdown: `# Sports Trends in 2026

2026 is set to be a landmark year for sports, characterized by massive global events and the rapid rise of new disciplines.

## 1. FIFA World Cup 2026
The **FIFA World Cup 2026**, hosted jointly by the US, Canada, and Mexico, is a colossal event. It is expected to be a primary driver for **US soccer growth**, engaging an estimated **62 million fans** in the region. The cultural impact will be profound, solidifying soccer's place in the mainstream North American sports landscape.

## 2. The Explosion of Padel
A hybrid of tennis and squash, **Padel is exploding globally**. With over **52 million followers** and players, it is one of the fastest-growing sports in the world. Its social nature and relatively easy learning curve are driving rapid adoption in clubs and communities everywhere.

## 3. College Football Recruiting 2026
In the US, the spotlight shines bright on the next generation. **College football recruiting rankings for the 2026 season** are more scrutinized than ever, with Name, Image, and Likeness (NIL) deals transforming how talent is scouted and secured.

## 4. NFL Draft and CFP Stars
The synergy between college and pro football tightens. **NFL draft projections** are heavily featuring stars from the expanded **College Football Playoff (CFP)**. Performance in these high-stakes college games is becoming the ultimate audition for professional careers.

## 5. Visa Exemptions for Athletes
To facilitate the global nature of modern sports, we are seeing policy shifts. **Athletes are increasingly receiving visa exemptions** for major sporting events. This streamlines logistics for international competitions, ensuring that the best talent from around the world can compete without bureaucratic hurdles.
`
  },
  // --- SPORTS (Bahasa) ---
  {
    title: "Tren Olahraga 2026: Ajang Besar dan Permainan Baru",
    slug: "tren-olahraga-2026-bahasa",
    categorySlug: "sports",
    categoryName: "Sports",
    tags: ["trends-2026", "sports", "sepakbola"],
    rawTags: ["Trends 2026", "Sports", "Football"],
    excerpt: "Dari Piala Dunia FIFA 2026 yang memacu pertumbuhan sepak bola AS hingga ledakan Padel, temukan apa yang membentuk olahraga di 2026.",
    contentMarkdown: `# Tren Olahraga di Tahun 2026

Tahun 2026 akan menjadi tahun bersejarah bagi olahraga, ditandai dengan acara global besar-besaran dan kebangkitan cepat disiplin baru.

## 1. Piala Dunia FIFA 2026
**Piala Dunia FIFA 2026**, yang diselenggarakan bersama oleh AS, Kanada, dan Meksiko, adalah acara kolosal. Ini diharapkan menjadi pendorong utama bagi **pertumbuhan sepak bola AS**, melibatkan sekitar **62 juta penggemar** di wilayah tersebut. Dampak budayanya akan sangat mendalam, mengukuhkan posisi sepak bola dalam lanskap olahraga arus utama Amerika Utara.

## 2. Ledakan Padel
Sebuah hibrida antara tenis dan squash, **Padel meledak secara global**. Dengan lebih dari **52 juta pengikut** dan pemain, ini adalah salah satu olahraga dengan pertumbuhan tercepat di dunia. Sifat sosialnya dan kurva pembelajaran yang relatif mudah mendorong adopsi yang cepat di klub dan komunitas di mana-mana.

## 3. Perekrutan Sepak Bola Perguruan Tinggi 2026
Di AS, sorotan bersinar terang pada generasi berikutnya. **Peringkat perekrutan sepak bola perguruan tinggi (College Football) untuk musim 2026** lebih diawasi dari sebelumnya, dengan kesepakatan Name, Image, and Likeness (NIL) yang mengubah cara bakat dipantau dan diamankan.

## 4. NFL Draft dan Bintang CFP
Sinergi antara sepak bola perguruan tinggi dan profesional semakin erat. **Proyeksi NFL draft** sangat banyak menampilkan bintang-bintang dari **College Football Playoff (CFP)** yang diperluas. Performa dalam pertandingan perguruan tinggi berisiko tinggi ini menjadi audisi utama untuk karier profesional.

## 5. Pengecualian Visa untuk Atlet
Untuk memfasilitasi sifat global olahraga modern, kita melihat perubahan kebijakan. **Atlet semakin banyak menerima pengecualian visa** untuk acara olahraga besar. Ini menyederhanakan logistik untuk kompetisi internasional, memastikan bahwa bakat terbaik dari seluruh dunia dapat bersaing tanpa hambatan birokrasi.
`
  }
];

// --- Main Execution ---

async function main() {
  console.log("Starting Blog Post Seeding...");
  
  // 1. Manage Categories
  const existingCategories = await getCategories();
  const categoryMap = new Map(); // slug -> id
  existingCategories.forEach(c => categoryMap.set(c.slug, c.id));

  const neededCategories = [
    { name: "Pets & Animals", slug: "pets-animals", description: "Trends and insights about pets and animals." },
    { name: "Technology", slug: "technology", description: "Latest technology trends and breakthroughs." },
    { name: "Sports", slug: "sports", description: "Global sports events and trends." }
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

  // 2. Manage Tags (Optional: The simple API creates them, but let's be safe or just rely on passing strings if API supports it.
  // The API doc says: "tags: string[] | No | Array of tag slugs (creates tags if not exist)"
  // So we don't strictly need to pre-create tags if we send slugs. 
  // However, my data structure uses slugs. Let's trust the API to handle 'tags' array of strings as slugs/names.
  // Actually, checking the API Docs again: "tags": ["nuxt", "vue"] -> "Array of tag slugs"
  // So I should pass strings.
  
  // 3. Create Posts
  for (const article of articles) {
    // Check if category ID is available
    const catId = categoryMap.get(article.categorySlug);
    if (!catId) {
        console.error(`Skipping ${article.title}: Category ID not found for ${article.categorySlug}`);
        continue;
    }

    const payload = {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        contentMarkdown: article.contentMarkdown,
        categoryId: catId,
        tags: article.tags, // API expects array of slugs
        status: 'published',
        publishedAt: new Date().toISOString()
    };
    
    // We try to create. If it fails due to duplicate slug (409), we ignore it.
    try {
        await createPost(payload);
        console.log(`Successfully created: ${article.title}`);
    } catch (e) {
        if (e.message.includes('409')) {
            console.log(`Post already exists (skipped): ${article.title}`);
        } else {
            console.error(`Error creating post ${article.title}:`, e);
        }
    }
  }

  console.log("Seeding completed.");
}

main().catch(console.error);
