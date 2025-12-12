# 정적 블로그 (Astro + Cloudflare Pages)

Markdown 파일 기반의 정적 블로그입니다. GitHub 저장소에 콘텐츠를 저장하고 Cloudflare Pages로 배포합니다.

## 🚀 주요 기능

- ✅ Markdown 파일 기반 콘텐츠 관리
- ✅ 웹 기반 Admin 페이지 (글 작성/수정/삭제)
- ✅ GitHub API를 통한 자동 커밋
- ✅ 반응형 디자인
- ✅ SEO 최적화 (메타태그, 사이트맵, RSS)
- ✅ 서버/DB 없이 완전 정적 사이트

## 📁 프로젝트 구조

```
newblog/
├── content/
│   └── posts/          # 게시글 md 파일 저장소
├── functions/
│   └── api/
│       └── github.ts   # Cloudflare Function (GitHub API 호출)
├── public/
│   └── styles/
│       └── global.css
├── src/
│   ├── components/     # Astro 컴포넌트
│   ├── layouts/        # 레이아웃
│   ├── pages/          # 페이지
│   ├── utils/          # 유틸리티 함수
│   ├── types.ts        # TypeScript 타입
│   └── config.ts       # 사이트 설정
├── astro.config.mjs
├── package.json
└── README.md
```

## 🛠️ 로컬 개발

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:4321` 접속

### 3. 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

## 📝 게시글 작성

### 방법 1: Admin 페이지 사용 (권장)

1. `/admin.html` 페이지 접속
2. "새 글 작성" 탭 클릭
3. 제목, Slug, 날짜, 본문 등 입력
4. "저장" 버튼 클릭 → GitHub에 자동 커밋

### 방법 2: 직접 md 파일 생성

`content/posts/` 폴더에 새로운 `.md` 파일을 생성하고 frontmatter를 포함하세요:

```markdown
---
title: "게시글 제목"
date: "2024-01-01"
slug: "post-slug"
tags:
  - 태그1
  - 태그2
summary: "게시글 요약"
draft: false
---

게시글 본문 (Markdown 형식)
```

## 🔐 보안 설정

### Admin 페이지 보호

Admin 페이지는 Cloudflare Access 또는 Basic Auth로 보호해야 합니다.

#### 옵션 1: Cloudflare Access (권장)

1. Cloudflare 대시보드 → Zero Trust → Access
2. Application 추가
3. `/admin.html` 경로 보호 설정
4. 이메일 도메인 또는 GitHub OAuth로 인증 설정

#### 옵션 2: Cloudflare Pages 환경변수 + 간단한 토큰 검증

`functions/api/github.ts`에 토큰 검증 로직 추가:

```typescript
// request.headers.get('Authorization') === `Bearer ${env.ADMIN_TOKEN}`
```

## 🚀 GitHub 저장소 생성 및 업로드

### 1. GitHub 저장소 생성

1. GitHub에서 새 저장소 생성 (예: `my-blog`)
2. 저장소를 Public 또는 Private으로 설정

### 2. 로컬 코드 업로드

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 3. GitHub Personal Access Token 생성

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" 클릭
3. 권한 선택:
   - `repo` (전체 저장소 접근)
4. 토큰 생성 후 복사 (한 번만 표시됨!)

## ☁️ Cloudflare Pages 배포

### 1. Cloudflare Pages 프로젝트 생성

1. Cloudflare 대시보드 → Pages → "Create a project"
2. "Connect to Git" 선택
3. GitHub 저장소 연결
4. 빌드 설정:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

### 2. 환경변수 설정

Cloudflare Pages → 프로젝트 → Settings → Environment variables:

```
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
GITHUB_BRANCH=main
```

### 3. 배포

- 자동 배포: `main` 브랜치에 푸시하면 자동 배포
- 수동 배포: Pages 대시보드에서 "Retry deployment"

### 4. 커스텀 도메인 설정 (선택)

1. Pages → 프로젝트 → Custom domains
2. 도메인 추가 및 DNS 설정

## 📋 운영 가이드

### 글 작성/수정/삭제

1. 배포된 사이트의 `/admin.html` 접속
2. Cloudflare Access로 인증 (설정한 경우)
3. 글 작성/수정/삭제
4. 변경사항은 GitHub에 자동 커밋됨
5. Cloudflare Pages가 자동으로 재배포 (몇 분 소요)

### 이미지 첨부

**방법 1: GitHub에 이미지 업로드 후 링크**

1. `public/images/` 폴더에 이미지 추가
2. GitHub에 커밋/푸시
3. Markdown에서 `![alt](/images/image.jpg)` 사용

**방법 2: 외부 이미지 호스팅**

- Imgur, Cloudinary 등 사용
- Markdown에서 이미지 URL 직접 사용

### Slug 정책

- 소문자, 숫자, 하이픈(`-`)만 사용 가능
- 예: `my-first-post`, `2024-01-01-announcement`
- 중복된 slug는 덮어쓰기됨 (주의!)

### 백업/복구

- 모든 콘텐츠는 GitHub 저장소에 저장됨
- 정기적으로 GitHub 저장소를 클론하여 로컬 백업
- 필요 시 `git clone`으로 복구

### 문제 해결

#### Admin 페이지에서 저장 실패

1. Cloudflare Pages 환경변수 확인
2. GitHub Token 권한 확인 (`repo` 권한 필요)
3. 브라우저 콘솔에서 에러 메시지 확인

#### 배포 후 게시글이 보이지 않음

1. 빌드 로그 확인 (Cloudflare Pages → Deployments)
2. `content/posts/` 폴더에 md 파일이 있는지 확인
3. Frontmatter 형식이 올바른지 확인

#### Slug 중복 경고

- Admin 페이지에서 기존 글 수정 시 slug 변경 가능
- 기존 slug는 자동으로 삭제됨

## 🔧 기술 스택

- **Framework**: Astro 4.x
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Cloudflare Pages
- **Functions**: Cloudflare Pages Functions
- **Content**: Markdown (gray-matter)

## 📄 라이선스

MIT

## 🤝 기여

이슈 및 Pull Request 환영합니다!

---

**문의사항이 있으시면 GitHub Issues를 이용해주세요.**

