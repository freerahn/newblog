# 빠른 시작 가이드

## 1. 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:4321` 접속

## 2. GitHub에 업로드

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## 3. Cloudflare Pages 배포

1. Cloudflare 대시보드 → Pages → Create a project
2. GitHub 저장소 연결
3. 빌드 설정:
   - Framework: Astro
   - Build command: `npm run build`
   - Output directory: `dist`
4. 환경변수 설정:
   - `GITHUB_TOKEN`: GitHub Personal Access Token
   - `GITHUB_OWNER`: GitHub 사용자명
   - `GITHUB_REPO`: 저장소 이름
   - `GITHUB_BRANCH`: `main` (선택사항)

## 4. Admin 페이지 보호

Cloudflare Zero Trust → Access → Application 추가
- Path: `/admin.html`
- Policy: 이메일 인증

자세한 내용은 `DEPLOYMENT.md` 참고

