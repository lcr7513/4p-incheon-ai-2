# GitHub에서 Google AI Studio로 가져오기

## 1. GitHub 저장소 만들기

1. https://github.com 에 로그인합니다.
2. 오른쪽 위 `+` 버튼에서 `New repository`를 선택합니다.
3. Repository name에 `4p-incheon-ai-app`을 입력합니다.
4. 공개 판매 전에는 `Private`를 선택하는 것을 권장합니다.
5. `Add a README`, `.gitignore`, `License`는 선택하지 말고 빈 저장소를 만듭니다.

## 2. 파일 올리기

1. 이 ZIP을 컴퓨터에서 압축 해제합니다.
2. GitHub의 새 저장소에서 `uploading an existing file` 또는 `Add file → Upload files`를 누릅니다.
3. 압축을 푼 `4p-incheon-ai-app` 폴더 자체가 아니라 **그 안의 파일과 폴더 전체**를 업로드 영역으로 끌어놓습니다.
4. GitHub 첫 화면에서 `package.json`, `src`, `public`, `server.ts`가 바로 보여야 합니다.
5. Commit message에 `Initial 4P Incheon app`을 입력하고 `Commit changes`를 누릅니다.

> ZIP 파일 하나만 GitHub에 올리면 Google AI Studio가 앱 소스를 읽지 못합니다. 반드시 압축을 푼 내용물을 올리세요.

## 3. Google AI Studio에서 가져오기

1. Google AI Studio의 앱 제작 화면을 엽니다.
2. `Import from GitHub`, `GitHub에서 가져오기` 또는 유사한 메뉴를 선택합니다.
3. 처음이라면 GitHub 연결을 승인합니다.
4. 저장소 `4p-incheon-ai-app`과 `main` 브랜치를 선택합니다.
5. 가져오기가 끝나면 미리보기를 실행합니다.

## 4. Gemini 키 등록

실제 Gemini AI 진단을 사용하려면 AI Studio의 Secrets 또는 환경변수 설정에 다음 값을 등록합니다.

- 이름: `GEMINI_API_KEY`
- 값: 본인의 Gemini API 키

모델을 바꿔야 할 때만 `GEMINI_MODEL`을 추가합니다. 기본값은 `gemini-2.5-flash`입니다.

`.env` 파일이나 실제 API 키를 GitHub에 업로드하지 마세요. 키가 없을 때도 앱은 규칙 기반 안전 모드로 작동합니다.

## 5. 웹주소 배포

미리보기에서 메뉴, 사진, 빈 프로젝트, JSON 백업, 보고서 저장, AI 진단을 확인한 뒤 `Deploy`를 선택합니다. Cloud Run 배포가 완료되면 설치 없이 접속할 수 있는 `run.app` 웹주소가 생성됩니다.

## 확인할 화면

- 첫 화면에 `모범 예시 자료를 보고 있습니다` 안내가 표시되는지
- `빈 프로젝트 시작`, `JSON 백업`, `백업 복원` 버튼이 보이는지
- 인천 사진이 정상적으로 표시되는지
- Gemini 키가 없을 때 `규칙 기반 안전 모드`로 표시되는지
- 보고서 미리보기와 Excel 호환 파일 저장이 작동하는지
