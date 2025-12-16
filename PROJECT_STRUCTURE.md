# 프로젝트 구조

```
newblog/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions (선택사항)
├── .wrangler/
│   └── dev.vars.example        # 로컬 개발 환경변수 예제
├── content/
│   └── posts/                  # 게시글 md 파일 저장소
│       ├── .gitkeep
│       └── example-post.md     # 예제 게시글
├── functions/
│   └── api/
│       └── github.ts           # Cloudflare Function (GitHub API 호출)
├── public/
│   └── styles/
│       └── global.css          # 전역 CSS
├── src/
│   ├── components/             # 재사용 가능한 컴포넌트
│   │   ├── PostList.astro     # 게시글 목록 컴포넌트
│   │   └── Sidebar.astro      # 사이드바 컴포넌트
│   ├── layouts/               # 페이지 레이아웃
│   │   └── PostLayout.astro   # 게시글 상세 레이아웃
│   ├── pages/                 # 페이지 (라우팅)
│   │   ├── index.astro        # 메인 페이지
│   │   ├── [slug].astro       # 게시글 상세 페이지 (동적 라우팅)
│   │   ├── 404.astro          # 404 페이지
│   │   ├── admin.html         # Admin 관리 페이지
│   │   ├── sitemap.xml.ts     # 사이트맵 생성
│   │   └── rss.xml.ts         # RSS 피드 생성
│   ├── utils/                 # 유틸리티 함수
│   │   └── posts.ts           # 게시글 관련 유틸리티
│   ├── config.ts              # 사이트 설정
│   └── types.ts               # TypeScript 타입 정의
├── .gitignore                 # Git 무시 파일
├── .nvmrc                     # Node.js 버전
├── .prettierrc                # Prettier 설정
├── astro.config.mjs           # Astro 설정
├── cloudflare.json            # Cloudflare 설정
├── DEPLOYMENT.md              # 상세 배포 가이드
├── package.json               # 프로젝트 의존성
├── PROJECT_STRUCTURE.md       # 이 파일
├── QUICK_START.md             # 빠른 시작 가이드
├── README.md                  # 프로젝트 README
└── tailwind.config.mjs        # Tailwind CSS 설정
```

## 주요 파일 설명

### 콘텐츠 관리

- **`content/posts/*.md`**: 모든 게시글은 이 폴더에 Markdown 파일로 저장됩니다.
- 각 파일은 YAML frontmatter를 포함해야 합니다.

### Admin 기능

- **`src/pages/admin.html`**: 웹 기반 관리 페이지
- **`functions/api/github.ts`**: GitHub API를 호출하여 md 파일을 생성/수정/삭제하는 Cloudflare Function

### 페이지 라우팅

- **`src/pages/index.astro`**: 메인 페이지 (게시글 목록)
- **`src/pages/[slug].astro`**: 동적 라우팅으로 게시글 상세 페이지
- **`src/pages/404.astro`**: 404 에러 페이지

### 컴포넌트

- **`src/components/PostList.astro`**: 게시글 목록 표시
- **`src/components/Sidebar.astro`**: 최신글 목록 사이드바

### 설정 파일

- **`src/config.ts`**: 사이트 기본 정보 (제목, 설명, URL 등)
- **`astro.config.mjs`**: Astro 빌드 설정
- **`tailwind.config.mjs`**: Tailwind CSS 테마 설정

## 파일 생성 흐름

1. **Admin에서 글 작성** → `admin.html`에서 폼 제출
2. **Cloudflare Function 호출** → `/api/github/save` 엔드포인트
3. **GitHub API 호출** → `content/posts/*.md` 파일 생성/수정
4. **자동 재배포** → Cloudflare Pages가 GitHub 변경 감지 후 재배포
5. **사이트 업데이트** → 배포 완료 후 새 게시글 표시

## 환경변수

Cloudflare Pages 환경변수:

- `GITHUB_TOKEN`: GitHub Personal Access Token
- `GITHUB_OWNER`: GitHub 사용자명 또는 조직명
- `GITHUB_REPO`: 저장소 이름
- `GITHUB_BRANCH`: 기본 브랜치 (기본값: `main`)


