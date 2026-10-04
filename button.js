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
  ['🏥 외래예진기록', '/st/clinical-training/outpatient/field-final'],
  ['👀 외래참관', '/st/clinical-training/outpatient/observation']
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
/* =========================
   빈자리 → 색상 변경 버튼
   ========================= */

const themeShortcut = document.createElement('button');

themeShortcut.type = 'button';
themeShortcut.textContent = '🎨 색상 변경';

Object.assign(themeShortcut.style, {
  display: 'block',
  width: '100%',
  padding: '11px 6px',
  border: '0',
  borderRadius: '10px',

  background:
    'linear-gradient(135deg,#2563eb,#3b82f6)',

  color: '#fff',
  textAlign: 'center',
  fontWeight: '700',
  fontSize: '13px',

  boxShadow: '0 3px 10px #0002',

  cursor: 'pointer',

  transition: '.15s'
});


themeShortcut.onmouseenter = () => {
  themeShortcut.style.transform =
    'translateY(-2px)';

  themeShortcut.style.boxShadow =
    '0 5px 14px #0003';
};


themeShortcut.onmouseleave = () => {
  themeShortcut.style.transform = '';

  themeShortcut.style.boxShadow =
    '0 3px 10px #0002';
};


/*
 * 누르면 기존 🎨 테마 선택창 열기
 */
themeShortcut.addEventListener(
  'click',
  e => {

    e.preventDefault();
    e.stopPropagation();

    const panel =
      document.querySelector(
        '#my-theme-panel'
      );

    if (!panel) return;

    panel.classList.toggle('open');

  }
);


