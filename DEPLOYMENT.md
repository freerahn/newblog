# 배포 체크리스트

이 문서는 GitHub 저장소 생성부터 Cloudflare Pages 배포까지의 전체 과정을 단계별로 안내합니다.

## ✅ 사전 준비

- [ ] GitHub 계정
- [ ] Cloudflare 계정 (무료 플랜 가능)
- [ ] Node.js 20.x 설치 확인

## 1단계: 로컬 프로젝트 설정

### 1.1 의존성 설치

```bash
npm install
```

### 1.2 로컬 테스트

```bash
npm run dev
```

브라우저에서 `http://localhost:4321` 접속하여 정상 작동 확인

### 1.3 사이트 설정 수정

`src/config.ts` 파일을 열어 다음 정보를 수정:

```typescript
export const siteConfig = {
  title: 'Your Blog Title',        // 블로그 제목
  description: 'Your description', // 블로그 설명
  url: 'https://your-blog.pages.dev', // Cloudflare Pages URL (나중에 업데이트)
  author: 'Your Name',
  language: 'ko',
};
```

## 2단계: GitHub 저장소 생성 및 업로드

### 2.1 GitHub 저장소 생성

1. GitHub 로그인
2. 우측 상단 "+" → "New repository" 클릭
3. 저장소 이름 입력 (예: `my-blog`)
4. Public 또는 Private 선택
5. "Create repository" 클릭

### 2.2 로컬 코드 업로드

```bash
# Git 초기화 (아직 안 했다면)
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: Static blog setup"

# GitHub 저장소 연결 (YOUR_USERNAME과 YOUR_REPO를 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

### 2.3 GitHub Personal Access Token 생성

1. GitHub → 우측 상단 프로필 → **Settings**
2. 좌측 메뉴 하단 **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token** → **Generate new token (classic)** 클릭
5. Note: `Cloudflare Pages Blog Admin` (임의의 이름)
6. Expiration: 원하는 기간 선택 (90 days 권장)
7. Scopes: **`repo`** 체크 (전체 저장소 접근)
8. **Generate token** 클릭
9. **토큰 복사** (한 번만 표시됨! 안전한 곳에 보관)

## 3단계: Cloudflare Pages 배포

### 3.1 프로젝트 생성

1. Cloudflare 대시보드 로그인: https://dash.cloudflare.com
2. 좌측 메뉴 **Pages** 클릭
3. **Create a project** → **Connect to Git** 클릭
4. GitHub 인증 (처음이면 GitHub 계정 연결)
5. 생성한 저장소 선택
6. **Begin setup** 클릭

### 3.2 빌드 설정

- **Project name**: 원하는 프로젝트 이름 (예: `my-blog`)
- **Production branch**: `main`
- **Framework preset**: **Astro** 선택
- **Build command**: `npm run build` (자동 입력됨)
- **Build output directory**: `dist` (자동 입력됨)
- **Root directory**: `/` (기본값 유지)

**Save and Deploy** 클릭

### 3.3 환경변수 설정

배포가 시작되면 다음 단계로 진행:

1. 프로젝트 페이지에서 **Settings** 탭 클릭
2. 좌측 메뉴 **Environment variables** 클릭
3. 다음 환경변수 추가:

| Variable name | Value | 설명 |
|--------------|-------|------|
| `GITHUB_TOKEN` | (2.3에서 복사한 토큰) | GitHub Personal Access Token |
| `GITHUB_OWNER` | (GitHub 사용자명) | 예: `your-username` |
| `GITHUB_REPO` | (저장소 이름) | 예: `my-blog` |
| `GITHUB_BRANCH` | `main` | 기본값은 `main` (선택사항) |

각 변수 추가 후 **Save** 클릭

### 3.4 재배포

환경변수 설정 후:

1. **Deployments** 탭으로 이동
2. 최신 배포 옆 **...** → **Retry deployment** 클릭
3. 배포 완료 대기 (약 2-3분)

### 3.5 배포 URL 확인

배포 완료 후:

1. **Deployments** 탭에서 최신 배포 확인
2. **View** 클릭하여 사이트 접속
3. URL 형식: `https://your-project-name.pages.dev`

### 3.6 사이트 URL 업데이트

