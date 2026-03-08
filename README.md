# 👶 오늘 뭐입지? — 배포 가이드

## Vercel 배포 방법 (10분이면 끝!)

### 1단계 — GitHub에 올리기
1. https://github.com 접속 → 로그인
2. 우상단 **+** → **New repository**
3. Repository name: `ootd-app` → **Create repository**
4. 이 폴더 안의 파일들을 모두 업로드 (Upload files 버튼)

### 2단계 — Vercel에 배포하기
1. https://vercel.com 접속 → GitHub으로 로그인
2. **Add New Project** → `ootd-app` 선택 → **Import**
3. **Environment Variables** 섹션에서:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (Anthropic API 키 입력)
4. **Deploy** 버튼 클릭
5. 1-2분 후 🎉 완료! `ootd-app.vercel.app` 주소 생성됨

### Anthropic API 키 발급
1. https://console.anthropic.com 접속
2. **API Keys** → **Create Key**
3. 키 복사해서 Vercel에 붙여넣기

---

## 로컬에서 테스트하려면
```bash
# .env.local 파일 만들기
cp .env.local.example .env.local
# 파일 열어서 API 키 입력

npm install
npm run dev
# http://localhost:3000 접속
```