box.appendChild(themeShortcut);
  const profile = document.querySelector('.main-profile');

  if (profile && !document.querySelector('#profile-shortcuts')) {
    profile.before(box);
  }


  /* =========================
     2. 프로필 이름 커스텀

     - 학번 (숫자) 자동 제거
     - 기본 이름이 민유진이면 "유지니"로 표시
     - 이름 클릭 → 바로 수정
     - Enter / 포커스 해제 → localStorage 저장
     - Esc → 수정 취소
     ========================= */

  const PROFILE_NAME_STORAGE_KEY =
    'my-uportfolio-profile-name';

  function stripStudentNumber(text) {
    return String(text || '')
      .replace(/\s*\(\s*\d{6,12}\s*\)\s*$/g, '')
      .trim();
  }

  let defaultProfileName = '';
  let customProfileName = '';
  let profileNameInitialized = false;

  function initializeProfileName(nameEl) {
    if (profileNameInitialized || !nameEl) return;

    const originalName = stripStudentNumber(
      nameEl.textContent
    );

    defaultProfileName =
      originalName === '민유진'
        ? '유지니'
        : (originalName || '유지니');

    let savedName = '';

    try {
      savedName = stripStudentNumber(
        localStorage.getItem(
          PROFILE_NAME_STORAGE_KEY
        ) || ''
      );
    } catch (e) {}

    customProfileName = savedName || defaultProfileName;
    profileNameInitialized = true;

    // 최초 기본값도 저장해서 새로고침 후 그대로 유지
    if (!savedName) {
      try {
        localStorage.setItem(
          PROFILE_NAME_STORAGE_KEY,
          customProfileName
        );
      } catch (e) {}
    }
  }

  function saveCustomProfileName(name) {
    const cleaned =
      stripStudentNumber(name) || defaultProfileName || '유지니';

    customProfileName = cleaned;

    try {
      localStorage.setItem(
        PROFILE_NAME_STORAGE_KEY,
        cleaned
      );
    } catch (e) {}

    return cleaned;
  }

  function ensureCustomProfileName() {
    const nameEl = document.querySelector(
      '.main-profile .user .name'
    );

    if (!nameEl) return;

    initializeProfileName(nameEl);

    nameEl.dataset.myEditableName = 'true';
    nameEl.title = '클릭해서 이름 수정';
    nameEl.style.cursor = 'text';

    if (nameEl.getAttribute('contenteditable') === 'true') {
      return;
    }

    if (nameEl.textContent !== customProfileName) {
      nameEl.textContent = customProfileName;
    }
  }

  function finishProfileNameEdit(nameEl, shouldSave = true) {
    if (!nameEl) return;

    if (shouldSave) {
      nameEl.textContent = saveCustomProfileName(
        nameEl.textContent
      );
    } else {
      nameEl.textContent = customProfileName;
    }

    nameEl.removeAttribute('contenteditable');
    nameEl.removeAttribute('spellcheck');
    nameEl.style.outline = '';
    nameEl.style.borderRadius = '';
  }

  function startProfileNameEdit(nameEl) {
    if (!nameEl) return;
    if (nameEl.getAttribute('contenteditable') === 'true') return;

    initializeProfileName(nameEl);

    nameEl.setAttribute('contenteditable', 'true');
    nameEl.setAttribute('spellcheck', 'false');
    nameEl.style.outline = '2px solid var(--my-accent, #2563eb)';
    nameEl.style.borderRadius = '6px';

    nameEl.focus();

    const range = document.createRange();
    range.selectNodeContents(nameEl);

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  ensureCustomProfileName();

  // 사이트가 프로필 영역을 다시 그려도 이름 복구
  setInterval(
    ensureCustomProfileName,
    500
  );

  document.addEventListener(
    'click',
    e => {
      const nameEl = e.target.closest(
        '.main-profile .user .name'
      );

      if (!nameEl) return;

      // 수정 중에는 기본 클릭 동작(커서 이동/선택)을 유지
      if (nameEl.getAttribute('contenteditable') === 'true') {
        e.stopPropagation();
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      startProfileNameEdit(nameEl);
    },
    true
  );

  document.addEventListener(
    'keydown',
    e => {
      const nameEl = e.target.closest?.(
        '.main-profile .user .name[contenteditable="true"]'
      );

      if (!nameEl) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        finishProfileNameEdit(nameEl, true);
        nameEl.blur();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        finishProfileNameEdit(nameEl, false);
        nameEl.blur();
      }
    },
    true
  );

  document.addEventListener(
    'focusout',
    e => {
      const nameEl = e.target.closest?.(
        '.main-profile .user .name[contenteditable="true"]'
      );

      if (!nameEl) return;

      finishProfileNameEdit(nameEl, true);
    },
    true
  );


  /* =========================
     3. 시간대별 my_word 문구

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
   - 생쥐 클릭 → 즉시 숨김
   - 숨김 상태는 localStorage에 저장
   ========================= */

const MOUSE_HIDDEN_STORAGE_KEY =
  'my-uportfolio-mouse-hidden';

let mouseHidden = false;

try {
  mouseHidden =
    localStorage.getItem(
      MOUSE_HIDDEN_STORAGE_KEY
    ) === 'true';
} catch (e) {}

const mouse = document.createElement('div');
mouse.id = 'runaway-mouse';
mouse.textContent = '🐭';
mouse.title = '클릭하면 생쥐 숨기기';

Object.assign(mouse.style, {
  position: 'fixed',
  left: '0',
  top: '0',
  fontSize: '34px',
  zIndex: '999999',

  // 클릭할 수 있도록 기존 none → auto
  pointerEvents: 'auto',
  cursor: 'pointer',

  userSelect: 'none',
  filter: 'drop-shadow(0 3px 3px #0005)',
  willChange: 'transform',
  display: mouseHidden ? 'none' : 'block'
});

document.body.appendChild(mouse);


// =========================
// 생쥐 클릭 → 숨김 + 저장
// =========================

mouse.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();

  mouseHidden = true;
  mouse.style.display = 'none';

  try {
    localStorage.setItem(
      MOUSE_HIDDEN_STORAGE_KEY,
      'true'
    );
  } catch (e) {}
});


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

  // 숨겨진 뒤에는 타이머도 더 돌리지 않음
  if (mouseHidden) return;

  // 현재 방향에서 랜덤하게 좌우 회전
  wanderAngle +=
    (Math.random() - 0.5) * Math.PI * 1.2;

  const next =
    400 + Math.random() * 1000;

  setTimeout(changeWanderDirection, next);
}

if (!mouseHidden) {
  changeWanderDirection();
}


// =========================
// 움직임
// =========================

