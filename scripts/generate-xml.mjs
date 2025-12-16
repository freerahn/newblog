import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 게시글 파일들을 읽어서 파싱
function getAllPosts() {
  const postsDir = join(rootDir, 'content', 'posts');
  const files = readdirSync(postsDir).filter(f => f.endsWith('.md') && f !== '.gitkeep');
  
  const posts = [];
  for (const file of files) {
    try {
      const content = readFileSync(join(postsDir, file), 'utf-8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (frontmatterMatch) {
        const frontmatterText = frontmatterMatch[1];
        const frontmatter = {};
        
        frontmatterText.split('\n').forEach(line => {
          const match = line.match(/^(\w+):\s*(.+)$/);
          if (match) {
            const key = match[1];
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.slice(1, -1);
            }
            if (value === 'true') value = true;
            if (value === 'false') value = false;
            frontmatter[key] = value;
          }
        });
        
        if (!frontmatter.draft && frontmatter.slug) {
          posts.push({ frontmatter });
        }
      }
    } catch (e) {
      console.warn(`Failed to parse ${file}:`, e.message);
    }
  }
  
  return posts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime();
    const dateB = new Date(b.frontmatter.date).getTime();
    return dateB - dateA;
  });
}

// 사이트 설정 읽기
function getSiteConfig() {
  try {
    const configPath = join(rootDir, 'src', 'config.ts');
    const configContent = readFileSync(configPath, 'utf-8');
    const urlMatch = configContent.match(/url:\s*['"]([^'"]+)['"]/);
    const titleMatch = configContent.match(/title:\s*['"]([^'"]+)['"]/);
    const descMatch = configContent.match(/description:\s*['"]([^'"]+)['"]/);
    const langMatch = configContent.match(/language:\s*['"]([^'"]+)['"]/);
    
    return {
      title: titleMatch ? titleMatch[1] : 'My Blog',
      description: descMatch ? descMatch[1] : 'A static blog',
      url: urlMatch ? urlMatch[1] : 'https://your-blog.pages.dev',
      language: langMatch ? langMatch[1] : 'ko',
    };
  } catch (e) {
    return {
      title: 'My Blog',
      description: 'A static blog',
      url: 'https://your-blog.pages.dev',
      language: 'ko',
    };
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// RSS 생성
function generateRSS() {
  const posts = getAllPosts();
  const recentPosts = posts.slice(0, 20);
  const siteConfig = getSiteConfig();
  const siteUrl = siteConfig.url;
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>${siteConfig.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${recentPosts.map(post => `
    <item>
      <title>${escapeXml(post.frontmatter.title)}</title>
      <link>${siteUrl}/${post.frontmatter.slug}</link>
      <description>${escapeXml(post.frontmatter.summary || post.frontmatter.title)}</description>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
      <guid>${siteUrl}/${post.frontmatter.slug}</guid>
    </item>`).join('')}
  </channel>
</rss>`;
  
  const distDir = join(rootDir, 'dist');
  writeFileSync(join(distDir, 'rss.xml'), rss);
  console.log('✓ Generated rss.xml');
}

// Sitemap 생성
function generateSitemap() {
  const posts = getAllPosts();
  const siteConfig = getSiteConfig();
  const siteUrl = siteConfig.url;
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${posts.map(post => `
  <url>
    <loc>${siteUrl}/${post.frontmatter.slug}</loc>
    <lastmod>${new Date(post.frontmatter.date).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;
  
  const distDir = join(rootDir, 'dist');
  writeFileSync(join(distDir, 'sitemap.xml'), sitemap);
  console.log('✓ Generated sitemap.xml');
}

// 실행
try {
  generateRSS();
  generateSitemap();
} catch (error) {
  console.error('Error generating XML files:', error);
  process.exit(1);
}