배포된 URL을 확인한 후:

1. 로컬에서 `src/config.ts` 파일 수정
2. `url` 필드를 실제 Cloudflare Pages URL로 변경
3. GitHub에 커밋/푸시:

```bash
git add src/config.ts
git commit -m "Update site URL"
git push
```

## 4단계: Admin 페이지 보호 설정

### 옵션 1: Cloudflare Access (권장)

1. Cloudflare 대시보드 → **Zero Trust** (좌측 메뉴)
2. **Access** → **Applications** → **Add an application**
3. **Self-hosted** 선택
4. Application name: `Blog Admin`
5. Application domain: `your-project-name.pages.dev`
6. Path: `/admin.html`
7. **Next** 클릭
8. Policy 설정:
   - Policy name: `Admin Access`
   - Action: `Allow`
   - Include: `Emails` → 이메일 주소 입력 (예: `your-email@example.com`)
9. **Add application** 클릭

이제 `/admin.html` 접속 시 이메일 인증 필요

### 옵션 2: 간단한 토큰 검증 (선택사항)

더 간단한 방법을 원한다면 `functions/api/github.ts`에 토큰 검증 로직 추가 가능 (README 참고)

## 5단계: 테스트

### 5.1 사이트 접속 확인

- [ ] 메인 페이지 (`/`) 정상 표시
- [ ] 예제 게시글 (`/example-post`) 정상 표시
- [ ] 반응형 디자인 확인 (모바일/데스크톱)

### 5.2 Admin 페이지 테스트

1. `/admin.html` 접속
2. Cloudflare Access 인증 (설정한 경우)
3. "새 글 작성" 클릭
4. 테스트 게시글 작성:
   - 제목: `테스트 게시글`
   - Slug: `test-post`
   - 날짜: 오늘 날짜
   - 본문: `# 테스트\n\n이것은 테스트입니다.`
5. "저장" 클릭
6. 성공 메시지 확인

### 5.3 GitHub 확인

1. GitHub 저장소 → `content/posts/` 폴더 확인
2. `test-post.md` 파일이 생성되었는지 확인
3. 파일 내용 확인 (frontmatter 포함)

### 5.4 자동 재배포 확인

1. GitHub에 커밋이 생성되면 Cloudflare Pages가 자동으로 재배포 시작
2. Cloudflare Pages → **Deployments** 탭에서 배포 상태 확인
3. 배포 완료 후 (약 2-3분) 사이트 접속
4. 새 게시글이 목록에 표시되는지 확인
5. 게시글 상세 페이지 접속 확인

## 6단계: 커스터마이징

### 6.1 스타일 수정

- `tailwind.config.mjs`: 테마 색상, 폰트 등
- `src/layouts/PostLayout.astro`: 레이아웃 구조
- `public/styles/global.css`: 전역 스타일

### 6.2 메타 정보 수정

- `src/config.ts`: 사이트 기본 정보
- 각 페이지의 `<head>` 섹션: SEO 메타태그

### 6.3 이미지 추가

1. `public/images/` 폴더 생성
2. 이미지 파일 추가
3. Markdown에서 사용: `![alt](/images/image.jpg)`

## 🔧 문제 해결

### 배포 실패

1. **Build logs 확인**: Cloudflare Pages → Deployments → 실패한 배포 → Build logs
2. 일반적인 원인:
   - 환경변수 누락
   - Node.js 버전 불일치
   - 의존성 설치 실패

### Admin 페이지에서 저장 실패

1. **브라우저 콘솔 확인**: F12 → Console 탭
2. **환경변수 확인**: Cloudflare Pages → Settings → Environment variables
3. **GitHub Token 권한 확인**: `repo` 권한이 있는지 확인

### 게시글이 표시되지 않음

1. **빌드 로그 확인**: `content/posts/` 폴더가 제대로 인식되는지
2. **Frontmatter 형식 확인**: YAML 형식이 올바른지
3. **Draft 확인**: `draft: true`인 경우 목록에 표시되지 않음

## 📚 추가 리소스

- [Astro 공식 문서](https://docs.astro.build)
- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages)
- [GitHub API 문서](https://docs.github.com/en/rest)

---

**배포 완료 후 이 체크리스트를 참고하여 운영하세요!**