function animateMouse() {

  // 클릭해서 숨겨졌거나 저장된 숨김 상태면 종료
  if (mouseHidden) return;

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

if (!mouseHidden) {
  animateMouse();
}


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
   5. 프로필 사진 후광 효과
   ========================= */
/* =========================
   5. 프로필 오로라 + 시선 추적
   ========================= */

// 현재 오로라 상태
let profileAuraEnabled = true;

// 현재 마우스 위치
let profileCursorX = window.innerWidth / 2;
let profileCursorY = window.innerHeight / 2;

// 현재 / 목표 회전값
let currentRotateX = 0;
let currentRotateY = 0;

let targetRotateX = 0;
let targetRotateY = 0;


// =========================
// CSS
// =========================

const profileEffectStyle = document.createElement('style');

profileEffectStyle.textContent = `

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

    transition:
      opacity .35s ease,
      filter .35s ease;

    pointer-events: none;
  }


  #profile-aura.aura-off {
    opacity: 0 !important;
    animation-play-state: paused;
  }


  [data-name="profileImg"] {
    transform-style: preserve-3d;
    will-change: transform;
    border-radius: 50% !important;

    /*
      JS에서 매 프레임 transform을 조절하므로
      transform transition은 넣지 않음
    */
    transition:
      filter .25s ease;

    /*
      이제 클릭하면 오로라가 켜지고 꺼지므로
      클릭 가능한 표시
    */
    cursor: pointer !important;
  }


  [data-name="profileImg"]:hover {
    filter:
      brightness(1.04)
      drop-shadow(
        0 7px 10px
        rgba(0, 0, 0, .16)
      );
  }


  [data-name="my_word"] {
    cursor: default !important;
  }

`;

document.head.appendChild(profileEffectStyle);


// =========================
// 오로라 생성 / 복구
// =========================

function ensureProfileAura() {

  const profileImg =
    document.querySelector(
      '[data-name="profileImg"]'
    );

  if (!profileImg) return null;


  const parent =
    profileImg.parentElement;

  if (!parent) return null;


  parent.style.position = 'relative';

  profileImg.style.position = 'relative';
  profileImg.style.zIndex = '2';


  let aura =
    document.querySelector(
      '#profile-aura'
    );


  // 오로라가 사라졌으면 다시 생성
  if (!aura) {

    aura =
      document.createElement('div');

    aura.id = 'profile-aura';


    Object.assign(aura.style, {
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
    });


    parent.insertBefore(
      aura,
      profileImg
    );
  }


  // 현재 프로필 사진 크기와 위치에 맞춤
  const extra = 9;

  aura.style.width =
    `${profileImg.offsetWidth + extra * 2}px`;

  aura.style.height =
    `${profileImg.offsetHeight + extra * 2}px`;

  aura.style.left =
    `${profileImg.offsetLeft - extra}px`;

  aura.style.top =
    `${profileImg.offsetTop - extra}px`;


  // 현재 ON/OFF 상태 적용
  aura.classList.toggle(
    'aura-off',
    !profileAuraEnabled
  );


  return {
    profileImg,
    aura
  };
}


// 처음 생성
ensureProfileAura();


// DOM 재렌더링 등에 대비해 복구
setInterval(
  ensureProfileAura,
  1000
);


// =========================
// 화면 어디에 있든 마우스 위치 추적
// =========================

document.addEventListener(
  'mousemove',
  e => {

    profileCursorX = e.clientX;
    profileCursorY = e.clientY;

  },
  {
    passive: true
  }
);


// =========================
// 프로필이 마우스를 바라보게 만들기
// =========================

function animateProfileLook() {

  const profileImg =
    document.querySelector(
      '[data-name="profileImg"]'
    );

  if (profileImg) {

    const rect =
      profileImg.getBoundingClientRect();

    const centerX =
      rect.left + rect.width / 2;

    const centerY =
      rect.top + rect.height / 2;


    // 현재 커서가 프사 위에 있는지
    const isHovering =
      profileCursorX >= rect.left &&
      profileCursorX <= rect.right &&
      profileCursorY >= rect.top &&
      profileCursorY <= rect.bottom;


    if (isHovering) {

      /* =========================
         프사 위에 있을 때
         강한 3D 틸트
         ========================= */

      // 프사 중심 기준 -1 ~ 1
      const localX =
        (
          profileCursorX - centerX
        ) / (rect.width / 2);

      const localY =
        (
          profileCursorY - centerY
        ) / (rect.height / 2);


      // 프사 위에서는 강하게
      const hoverRotate = 18;

      targetRotateY =
        localX * hoverRotate;

      targetRotateX =
        -localY * hoverRotate;

    } else {

      /* =========================
         프사 밖에 있을 때
         화면 전체 시선 추적
         ========================= */

      const dx =
        profileCursorX - centerX;

      const dy =
        profileCursorY - centerY;


      const normalizedX =
        dx / (window.innerWidth / 2);

      const normalizedY =
        dy / (window.innerHeight / 2);


      // 평소에는 은은하게
      const normalRotate = 9;

      targetRotateY =
        Math.max(
          -normalRotate,
          Math.min(
            normalRotate,
            normalizedX * normalRotate
          )
        );

      targetRotateX =
        Math.max(
          -normalRotate,
          Math.min(
            normalRotate,
            -normalizedY * normalRotate
          )
        );
    }


    /* =========================
       부드럽게 목표 방향 따라가기
       ========================= */

    // hover 중에는 반응도 조금 더 빠르게
    const smooth =
      isHovering ? 0.16 : 0.07;

    currentRotateX +=
      (
        targetRotateX -
        currentRotateX
      ) * smooth;

    currentRotateY +=
      (
        targetRotateY -
        currentRotateY
      ) * smooth;


    /* =========================
       살짝 위치 이동
       ========================= */

    const moveStrength =
      isHovering ? 0.28 : 0.18;

    const moveX =
      currentRotateY *
      moveStrength;

    const moveY =
      -currentRotateX *
      moveStrength;


    /* =========================
       프사 위에서는 앞으로도 살짝 튀어나옴
       ========================= */

    const z =
      isHovering ? 16 : 8;

    const scale =
      isHovering ? 1.055 : 1.025;


    profileImg.style.transform = `
      perspective(600px)

      translate3d(
        ${moveX}px,
        ${moveY}px,
        ${z}px
      )

      rotateX(
        ${currentRotateX}deg
      )

      rotateY(
        ${currentRotateY}deg
      )

      scale(${scale})
    `;
  }


  requestAnimationFrame(
    animateProfileLook
  );
}
animateProfileLook();


// =========================
// 프사 클릭 → 오로라 ON / OFF
//
// my_word 클릭 → 링크 이동만 방지
// =========================

document.addEventListener(
  'click',
  e => {

    const profileImg =
      e.target.closest(
        '[data-name="profileImg"]'
      );


    if (profileImg) {

      // 부모 <a>의 정보수정 이동 방지
      e.preventDefault();
      e.stopPropagation();


      // 오로라 상태 반전
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

      return;
    }


    const myWord =
      e.target.closest(
        '[data-name="my_word"]'
      );


    if (myWord) {

      // 응원문구 클릭 시
      // 정보수정 화면 이동 방지
      e.preventDefault();
      e.stopPropagation();

    }

  },

  // 부모 a 태그보다 먼저 처리
  true
);


// =========================
// 창 크기 변경 대응
// =========================

window.addEventListener(
  'resize',
  () => {

    ensureProfileAura();

  }
);
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
  /* =========================
   6. 전체 페이지 테마 변경 🎨
   기본 = 블루
   상단 네비게이션도 테마와 함께 변경
   ========================= */

const themeStyle = document.createElement('style');

themeStyle.textContent = `

  /* =========================
     기본값 = 블루
     ========================= */

  html {
    --my-bg: #eff6ff;
    --my-card: #ffffff;
    --my-card-2: #f1f6ff;

    --my-text: #293748;
    --my-subtext: #718096;

    --my-border: #dae6f5;

    --my-accent: #2563eb;
    --my-accent-2: #3b82f6;

    --my-soft: #e2ecff;

    --my-shadow:
      0 4px 20px rgba(37,99,235,.08);

    /* 상단 네비게이션 */
    --nav-bg-1: #2563eb;
    --nav-bg-2: #3b82f6;

    --nav-text: #ffffff;
    --nav-hover: rgba(255,255,255,.14);

    --nav-sub-bg: #ffffff;
    --nav-sub-text: #333333;
    --nav-sub-hover: #eaf1ff;
  }


  /* =========================
     기본 = 블루
     ========================= */

  html[data-my-theme="blue"] {
    --my-bg: #eff6ff;
    --my-card: #ffffff;
    --my-card-2: #f1f6ff;

    --my-text: #293748;
    --my-subtext: #718096;

    --my-border: #dae6f5;

    --my-accent: #2563eb;
    --my-accent-2: #3b82f6;

    --my-soft: #e2ecff;

    --my-shadow:
      0 4px 20px rgba(37,99,235,.08);

    --nav-bg-1: #2563eb;
    --nav-bg-2: #3b82f6;

    --nav-text: #ffffff;
    --nav-hover: rgba(255,255,255,.14);

    --nav-sub-bg: #ffffff;
    --nav-sub-text: #333333;
    --nav-sub-hover: #eaf1ff;
  }


  /* =========================
     퍼플
     ========================= */

  html[data-my-theme="purple"] {
    --my-bg: #f4f1fb;
    --my-card: #ffffff;
    --my-card-2: #f5f1ff;

    --my-text: #342d40;
    --my-subtext: #7d728c;

    --my-border: #e5dcf3;

    --my-accent: #7c3aed;
    --my-accent-2: #a855f7;

    --my-soft: #eee7fa;

    --my-shadow:
      0 4px 20px rgba(124,58,237,.08);

    --nav-bg-1: #6d28d9;
    --nav-bg-2: #a855f7;

    --nav-text: #ffffff;
    --nav-hover: rgba(255,255,255,.14);

    --nav-sub-bg: #ffffff;
    --nav-sub-text: #342d40;
    --nav-sub-hover: #f3e8ff;
  }


  /* =========================
     핑크
     ========================= */

  html[data-my-theme="pink"] {
    --my-bg: #fff3f7;
    --my-card: #ffffff;
    --my-card-2: #fff4f8;

    --my-text: #423238;
    --my-subtext: #8d747d;

    --my-border: #f3dce5;

    --my-accent: #ec4899;
    --my-accent-2: #f472b6;

    --my-soft: #fde8f1;

    --my-shadow:
      0 4px 20px rgba(236,72,153,.08);

    --nav-bg-1: #db2777;
    --nav-bg-2: #f472b6;

    --nav-text: #ffffff;
    --nav-hover: rgba(255,255,255,.14);

    --nav-sub-bg: #ffffff;
    --nav-sub-text: #423238;
    --nav-sub-hover: #fce7f3;
  }


  /* =========================
     민트
     ========================= */

  html[data-my-theme="mint"] {
    --my-bg: #effaf7;
    --my-card: #ffffff;
    --my-card-2: #f0faf7;

    --my-text: #293d38;
    --my-subtext: #6f8781;

    --my-border: #d7eee7;

    --my-accent: #0f9f82;
    --my-accent-2: #34c7a7;

    --my-soft: #dcf4ed;

    --my-shadow:
      0 4px 20px rgba(15,159,130,.08);

    --nav-bg-1: #0f766e;
    --nav-bg-2: #2dd4bf;

    --nav-text: #ffffff;
    --nav-hover: rgba(255,255,255,.14);

    --nav-sub-bg: #ffffff;
    --nav-sub-text: #293d38;
    --nav-sub-hover: #dff8f3;
  }


  /* =========================
     다크
     ========================= */

  html[data-my-theme="dark"] {
    --my-bg: #17181c;
    --my-card: #22242a;
    --my-card-2: #292c34;

    --my-text: #ececf1;
    --my-subtext: #aeb1bb;

    --my-border: #363943;

    --my-accent: #8b7cf6;
    --my-accent-2: #c084fc;

    --my-soft: #30303d;

    --my-shadow:
      0 5px 22px rgba(0,0,0,.25);

    --nav-bg-1: #1f2026;
    --nav-bg-2: #484050;

    --nav-text: #f4f4f5;
    --nav-hover: rgba(255,255,255,.10);

    --nav-sub-bg: #25272e;
    --nav-sub-text: #eeeeee;
    --nav-sub-hover: #353842;
  }


  /* =========================
     페이지 전체
     ========================= */

  html[data-my-theme] body,
  html[data-my-theme] .page-content-wrap {
    background:
      var(--my-bg) !important;

    color:
      var(--my-text) !important;

    transition:
      background .35s ease,
      color .35s ease;
  }


  /* =========================
     카드
     ========================= */

  html[data-my-theme] .card-wrap,
  html[data-my-theme] .card-body,
  html[data-my-theme] .card-content {
    background-color:
      var(--my-card) !important;

    color:
      var(--my-text) !important;

    border-color:
      var(--my-border) !important;
  }


  html[data-my-theme] .card-wrap {
    box-shadow:
      var(--my-shadow) !important;
  }


  html[data-my-theme] .card-title,
  html[data-my-theme] .content-title,
  html[data-my-theme] .graph-title,
  html[data-my-theme] .box-title {
    color:
      var(--my-text) !important;
  }


  html[data-my-theme] .info,
  html[data-my-theme] .desc,
  html[data-my-theme] .date {
    color:
      var(--my-subtext) !important;
  }


  /* =========================
     제출현황 박스
     ========================= */

  html[data-my-theme] .box-item {
    background:
      var(--my-card-2) !important;

    border-color:
      var(--my-border) !important;
  }


  html[data-my-theme] .box-desc {
    color:
      var(--my-text) !important;
  }


  /* =========================
     탭 버튼
     ========================= */

  html[data-my-theme] .btn-tab {
    color:
      var(--my-subtext) !important;

    border-color:
      var(--my-border) !important;
  }


  html[data-my-theme] .btn-tab.active-tab {
    color:
      var(--my-accent) !important;

    border-color:
      var(--my-accent) !important;
  }


  /* =========================
     강조색
     ========================= */

  html[data-my-theme] .font-blue {
    color:
      var(--my-accent) !important;
  }


  html[data-my-theme] [data-name="line"] {
    background:
      linear-gradient(
        90deg,
        var(--my-accent),
        var(--my-accent-2)
      ) !important;
  }


  /* =========================
     응원문구
     ========================= */

  html[data-my-theme] [data-name="my_word"] {
    background:
      var(--my-card-2) !important;

    color:
      var(--my-text) !important;

    border:
      1px solid var(--my-border) !important;
  }


  /* =========================
     내가 만든 바로가기
     ========================= */

  html[data-my-theme] #profile-shortcuts a,
  html[data-my-theme] #profile-shortcuts button {
    background:
      linear-gradient(
        135deg,
        var(--my-accent),
        var(--my-accent-2)
      ) !important;

    box-shadow:
      0 3px 12px
      color-mix(
        in srgb,
        var(--my-accent) 25%,
        transparent
      ) !important;
  }


  /* =========================
     ★ 상단 네비게이션 바
     ========================= */

  html[data-my-theme] .nav-wrap,
  html[data-my-theme] .nav-wrap-inner,
  html[data-my-theme] .nav-bg {
    background:
      linear-gradient(
        110deg,
        var(--nav-bg-1) 0%,
        var(--nav-bg-2) 100%
      ) !important;
  }


  /* MY / PhaseⅠ / PhaseⅡ / ... */
  html[data-my-theme]
  #topMenuListAdd
  > .depth-1
  > .link-text {
    color:
      var(--nav-text) !important;

    transition:
      background .18s ease,
      color .18s ease;
  }


  html[data-my-theme]
  #topMenuListAdd
  > .depth-1
  > .link-text:hover {
    background:
      var(--nav-hover) !important;
  }


  /* ▼ 삼각형 */
  html[data-my-theme]
  #topMenuListAdd
  > .depth-1
  > .link-text
  .triangle {
    border-top-color:
      var(--nav-text) !important;
  }


  /* 펼쳐지는 하위 메뉴 */
  html[data-my-theme]
  #topMenuListAdd
  .sub-menu-list-wrap {
    background:
      var(--nav-sub-bg) !important;

    border-color:
      var(--my-border) !important;

    box-shadow:
      0 8px 22px rgba(0,0,0,.14) !important;
  }


  html[data-my-theme]
  #topMenuListAdd
  .depth-2
  > .link-text {
    color:
      var(--nav-sub-text) !important;

    transition:
      background .15s ease,
      color .15s ease;
  }


  html[data-my-theme]
  #topMenuListAdd
  .depth-2
  > .link-text:hover {
    background:
      var(--nav-sub-hover) !important;

    color:
      var(--nav-bg-1) !important;
  }


  /* 햄버거 메뉴 영역도 바 색상에 맞춤 */
  html[data-my-theme] .btn-menu-trigger {
    background:
      transparent !important;
  }


  /* =========================
     달력
     ========================= */

  html[data-my-theme] #calendar,
  html[data-my-theme] #calendar table,
  html[data-my-theme] .fc-view,
  html[data-my-theme] .fc-row,
  html[data-my-theme] .fc-widget-content,
  html[data-my-theme] .fc-widget-header {
    background:
      var(--my-card) !important;

    color:
      var(--my-text) !important;

    border-color:
      var(--my-border) !important;
  }


  html[data-my-theme] .fc-today {
    background:
      var(--my-soft) !important;
  }


  html[data-my-theme] .fc-button {
    background:
      var(--my-card-2) !important;

    color:
      var(--my-text) !important;

    border-color:
      var(--my-border) !important;
  }


  html[data-my-theme] .fc-state-active {
    background:
      var(--my-accent) !important;

    color:
      white !important;
  }


  /* =========================
     피드백톡
     ========================= */

  html[data-my-theme] .talk-box {
    background:
      var(--my-card-2) !important;

    color:
      var(--my-text) !important;

    border-color:
      var(--my-accent) !important;
  }


  html[data-my-theme] .talk-box .text,
  html[data-my-theme] .talk-box .subject,
  html[data-my-theme] .talk-box .name {
    color:
      var(--my-text) !important;
  }


  /* =========================
     링크 / 일반 버튼
     ========================= */

  html[data-my-theme] .rate-change {
    color:
      var(--my-accent) !important;

    background:
      var(--my-card-2) !important;

    border-color:
      var(--my-border) !important;
  }


  /* =========================
     폼
     ========================= */

  html[data-my-theme] input,
  html[data-my-theme] textarea,
  html[data-my-theme] select {
    background-color:
      var(--my-card) !important;

    color:
      var(--my-text) !important;

    border-color:
      var(--my-border) !important;
  }


  /* =========================
     다크테마 추가 보정
     ========================= */

  html[data-my-theme="dark"] a:not(#profile-shortcuts a) {
    color:
      #d7d8df;
  }


  html[data-my-theme="dark"] .fc-other-month {
    opacity: .45;
  }


  /* =========================
     테마 선택 버튼
     ========================= */

  #my-theme-control {
    position: fixed;

    left: 18px;
    bottom: 18px;

    z-index: 9999999;

    font-family:
      Arial,
      sans-serif;
  }


  #my-theme-button {
    width: 46px;
    height: 46px;

    padding: 0;

    border: 0;
    border-radius: 50%;

    background:
      linear-gradient(
        135deg,
        var(--my-accent),
        var(--my-accent-2)
      );

    color: white;

    font-size: 21px;

    cursor: pointer;

    box-shadow:
      0 5px 18px rgba(0,0,0,.20);

    transition:
      transform .18s ease;
  }


  #my-theme-button:hover {
    transform:
      scale(1.08)
      rotate(10deg);
  }


  /* 선택창 */
  #my-theme-panel {
    position: absolute;

    left: 0;
    bottom: 56px;

    width: 164px;

    padding: 10px;

    display: none;

    grid-template-columns:
      1fr 1fr;

    gap: 7px;

    background:
      var(--my-card);

    border:
      1px solid var(--my-border);

    border-radius:
      14px;

    box-shadow:
      0 7px 25px rgba(0,0,0,.16);
  }


  #my-theme-panel.open {
    display: grid;
  }


  .my-theme-option {
    border:
      1px solid var(--my-border);

    border-radius: 9px;

    padding: 8px 5px;

    cursor: pointer;

    font-size: 12px;
    font-weight: 700;

    background:
      var(--my-card-2);

    color:
      var(--my-text);

    transition:
      transform .12s ease,
      border-color .12s ease;
  }


  .my-theme-option:hover {
    transform:
      translateY(-2px);

    border-color:
      var(--my-accent);
  }


  .my-theme-option.active {
    border-color:
      var(--my-accent);

    box-shadow:
      inset 0 0 0 1px
      var(--my-accent);
  }

`;

document.head.appendChild(
  themeStyle
);


/* =========================
   테마 선택 UI
   ========================= */

const themeControl =
  document.createElement('div');

themeControl.id =
  'my-theme-control';


const themeButton =
  document.createElement('button');

themeButton.id =
  'my-theme-button';

themeButton.type =
  'button';

themeButton.textContent =
  '🎨';

themeButton.title =
  '색상 테마 변경';


const themePanel =
  document.createElement('div');

themePanel.id =
  'my-theme-panel';


/*
 * 기본 = 블루
 * 별도의 "블루" 항목은 만들지 않음
 */
const themes = [

  {
    id: 'blue',
    name: '기본',
    icon: '🔵'
  },

  {
    id: 'purple',
    name: '퍼플',
    icon: '🟣'
  },

  {
    id: 'pink',
    name: '핑크',
    icon: '🌸'
  },

  {
    id: 'mint',
    name: '민트',
    icon: '🍃'
  },

  {
    id: 'dark',
    name: '다크',
    icon: '🌙'
  }

];


/* =========================
   테마 적용
   ========================= */

function applyMyTheme(theme) {

  /*
   * 예전 버전에서 default가 저장되어 있으면
   * 자동으로 기본 블루로 교체
   */
  if (theme === 'default') {
    theme = 'blue';
  }


  if (
    !themes.some(
      x => x.id === theme
    )
  ) {
    theme = 'blue';
  }


  document.documentElement.setAttribute(
    'data-my-theme',
    theme
  );


  /*
   * 새로고침 후에도 유지
   */
  try {

    localStorage.setItem(
      'my-uportfolio-theme',
      theme
    );

  } catch (e) {}


  /*
   * 현재 선택 표시
   */
  themePanel
    .querySelectorAll(
      '.my-theme-option'
    )
    .forEach(btn => {

      btn.classList.toggle(
        'active',
        btn.dataset.theme === theme
      );

    });

}


/* =========================
   테마 버튼 생성
   ========================= */

themes.forEach(theme => {

  const btn =
    document.createElement('button');

  btn.type =
    'button';

  btn.className =
    'my-theme-option';

  btn.dataset.theme =
    theme.id;

  btn.textContent =
    `${theme.icon} ${theme.name}`;


  btn.addEventListener(
    'click',
    e => {

      e.preventDefault();
      e.stopPropagation();

      applyMyTheme(
        theme.id
      );

      themePanel.classList.remove(
        'open'
      );

    }
  );


  themePanel.appendChild(
    btn
  );

});


themeButton.addEventListener(
  'click',
  e => {

    e.preventDefault();
    e.stopPropagation();

    themePanel.classList.toggle(
      'open'
    );

  }
);


/*
 * 바깥 클릭하면 닫기
 */
document.addEventListener(
  'click',
  e => {

    if (
      !themeControl.contains(
        e.target
      )
    ) {

      themePanel.classList.remove(
        'open'
      );

    }

  }
);


themeControl.appendChild(
  themePanel
);

themeControl.appendChild(
  themeButton
);

document.body.appendChild(
  themeControl
);


/* =========================
   이전 선택 테마 복구
   기본값은 무조건 blue
   ========================= */

let savedTheme =
  'blue';

try {

  savedTheme =
    localStorage.getItem(
      'my-uportfolio-theme'
    ) || 'blue';

} catch (e) {}


/*
 * 예전 코드에서 저장된 default도
 * 자동으로 blue로 마이그레이션
 */
if (savedTheme === 'default') {
  savedTheme = 'blue';
}


if (
  !themes.some(
    x => x.id === savedTheme
  )
) {

  savedTheme =
    'blue';

}


applyMyTheme(
  savedTheme
);
})();
