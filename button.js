(function() {
  // 이미 실행된 적 있다면 중단 (중복 방지)
  if (window.btnMakerRunning) return;
  window.btnMakerRunning = true;

  // 1. CSS 추가
  const style = document.createElement('style');
  style.innerHTML = `
    .my-pretty-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99999;
      padding: 12px 24px;
      background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%);
      color: white !important;
      text-decoration: none !important;
      border-radius: 30px;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 4px 15px rgba(110, 142, 251, 0.4);
    }
  `;
  document.head.appendChild(style);

  // 2. 버튼 생성 및 복구 함수 (좀비 로직)
  function injectButton() {
    // 이미 화면에 내 버튼이 있다면 아무것도 안 함
    if (document.querySelector('.my-pretty-btn')) return;

    // 내 버튼이 지워졌거나 없다면 새로 만들어서 body 끝에 추가
    const btn = document.createElement('a');
    btn.href = '/st/clinical-training/final-ref';
    btn.className = 'my-pretty-btn';
    btn.innerHTML = '🚀 임상 훈련 최종 자료 보러가기';
    document.body.appendChild(btn);
  }

  // 3. 0.5초마다 감시해서 버튼이 없으면 다시 생성
  setInterval(injectButton, 500);
})();
