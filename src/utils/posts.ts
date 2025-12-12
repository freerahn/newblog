import type { Post, PostFrontmatter } from '../types';

// 게시글 파일들을 동적으로 import
const postModules = import.meta.glob<{ frontmatter: PostFrontmatter }>('/content/posts/*.md', { 
  eager: true 
});

export function getAllPosts(): Post[] {
  const posts: Post[] = [];

  for (const path in postModules) {
    const module = postModules[path];
    
    if (!module || !module.frontmatter) {
      console.warn(`Invalid post file: ${path}`);
      continue;
    }

    const frontmatter = module.frontmatter;
    
    // draft는 제외
    if (frontmatter.draft === true) {
      continue;
    }

    // 필수 필드 검증
    if (!frontmatter.title || !frontmatter.date || !frontmatter.slug) {
      console.warn(`Post missing required fields: ${path}`);
      continue;
    }

    posts.push({
      frontmatter,
      content: '', // Astro는 Content 컴포넌트로 렌더링
      filePath: path,
    });
  }

  // 날짜순 정렬 (최신순)
  return posts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.date).getTime();
    const dateB = new Date(b.frontmatter.date).getTime();
    return dateB - dateA;
  });
}

export function getPostBySlug(slug: string): Post | null {
  const posts = getAllPosts();
  return posts.find(post => post.frontmatter.slug === slug) || null;
}

export function getPostModuleBySlug(slug: string): { frontmatter: PostFrontmatter; Content: any } | null {
  for (const path in postModules) {
    const module = postModules[path];
    if (module && module.frontmatter && module.frontmatter.slug === slug) {
      return module as any;
    }
  }
  return null;
}

export function getRecentPosts(limit: number = 5): Post[] {
  return getAllPosts().slice(0, limit);
}

