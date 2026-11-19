# 3DVis Lab

국립한밭대학교 인공지능소프트웨어학과 3D Vision Laboratory 홈페이지입니다.

- 홈 `index.html`
- 연구분야 `research.html`
- 구성원 `members.html`
- 저작물 `publications.html`, 목록 데이터 `publications.json`
- 강의 `lectures.html`
- 공통 스타일 및 테마 `site.css`, `site.js`

저작물의 `topic`은 저작물 페이지 필터의 `data-topic` 값과 일치시킵니다. 기본 썸네일은 해당 주제의 PNG이며, 논문별 이미지는 게시 권한을 확인한 뒤 데이터의 `thumbnail`에 `` 저장소 최상위 폴더 기준 파일명을 넣어 지정할 수 있습니다. 논문 원문, 프로젝트, 코드, 데이터 링크는 `links`에 추가합니다.

기존 [Google Sites](https://sites.google.com/view/3dvislab)의 공개 텍스트와 목록을 참고했습니다. 로고는 연구실에서 제공했으며, 3D 그래픽과 기본 썸네일은 이 사이트를 위해 제작했습니다.

## GitHub Pages

Settings → Pages에서 Deploy from a branch, `main`, `/(root)`를 사용합니다. 별도 빌드가 필요하지 않습니다. 로컬에서 확인할 때는 저장소를 HTTP 서버로 열면 저작물 JSON도 함께 로드됩니다.

