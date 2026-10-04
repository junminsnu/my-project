(function () {
    // 1. 버튼 디자인(CSS) 만들기
    const style = document.createElement('style');
    style.innerHTML = `
    .my-pretty-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 24px;
      background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%); /* 예쁜 그라데이션 */
      color: white !important;
      text-decoration: none !important;
      border-radius: 30px;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 4px 15px rgba(110, 142, 251, 0.4);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .my-pretty-btn:hover {
      transform: translateY(-2px); /* 마우스 올리면 살짝 위로 뜸 */
      box-shadow: 0 6px 20px rgba(110, 142, 251, 0.6);
    }
  `;
    document.head.appendChild(style);

    // 2. 버튼 HTML 만들어서 상태메시지 칸에 삽입하기
    const container = document.getElementById('custom-btn-zone');

    if (container) {
        // 상태메시지 칸 안에 버튼 렌더링
        container.innerHTML = `
      <a href="/st/clinical-training/final-ref" class="my-pretty-btn">
        🚀 임상 훈련 최종 자료 보러가기
      </a>
    `;
    } else {
        // 혹시 상태메시지 칸을 못 찾으면 화면 우측 하단에 플로팅(둥둥 떠다니는) 버튼으로 고정
        const floatingBtn = document.createElement('a');
        floatingBtn.href = '/st/clinical-training/final-ref';
        floatingBtn.className = 'my-pretty-btn';
        floatingBtn.innerHTML = '🚀 임상 훈련 최종 자료';
        floatingBtn.style.position = 'fixed';
        floatingBtn.style.bottom = '20px';
        floatingBtn.style.right = '20px';
        floatingBtn.style.zIndex = '9999';
        document.body.appendChild(floatingBtn);
    }
})();
