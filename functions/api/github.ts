// Cloudflare Pages Function
// GitHub API를 통해 md 파일을 생성/수정/삭제

interface Env {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH?: string;
}

interface PostData {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  summary?: string;
  draft?: boolean;
  content: string;
  existingSlug?: string;
}

// GitHub API 헬퍼
async function getFileSha(env: Env, path: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`,
      {
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.status === 404) {
      return null; // 파일이 없음
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return data.sha;
  } catch (error) {
    console.error('Error getting file SHA:', error);
    return null;
  }
}

async function saveFileToGitHub(env: Env, path: string, content: string, sha: string | null): Promise<void> {
  const branch = env.GITHUB_BRANCH || 'main';
  
  const response = await fetch(
    `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: sha ? `Update post: ${path}` : `Create post: ${path}`,
        content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
        sha: sha || undefined,
        branch: branch,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to save file: ${response.status}`);
  }
}

async function deleteFileFromGitHub(env: Env, path: string): Promise<void> {
  const branch = env.GITHUB_BRANCH || 'main';
  const sha = await getFileSha(env, path);
  
  if (!sha) {
    throw new Error('File not found');
  }

  const response = await fetch(
    `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Delete post: ${path}`,
        sha: sha,
        branch: branch,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to delete file: ${response.status}`);
  }
}

function generateFrontmatter(data: PostData): string {
  const frontmatter: any = {
    title: data.title,
    date: data.date,
    slug: data.slug,
  };

  if (data.tags && data.tags.length > 0) {
    frontmatter.tags = data.tags;
  }

  if (data.summary) {
    frontmatter.summary = data.summary;
  }

  if (data.draft) {
    frontmatter.draft = true;
  }

  return `---\n${Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}:\n${value.map(v => `  - ${v}`).join('\n')}`;
      }
      return `${key}: ${typeof value === 'string' ? `"${value}"` : value}`;
    })
    .join('\n')}\n---\n\n${data.content}`;
}

async function listPosts(env: Env): Promise<any[]> {
  try {
    const branch = env.GITHUB_BRANCH || 'main';
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/content/posts?ref=${branch}`,
      {
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const files = await response.json();
    const posts = [];

    for (const file of files) {
      if (file.type === 'file' && file.name.endsWith('.md')) {
        const contentResponse = await fetch(file.download_url);
        const content = await contentResponse.text();
        
        // 간단한 frontmatter 파싱
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (frontmatterMatch) {
          const frontmatterText = frontmatterMatch[1];
          const postContent = frontmatterMatch[2];
          
          // 간단한 파싱 (실제로는 더 정교한 파서 필요)
          const frontmatter: any = {};
          frontmatterText.split('\n').forEach(line => {
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
              const key = match[1];
              let value: any = match[2].trim();
              
              // 따옴표 제거
              if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
              }
              
              // boolean 처리
              if (value === 'true') value = true;
              if (value === 'false') value = false;
              
              frontmatter[key] = value;
            }
          });

          posts.push({
            slug: frontmatter.slug || file.name.replace('.md', ''),
            title: frontmatter.title || 'Untitled',
            date: frontmatter.date || '',
            tags: frontmatter.tags || [],
            summary: frontmatter.summary || '',
            draft: frontmatter.draft || false,
          });
        }
      }
    }

    return posts;
  } catch (error) {
    console.error('Error listing posts:', error);
    throw error;
  }
}

async function getPost(env: Env, slug: string): Promise<any> {
  try {
    const branch = env.GITHUB_BRANCH || 'main';
    const path = `content/posts/${slug}.md`;
    
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Authorization': `token ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Post not found');
    }

    const file = await response.json();
    const content = atob(file.content.replace(/\n/g, ''));
    
    // Frontmatter 파싱
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      throw new Error('Invalid post format');
    }

    const frontmatterText = frontmatterMatch[1];
    const postContent = frontmatterMatch[2];
    
    const frontmatter: any = {};
    frontmatterText.split('\n').forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const key = match[1];
        let value: any = match[2].trim();
        
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        
        frontmatter[key] = value;
      }
    });

    return {
      ...frontmatter,
      content: postContent.trim(),
    };
  } catch (error) {
    console.error('Error getting post:', error);
    throw error;
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/github', '');

  // CORS 헤더
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // 환경변수 검증
  if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
    return new Response(
      JSON.stringify({ error: 'GitHub configuration missing' }),
      { status: 500, headers }
    );
  }

  try {
    // 라우팅
    if (path === '/list' && request.method === 'GET') {
      const posts = await listPosts(env);
      return new Response(JSON.stringify({ posts }), { headers });
    }

    if (path === '/get' && request.method === 'GET') {
      const slug = url.searchParams.get('slug');
      if (!slug) {
        return new Response(JSON.stringify({ error: 'Slug required' }), { status: 400, headers });
      }
      const post = await getPost(env, slug);
      return new Response(JSON.stringify(post), { headers });
    }

    if (path === '/save' && request.method === 'POST') {
      const data: PostData = await request.json();
      
      // Slug 검증
      if (!/^[a-z0-9-]+$/.test(data.slug)) {
        return new Response(
          JSON.stringify({ error: 'Invalid slug format' }),
          { status: 400, headers }
        );
      }

      const filePath = `content/posts/${data.slug}.md`;
      const content = generateFrontmatter(data);
      
      // 기존 파일이 있는지 확인 (수정인 경우)
      let sha: string | null = null;
      if (data.existingSlug && data.existingSlug === data.slug) {
        sha = await getFileSha(env, filePath);
      } else if (data.existingSlug && data.existingSlug !== data.slug) {
        // Slug가 변경된 경우 기존 파일 삭제
        const oldPath = `content/posts/${data.existingSlug}.md`;
        await deleteFileFromGitHub(env, oldPath);
      }

      await saveFileToGitHub(env, filePath, content, sha);
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (path === '/delete' && request.method === 'POST') {
      const { slug } = await request.json();
      if (!slug) {
        return new Response(JSON.stringify({ error: 'Slug required' }), { status: 400, headers });
      }

      const filePath = `content/posts/${slug}.md`;
      await deleteFileFromGitHub(env, filePath);
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers }
    );
  }
};


