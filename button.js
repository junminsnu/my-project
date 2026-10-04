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

/* =========================
   3. 응원 문구 좀비 복구 시스템
   ========================= */

function getCurrentMessage() {
  const hour = new Date().getHours();

  return messages.find(
    x => hour >= x.start && hour < x.end
  );
}


function injectMyWord() {

  const item = getCurrentMessage();
  if (!item) return;

  let el = document.querySelector('[data-name="my_word"]');


  /* =========================
     my_word 자체가 사라졌으면 다시 생성
     ========================= */

  if (!el) {

    const profileImg =
      document.querySelector('[data-name="profileImg"]');

    const cardContent =
      document.querySelector(
        '.main-profile .card-content'
      );

    if (!cardContent) return;


    el = document.createElement('p');

    el.setAttribute('data-name', 'my_word');
    el.className = 'caption dotdotdot';


    // 가능하면 프로필 사진 바로 앞에 삽입
    if (profileImg && profileImg.parentElement === cardContent) {
      cardContent.insertBefore(el, profileImg);
    } else {
      cardContent.prepend(el);
    }
  }


  /* =========================
     문구가 지워졌거나 바뀌었으면 복구
     ========================= */

  if (el.textContent !== item.text) {
    el.textContent = item.text;
  }


  /* =========================
     스타일도 다시 복구
     ========================= */

  Object.assign(el.style, {
    overflowWrap: 'break-word',
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


// 처음 실행
injectMyWord();


// 0.5초마다 감시
setInterval(injectMyWord, 500);


// 창 크기 변경 시에도 즉시 복구
window.addEventListener('resize', injectMyWord);/* =========================
   4. 계속 돌아다니는 생쥐 🐭
   ========================= */

const mouse = document.createElement('div');
mouse.id = 'runaway-mouse';
mouse.textContent = '🐭';

Object.assign(mouse.style, {
  position: 'fixed',
  left: '0',
  top: '0',
  fontSize: '34px',
  zIndex: '999999',
  pointerEvents: 'none',
  userSelect: 'none',
  filter: 'drop-shadow(0 3px 3px #0005)',
  willChange: 'transform'
});

document.body.appendChild(mouse);


// =========================
// 현재 상태
// =========================

let x = window.innerWidth * 0.5;
let y = window.innerHeight * 0.5;

let vx = 0;
let vy = 0;

// 평소 이동 방향
let wanderAngle = Math.random() * Math.PI * 2;

// 실제 커서 위치
let cursorX = -9999;
let cursorY = -9999;


// =========================
// 설정값
// =========================

// 커서 감지 거리
const dangerDistance = 170;

// 평소 돌아다니는 속도
const wanderSpeed = 1.4;

// 도망갈 때 최대 속도
const escapeSpeed = 7;

// 방향 전환 부드러움
const steering = 0.025;

// 화면 가장자리 여백
const padding = 35;


// =========================
// 커서 위치 추적
// =========================

document.addEventListener('mousemove', e => {
  cursorX = e.clientX;
  cursorY = e.clientY;
});


// =========================
// 평소 랜덤 방향 변경
// =========================

// 0.4~1.4초마다 살짝 방향 변경
function changeWanderDirection() {

  // 현재 방향에서 랜덤하게 좌우 회전
  wanderAngle +=
    (Math.random() - 0.5) * Math.PI * 1.2;

  const next =
    400 + Math.random() * 1000;

  setTimeout(changeWanderDirection, next);
}

changeWanderDirection();


// =========================
// 움직임
// =========================

function animateMouse() {

  const dx = x - cursorX;
  const dy = y - cursorY;

  const distance = Math.sqrt(
    dx * dx + dy * dy
  );


  let targetVX;
  let targetVY;


  if (
    distance < dangerDistance &&
    distance > 0
  ) {

    /* -------------------------
       커서가 가까우면 도망
       ------------------------- */

    const escapeAngle =
      Math.atan2(dy, dx);

    // 가까울수록 빨라짐
    const power =
      1 - distance / dangerDistance;

    const speed =
      3 +
      power * (escapeSpeed - 3);

    targetVX =
      Math.cos(escapeAngle) * speed;

    targetVY =
      Math.sin(escapeAngle) * speed;


    // 너무 가까우면 살짝 옆으로 틀기
    // 직선으로만 도망가지 않게
    if (distance < 80) {

      const side =
        Math.random() < 0.5 ? -1 : 1;

      targetVX +=
        Math.cos(escapeAngle + Math.PI / 2) *
        side *
        1.5;

      targetVY +=
        Math.sin(escapeAngle + Math.PI / 2) *
        side *
        1.5;
    }

  } else {

    /* -------------------------
       평소에는 계속 돌아다님
       ------------------------- */

    targetVX =
      Math.cos(wanderAngle) *
      wanderSpeed;

    targetVY =
      Math.sin(wanderAngle) *
      wanderSpeed;
  }


  // =========================
  // 목표 속도로 부드럽게 회전
  // =========================

  vx +=
    (targetVX - vx) *
    steering;

  vy +=
    (targetVY - vy) *
    steering;


  // =========================
  // 이동
  // =========================

  x += vx;
  y += vy;


  // =========================
  // 벽 만나면 자연스럽게 방향 변경
  // =========================

  if (x < padding) {

    x = padding;

    wanderAngle =
      Math.random() *
      Math.PI -
      Math.PI / 2;

    vx = Math.abs(vx);
  }


  if (
    x >
    window.innerWidth - padding
  ) {

    x =
      window.innerWidth - padding;

    wanderAngle =
      Math.PI / 2 +
      Math.random() *
      Math.PI;

    vx = -Math.abs(vx);
  }


  if (y < padding) {

    y = padding;

    wanderAngle =
      Math.random() *
      Math.PI;

    vy = Math.abs(vy);
  }


  if (
    y >
    window.innerHeight - padding
  ) {

    y =
      window.innerHeight - padding;

    wanderAngle =
      Math.PI +
      Math.random() *
      Math.PI;

    vy = -Math.abs(vy);
  }


  // =========================
  // 생쥐 표시
  // =========================

  const flip =
    vx < 0 ? -1 : 1;

  // 달릴 때 아주 살짝 위아래 흔들림
  const bounce =
    Math.sin(performance.now() / 90) *
    Math.min(
      2,
      Math.abs(vx) + Math.abs(vy)
    );

  mouse.style.transform =
    `translate(
      ${x}px,
      ${y + bounce}px
    )
    translate(-50%, -50%)
    scaleX(${flip})`;


  requestAnimationFrame(animateMouse);
}

animateMouse();


// 창 크기 변경 대응
window.addEventListener('resize', () => {

  x = Math.max(
    padding,
    Math.min(
      window.innerWidth - padding,
      x
    )
  );

  y = Math.max(
    padding,
    Math.min(
      window.innerHeight - padding,
      y
    )
  );
});
/* =========================
   프로필 사진 내부 시선 추적
   ========================= */

let profileCursorX = window.innerWidth / 2;
let profileCursorY = window.innerHeight / 2;

let photoCurrentX = 0;
let photoCurrentY = 0;
let photoCurrentRotateX = 0;
let photoCurrentRotateY = 0;

let profileAuraEnabled = true;


/* =========================
   CSS
   ========================= */

const profileEffectStyle = document.createElement('style');

profileEffectStyle.textContent = `

  /*
   * 바깥 원
   * 절대로 기울어지지 않음
   */
  [data-name="profileImg"] {
    position: relative !important;

    border-radius: 50% !important;
    overflow: hidden !important;

    cursor: pointer !important;

    /*
     * 원 자체의 기존 배경 제거
     * 실제 사진은 내부 div로 이동
     */
    background-image: none !important;

    transform: none !important;

    z-index: 2;

    /*
     * 사진이 원 밖으로 절대 나오지 않게
     */
    isolation: isolate;
  }


  /*
   * 실제 프로필 사진
   */
  .profile-inner-photo {
    position: absolute;

    /*
     * 원보다 크게 만들어야
     * 사진이 움직여도 빈틈이 안 생김
     */
    width: 125%;
    height: 125%;

    left: 50%;
    top: 50%;

    background-position: center center;
    background-size: cover;
    background-repeat: no-repeat;

    pointer-events: none;

    will-change: transform;

    /*
     * 사진 자체는 직사각형이어도 됨.
     * 부모 원에서 잘리므로 여기에는
     * border-radius 필요 없음.
     */
  }


  /*
   * 사진 위에 아주 약한 입체광
   */
  .profile-inner-light {
    position: absolute;
    inset: 0;

    border-radius: 50%;

    pointer-events: none;

    z-index: 3;

    background:
      radial-gradient(
        circle at var(--light-x, 50%) var(--light-y, 50%),
        rgba(255,255,255,.20),
        rgba(255,255,255,0) 48%
      );

    transition: background .1s linear;
  }


  @keyframes profileAuraSpin {

    0% {
      transform: rotate(0deg) scale(1);
      opacity: .58;
    }

    50% {
      transform: rotate(180deg) scale(1.02);
      opacity: .68;
    }

    100% {
      transform: rotate(360deg) scale(1);
      opacity: .58;
    }
  }


  #profile-aura {
    animation:
      profileAuraSpin
      5s
      linear
      infinite;

    pointer-events: none;

    transition:
      opacity .3s ease;
  }


  #profile-aura.aura-off {
    opacity: 0 !important;
    animation-play-state: paused;
  }

`;

document.head.appendChild(profileEffectStyle);


/* =========================
   프로필 내부 사진 만들기
   ========================= */

function setupProfilePhoto() {

  const profileImg =
    document.querySelector(
      '[data-name="profileImg"]'
    );

  if (!profileImg) return null;


  /*
   * 최초 한 번만 원래 background-image 저장
   */
  if (!profileImg.dataset.originalProfileImage) {

    const computed =
      getComputedStyle(profileImg);

    const originalImage =
      computed.backgroundImage;

    if (
      originalImage &&
      originalImage !== 'none'
    ) {
      profileImg.dataset.originalProfileImage =
        originalImage;
    }
  }


  /*
   * 내부 실제 사진
   */
  let inner =
    profileImg.querySelector(
      '.profile-inner-photo'
    );


  if (!inner) {

    inner =
      document.createElement('div');

    inner.className =
      'profile-inner-photo';

    profileImg.appendChild(inner);
  }


  if (
    profileImg.dataset.originalProfileImage
  ) {

    inner.style.backgroundImage =
      profileImg.dataset.originalProfileImage;
  }


  /*
   * 빛 반사 레이어
   */
  let light =
    profileImg.querySelector(
      '.profile-inner-light'
    );


  if (!light) {

    light =
      document.createElement('div');

    light.className =
      'profile-inner-light';

    profileImg.appendChild(light);
  }


  return {
    profileImg,
    inner,
    light
  };
}


/* =========================
   오로라 생성
   ========================= */

function ensureProfileAura() {

  const data =
    setupProfilePhoto();

  if (!data) return null;

  const profileImg =
    data.profileImg;

  const parent =
    profileImg.parentElement;

  if (!parent) return null;


  parent.style.position =
    'relative';


  let aura =
    document.querySelector(
      '#profile-aura'
    );


  if (!aura) {

    aura =
      document.createElement('div');

    aura.id =
      'profile-aura';


    Object.assign(
      aura.style,
      {
        position: 'absolute',

        borderRadius: '50%',

        background: `
          conic-gradient(
            from 0deg,
            #60a5fa,
            #8b5cf6,
            #ec4899,
            #f472b6,
            #8b5cf6,
            #60a5fa
          )
        `,

        filter: 'blur(8px)',

        zIndex: '1',

        pointerEvents: 'none'
      }
    );


    parent.insertBefore(
      aura,
      profileImg
    );
  }


  const extra = 9;


  aura.style.width =
    `${
      profileImg.offsetWidth +
      extra * 2
    }px`;


  aura.style.height =
    `${
      profileImg.offsetHeight +
      extra * 2
    }px`;


  aura.style.left =
    `${
      profileImg.offsetLeft -
      extra
    }px`;


  aura.style.top =
    `${
      profileImg.offsetTop -
      extra
    }px`;


  aura.classList.toggle(
    'aura-off',
    !profileAuraEnabled
  );


  return {
    ...data,
    aura
  };
}


ensureProfileAura();


/*
 * 사이트가 프로필을 다시 그렸을 때도 복구
 */
setInterval(
  ensureProfileAura,
  1000
);


/* =========================
   화면 전체 마우스 위치
   ========================= */

document.addEventListener(
  'mousemove',
  e => {

    profileCursorX =
      e.clientX;

    profileCursorY =
      e.clientY;

  },
  {
    passive: true
  }
);


/* =========================
   내부 사진이 커서를 따라봄
   ========================= */

function animateProfileFace() {

  const data =
    setupProfilePhoto();


  if (data) {

    const {
      profileImg,
      inner,
      light
    } = data;


    const rect =
      profileImg.getBoundingClientRect();


    const centerX =
      rect.left +
      rect.width / 2;


    const centerY =
      rect.top +
      rect.height / 2;


    const dx =
      profileCursorX -
      centerX;


    const dy =
      profileCursorY -
      centerY;


    /*
     * 프사 위에 커서가 있는지
     */
    const hovering =
      profileCursorX >= rect.left &&
      profileCursorX <= rect.right &&
      profileCursorY >= rect.top &&
      profileCursorY <= rect.bottom;


    let targetX;
    let targetY;

    let targetRX;
    let targetRY;


    if (hovering) {

      /*
       * =========================
       * 프사 위
       * 훨씬 강하게 반응
       * =========================
       */

      const nx =
        Math.max(
          -1,
          Math.min(
            1,
            dx / (rect.width / 2)
          )
        );


      const ny =
        Math.max(
          -1,
          Math.min(
            1,
            dy / (rect.height / 2)
          )
        );


      /*
       * 사진 내부 이동량
       */
      targetX =
        nx * 9;

      targetY =
        ny * 7;


      /*
       * 사진 자체 기울기
       */
      targetRY =
        nx * 12;

      targetRX =
        -ny * 10;


      /*
       * 빛도 마우스 따라 이동
       */
      light.style.setProperty(
        '--light-x',
        `${50 + nx * 28}%`
      );

      light.style.setProperty(
        '--light-y',
        `${50 + ny * 28}%`
      );

    } else {

      /*
       * =========================
       * 화면 어디에 있든
       * 은은하게 따라봄
       * =========================
       */

      const nx =
        Math.max(
          -1,
          Math.min(
            1,
            dx /
            (window.innerWidth / 2)
          )
        );


      const ny =
        Math.max(
          -1,
          Math.min(
            1,
            dy /
            (window.innerHeight / 2)
          )
        );


      /*
       * 평소에는 매우 조금만 이동
       */
      targetX =
        nx * 4;

      targetY =
        ny * 3;


      targetRY =
        nx * 4;

      targetRX =
        -ny * 3;


      light.style.setProperty(
        '--light-x',
        `${50 + nx * 14}%`
      );

      light.style.setProperty(
        '--light-y',
        `${50 + ny * 14}%`
      );
    }


    /*
     * =========================
     * 부드러운 추적
     * =========================
     */

    const smooth =
      hovering
        ? 0.14
        : 0.055;


    photoCurrentX +=
      (
        targetX -
        photoCurrentX
      ) * smooth;


    photoCurrentY +=
      (
        targetY -
        photoCurrentY
      ) * smooth;


    photoCurrentRotateX +=
      (
        targetRX -
        photoCurrentRotateX
      ) * smooth;


    photoCurrentRotateY +=
      (
        targetRY -
        photoCurrentRotateY
      ) * smooth;


    /*
     * =========================
     * 중요:
     * 바깥 원은 안 움직이고
     * 안쪽 사진만 움직임
     * =========================
     */

    const scale =
      hovering
        ? 1.08
        : 1.04;


    inner.style.transform = `
      translate(
        calc(-50% + ${photoCurrentX}px),
        calc(-50% + ${photoCurrentY}px)
      )

      perspective(500px)

      rotateX(
        ${photoCurrentRotateX}deg
      )

      rotateY(
        ${photoCurrentRotateY}deg
      )

      scale(${scale})
    `;
  }


  requestAnimationFrame(
    animateProfileFace
  );
}


animateProfileFace();


/* =========================
   클릭 → 오로라 ON/OFF
   ========================= */

document.addEventListener(
  'click',
  e => {

    const profileImg =
      e.target.closest(
        '[data-name="profileImg"]'
      );


    if (!profileImg) return;


    e.preventDefault();
    e.stopPropagation();


    profileAuraEnabled =
      !profileAuraEnabled;


    const aura =
      ensureProfileAura()?.aura;


    if (aura) {

      aura.classList.toggle(
        'aura-off',
        !profileAuraEnabled
      );
    }

  },
  true
);


/* =========================
   크기 변경 대응
   ========================= */

window.addEventListener(
  'resize',
  ensureProfileAura
);
  /* =========================
   프로필 흰색 카드 전체 링크 제거
   ========================= */

function disableProfileCardLink() {

  const link = document.querySelector(
    '.main-profile > a[href="/st/my/profile/modify"], ' +
    '.main-profile a[href="/st/my/profile/modify"]'
  );

  if (!link) return;

  // 원래 주소는 필요하면 보관
  if (!link.dataset.originalHref) {
    link.dataset.originalHref =
      link.getAttribute('href') || '';
  }

  // 실제 링크 기능 제거
  link.removeAttribute('href');

  // 링크처럼 보이는 마우스 커서 제거
  link.style.cursor = 'default';
}


// 최초 실행
disableProfileCardLink();


// 사이트가 프로필 영역을 다시 그릴 수도 있으므로 계속 복구
setInterval(
  disableProfileCardLink,
  500
);


// 혹시 href가 다시 붙는 순간에도 클릭 방지
document.addEventListener(
  'click',
  e => {

    const profileCard =
      e.target.closest('.main-profile');

    if (!profileCard) return;

    const modifyLink =
      e.target.closest(
        'a[href="/st/my/profile/modify"]'
      );

    if (modifyLink) {
      e.preventDefault();
    }

  },
  true
);
})();
