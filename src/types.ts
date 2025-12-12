export interface PostFrontmatter {
  title: string;
  date: string;
  slug: string;
  tags?: string[];
  summary?: string;
  draft?: boolean;
}

export interface Post {
  frontmatter: PostFrontmatter;
  content: string;
  filePath: string;
}

