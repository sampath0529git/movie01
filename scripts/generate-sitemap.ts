import fs from "fs";
import path from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

async function generateSitemap() {
  try {
    const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.log("No config found, skipping static sitemap generation.");
      return;
    }

    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

    const querySnapshot = await getDocs(collection(db, "media"));
    const domain = "https://movievibe.me";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: 'discover', priority: '0.8', changefreq: 'daily' },
      { path: 'movies', priority: '0.8', changefreq: 'daily' },
      { path: 'tv-series', priority: '0.8', changefreq: 'daily' }
    ];

    staticPages.forEach(page => {
      xml += `
  <url>
    <loc>${domain}/${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    querySnapshot.forEach((docSnapshot) => {
      const item = docSnapshot.data();
      let typePath = item.type === 'MOVIE' ? 'movies' : 'tv';
      const isKorean = item.genre?.includes('Korean') || item.genres?.includes('Korean');
      if (isKorean && item.type === 'TV') typePath = 'korean-drama';
      
      let urlPath = item.slug || docSnapshot.id;
      if (typeof urlPath === 'string' && urlPath.endsWith('-sinhala-sub')) {
        urlPath = urlPath.replace(/-sinhala-sub$/, '-sinhala-subtitles');
      }
      
      let dateIso = new Date().toISOString();
      if (item.createdAt && item.createdAt.toDate) {
        dateIso = item.createdAt.toDate().toISOString();
      }

      xml += `
  <url>
    <loc>${domain}/${typePath}/${urlPath}/</loc>
    <lastmod>${dateIso}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    // Write to both public and dist just to be sure it's available and served globally
    if (!fs.existsSync(path.resolve(process.cwd(), "public"))) {
      fs.mkdirSync(path.resolve(process.cwd(), "public"));
    }
    fs.writeFileSync(path.resolve(process.cwd(), "public", "sitemap.xml"), xml);
    
    if (fs.existsSync(path.resolve(process.cwd(), "dist"))) {
      fs.writeFileSync(path.resolve(process.cwd(), "dist", "sitemap.xml"), xml);
    }

    console.log("Sitemap generated successfully for static hosting.");
  } catch (error) {
    console.error("Error generating static sitemap:", error);
  }
}

generateSitemap().then(() => process.exit(0)).catch(() => process.exit(1));
