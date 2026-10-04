(() => {
  // 중복 실행 방지
  if (window.myUiLoaded) return;
  window.myUiLoaded = true;

  /* =========================
     1. 프로필 위 바로가기 버튼
     ========================= */

  const links = [
    ['📝 일실기', '/st/clinical-training/day-practice'],
    ['📅 주실기', '/st/clinical-training/week-plan'],
    ['✨ 최종성찰', '/st/clinical-training/final-ref'],
    ['👤 내정보', '/st/my/profile']
  ];

  const box = document.createElement('div');
  box.id = 'profile-shortcuts';

  Object.assign(box.style, {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '12px'
  });

  links.forEach(([text, href]) => {
    const a = document.createElement('a');

    a.href = href;
    a.textContent = text;

    Object.assign(a.style, {
      display: 'block',
      padding: '11px 6px',
      borderRadius: '10px',
      background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
      color: '#fff',
      textAlign: 'center',
      textDecoration: 'none',
      fontWeight: '700',
      fontSize: '13px',
      boxShadow: '0 3px 10px #0002',
      transition: '.15s'
    });

    a.onmouseenter = () => {
      a.style.transform = 'translateY(-2px)';
      a.style.boxShadow = '0 5px 14px #0003';
    };

    a.onmouseleave = () => {
      a.style.transform = '';
      a.style.boxShadow = '0 3px 10px #0002';
    };

    box.appendChild(a);
  });

  const profile = document.querySelector('.main-profile');

  if (profile && !document.querySelector('#profile-shortcuts')) {
    profile.before(box);
  }


  /* =========================
     2. 시간대별 my_word 문구

     start = 시작 시간
     end   = 끝 시간
     text  = 실제 화면에 표시되는 문구

     start/end 숫자는 화면에 안 뜸
     ========================= */

  const messages = [
    { start: 0,  end: 4,  text: '조금만 더하고 빨리자 ㅎㅎ 사랑해🐰❣️' },
    { start: 4,  end: 11,  text: '오늘 하루도 힘내💗' },
    { start: 11,  end: 13,  text: '점심 잘머거💗' },

    { start: 13,  end: 16,  text: '좋은 오후 보내🧡' },
    { start: 16,  end: 23, text: '오늘 하루도 수고했어🤍' },
    { start: 23, end: 24, text: '오늘은 여기까지 해도 충분해 💗😴🤍 잘자' },
  ];


  /* =========================
     3. 현재 시간에 맞는 문구 표시
     ========================= */

  function updateMyWord() {
    const el = document.querySelector('[data-name="my_word"]');
    if (!el) return;

    const hour = new Date().getHours();

    const item = messages.find(
      x => hour >= x.start && hour < x.end
    );

    if (!item) return;

    // text만 표시됨
    el.textContent = item.text;

    Object.assign(el.style, {
      fontSize: '14px',
      fontWeight: '700',
      lineHeight: '1.5',
      color: '#444',
      textAlign: 'center',
      padding: '10px 6px',
      borderRadius: '10px',
      background: '#f7f8ff'
    });
  }

  updateMyWord();

  // 1분마다 현재 시간 확인
  setInterval(updateMyWord, 60000);
    /* =========================
     4. 절대 못 잡는 생쥐 🐭
     ========================= */

  const mouse = document.createElement('div');
  mouse.id = 'runaway-mouse';
  mouse.textContent = '🐭';

  Object.assign(mouse.style, {
    position: 'fixed',
    left: '50%',
    top: '50%',
    fontSize: '34px',
    zIndex: '999999',
    cursor: 'default',

    // 클릭 / 드래그 불가능
    pointerEvents: 'none',

    // 이동 효과
    transition: 'left .12s ease-out, top .12s ease-out, transform .12s',
    userSelect: 'none',

    // 살짝 그림자
    filter: 'drop-shadow(0 3px 3px #0005)'
  });

  document.body.appendChild(mouse);


  // 현재 생쥐 위치
  let mouseX = window.innerWidth * 0.5;
  let mouseY = window.innerHeight * 0.5;

  function moveMouse(x, y) {
    const padding = 35;

    x = Math.max(
      padding,
      Math.min(window.innerWidth - padding, x)
    );

    y = Math.max(
      padding,
      Math.min(window.innerHeight - padding, y)
    );

    mouseX = x;
    mouseY = y;

    mouse.style.left = `${x}px`;
    mouse.style.top = `${y}px`;
  }


  // 처음에는 랜덤 위치
  moveMouse(
    Math.random() * window.innerWidth,
    Math.random() * window.innerHeight
  );


  document.addEventListener('mousemove', e => {

    const dx = mouseX - e.clientX;
    const dy = mouseY - e.clientY;

    const distance = Math.sqrt(
      dx * dx + dy * dy
    );

    // 이 거리 안으로 들어오면 도망
    const dangerDistance = 150;

    if (distance < dangerDistance) {

      // 마우스와 반대 방향
      let angle = Math.atan2(dy, dx);

      // 너무 예측 가능하지 않게 랜덤 각도 추가
      angle += (Math.random() - 0.5) * 1.5;

      // 가까울수록 더 멀리 튐
      const jump =
        180 +
        Math.random() * 180 +
        (dangerDistance - distance);

      let newX =
        mouseX +
        Math.cos(angle) * jump;

      let newY =
        mouseY +
        Math.sin(angle) * jump;


      /*
       * 화면 끝에 몰리면
       * 반대편 근처로 순간 탈출
       */
      const edge = 80;

      if (
        newX < edge ||
        newX > window.innerWidth - edge ||
        newY < edge ||
        newY > window.innerHeight - edge
      ) {
        newX =
          edge +
          Math.random() *
          (window.innerWidth - edge * 2);

        newY =
          edge +
          Math.random() *
          (window.innerHeight - edge * 2);
      }


      // 도망갈 때 살짝 회전
      mouse.style.transform =
        `translate(-50%, -50%)
         rotate(${Math.random() * 50 - 25}deg)
         scale(1.15)`;

      moveMouse(newX, newY);

      setTimeout(() => {
        mouse.style.transform =
          'translate(-50%, -50%) scale(1)';
      }, 120);
    }
  });


  /*
   * 가만히 놔두면 가끔 혼자 슬금슬금 이동
   */
  setInterval(() => {

    moveMouse(
      40 +
      Math.random() *
      (window.innerWidth - 80),

      40 +
      Math.random() *
      (window.innerHeight - 80)
    );

  }, 5000);


  /*
   * 창 크기가 바뀌어서
   * 생쥐가 화면 밖으로 나갔을 경우 복귀
   */
  window.addEventListener('resize', () => {
    moveMouse(mouseX, mouseY);
  });
})();
