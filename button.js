(() => {
  // 중복 실행 방지
  if (window.myUiLoaded) return;
  window.myUiLoaded = true;

  /* =========================
     1. 프로필 위 바로가기 버튼

     - 바로가기 이름 / 주소 수정, 추가, 삭제
     - 드래그로 순서 변경
     - 설정은 localStorage 저장
     ========================= */

  const SHORTCUT_STORAGE_KEY =
    'my-uportfolio-shortcuts-v1';

  const DEFAULT_SHORTCUTS = [
    { text: '📝 일실기', href: '/st/clinical-training/day-practice' },
    { text: '📅 주실기', href: '/st/clinical-training/week-plan' },
    { text: '✨ 최종성찰', href: '/st/clinical-training/final-ref' },
    { text: '🏥 외래예진기록', href: '/st/clinical-training/outpatient/field-final' },
    { text: '👀 외래참관', href: '/st/clinical-training/outpatient/observation' }
  ];

  function normalizeShortcutHref(value) {
    const href = String(value || '').trim() || '/';

    // javascript: 주소는 실수로 넣어도 실행되지 않게 차단
    if (/^javascript\s*:/i.test(href)) {
      return '#';
    }

    return href;
  }

  function loadShortcuts() {
    try {
      const parsed = JSON.parse(
        localStorage.getItem(SHORTCUT_STORAGE_KEY) || 'null'
      );

      if (Array.isArray(parsed) && parsed.length) {
        const cleaned = parsed
          .map(item => ({
            text: String(item?.text || '').trim(),
            href: normalizeShortcutHref(item?.href)
          }))
          .filter(item => item.text);

        if (cleaned.length) return cleaned;
      }
    } catch (e) {}

    return DEFAULT_SHORTCUTS.map(item => ({ ...item }));
  }

  let shortcuts = loadShortcuts();

  function saveShortcuts() {
    try {
      localStorage.setItem(
        SHORTCUT_STORAGE_KEY,
        JSON.stringify(shortcuts)
      );
    } catch (e) {}
  }

  const box = document.createElement('div');
  box.id = 'profile-shortcuts';

  Object.assign(box.style, {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '12px'
  });


  /* =========================
     색상 변경 버튼
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
    background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '13px',
    boxShadow: '0 3px 10px #0002',
    cursor: 'pointer',
    transition: '.15s'
  });

  themeShortcut.onmouseenter = () => {
    themeShortcut.style.transform = 'translateY(-2px)';
    themeShortcut.style.boxShadow = '0 5px 14px #0003';
  };

  themeShortcut.onmouseleave = () => {
    themeShortcut.style.transform = '';
    themeShortcut.style.boxShadow = '0 3px 10px #0002';
  };

  themeShortcut.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();

    const panel = document.querySelector('#my-theme-panel');
    if (!panel) return;

    panel.classList.toggle('open');
  });


  /* =========================
     바로가기 편집 버튼
     ========================= */

  const shortcutEditButton = document.createElement('button');
  shortcutEditButton.type = 'button';
  shortcutEditButton.textContent = '✏️ 바로가기 편집';

  Object.assign(shortcutEditButton.style, {
    gridColumn: '1 / -1',
    display: 'block',
    width: '100%',
    padding: '10px 6px',
    border: '0',
    borderRadius: '10px',
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    transition: '.15s'
  });

  box.appendChild(themeShortcut);
  box.appendChild(shortcutEditButton);


  /* =========================
     바로가기 렌더링 + 드래그 정렬
     ========================= */

  let draggingShortcutIndex = null;
  let shortcutDragFinishedAt = 0;

  function moveShortcut(fromIndex, toIndex) {
    if (
      fromIndex === null ||
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= shortcuts.length ||
      toIndex >= shortcuts.length
    ) return;

    const [moved] = shortcuts.splice(fromIndex, 1);
    shortcuts.splice(toIndex, 0, moved);

    saveShortcuts();
    renderShortcuts();
  }

  function renderShortcuts() {
    box
      .querySelectorAll('.my-user-shortcut')
      .forEach(el => el.remove());

    shortcuts.forEach((item, index) => {
      const a = document.createElement('a');

      a.className = 'my-user-shortcut';
      a.href = normalizeShortcutHref(item.href);
      a.textContent = item.text;
      a.draggable = true;
      a.dataset.shortcutIndex = String(index);
      a.title = '드래그해서 순서 변경';

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
        transition: '.15s',
        cursor: 'grab'
      });

      a.onmouseenter = () => {
        a.style.transform = 'translateY(-2px)';
        a.style.boxShadow = '0 5px 14px #0003';
      };

      a.onmouseleave = () => {
        a.style.transform = '';
        a.style.boxShadow = '0 3px 10px #0002';
      };

      a.addEventListener('click', e => {
        // 드래그 직후 링크가 눌리는 현상 방지
        if (Date.now() - shortcutDragFinishedAt < 350) {
          e.preventDefault();
        }
      });

      a.addEventListener('dragstart', e => {
        draggingShortcutIndex = Number(a.dataset.shortcutIndex);
        a.style.opacity = '.55';

        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(draggingShortcutIndex));
        }
      });

      a.addEventListener('dragover', e => {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'move';
        }
      });

      a.addEventListener('drop', e => {
        e.preventDefault();
        e.stopPropagation();

        const targetIndex = Number(a.dataset.shortcutIndex);
        moveShortcut(draggingShortcutIndex, targetIndex);
      });

      a.addEventListener('dragend', () => {
        draggingShortcutIndex = null;
        shortcutDragFinishedAt = Date.now();
        a.style.opacity = '';
      });

      box.insertBefore(a, themeShortcut);
    });
  }

  renderShortcuts();

  const profile = document.querySelector('.main-profile');

  if (profile && !document.querySelector('#profile-shortcuts')) {
    profile.before(box);
  }


  /* =========================
     바로가기 편집창
     ========================= */

  const shortcutEditorStyle = document.createElement('style');
  shortcutEditorStyle.textContent = `
    #my-shortcut-editor-backdrop {
      position: fixed;
      inset: 0;
      z-index: 10000020;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(0,0,0,.35);
    }

    #my-shortcut-editor-backdrop.open {
      display: flex;
    }

    #my-shortcut-editor {
      width: min(720px, 96vw);
      max-height: 82vh;
      overflow: auto;
      padding: 16px;
      border: 1px solid var(--my-border, #dae6f5);
      border-radius: 16px;
      background: var(--my-card, #fff);
      color: var(--my-text, #293748);
      box-shadow: 0 18px 60px rgba(0,0,0,.25);
      font-family: Arial, sans-serif;
    }

    #my-shortcut-editor h3 {
      margin: 0 0 6px;
      font-size: 16px;
    }

    #my-shortcut-editor .editor-guide {
      margin: 0 0 12px;
      color: var(--my-subtext, #718096);
      font-size: 12px;
      line-height: 1.45;
    }

    #my-shortcut-editor-list {
      display: grid;
      gap: 8px;
    }

    .my-shortcut-editor-row {
      display: grid;
      grid-template-columns: 28px minmax(120px,.8fr) minmax(180px,1.4fr) 34px;
      gap: 7px;
      align-items: center;
      padding: 8px;
      border: 1px solid var(--my-border, #dae6f5);
      border-radius: 10px;
      background: var(--my-card-2, #f1f6ff);
    }

    .my-shortcut-drag-handle {
      cursor: grab;
      text-align: center;
      user-select: none;
      font-size: 17px;
    }

    .my-shortcut-editor-row input {
      min-width: 0;
      box-sizing: border-box;
      width: 100%;
      padding: 8px 9px;
      border: 1px solid var(--my-border, #dae6f5);
      border-radius: 8px;
      background: var(--my-card, #fff) !important;
      color: var(--my-text, #293748) !important;
      font-size: 12px;
    }

    .my-shortcut-delete {
      width: 32px;
      height: 32px;
      padding: 0;
      border: 0;
      border-radius: 8px;
      background: #ef4444 !important;
      color: #fff !important;
      cursor: pointer;
      font-weight: 800;
    }

    .my-shortcut-editor-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: 12px;
    }

    .my-shortcut-editor-actions button {
      padding: 9px 12px;
      border: 1px solid var(--my-border, #dae6f5);
      border-radius: 9px;
      background: var(--my-card-2, #f1f6ff);
      color: var(--my-text, #293748);
      cursor: pointer;
      font-weight: 700;
      font-size: 12px;
    }

    .my-shortcut-editor-actions .primary {
      margin-left: auto;
      border-color: var(--my-accent, #2563eb);
      background: var(--my-accent, #2563eb);
      color: #fff;
    }

    @media (max-width: 620px) {
      .my-shortcut-editor-row {
        grid-template-columns: 26px 1fr 32px;
      }

      .my-shortcut-editor-row .my-shortcut-url {
        grid-column: 2 / 4;
      }
    }
  `;
  document.head.appendChild(shortcutEditorStyle);

  const shortcutEditorBackdrop = document.createElement('div');
  shortcutEditorBackdrop.id = 'my-shortcut-editor-backdrop';

  const shortcutEditor = document.createElement('div');
  shortcutEditor.id = 'my-shortcut-editor';

  const shortcutEditorTitle = document.createElement('h3');
  shortcutEditorTitle.textContent = '바로가기 편집';

  const shortcutEditorGuide = document.createElement('p');
  shortcutEditorGuide.className = 'editor-guide';
  shortcutEditorGuide.textContent =
    '이름과 주소를 수정할 수 있어요. 행을 드래그하면 순서가 바뀌고, 저장하면 다음 접속에도 유지됩니다.';

  const shortcutEditorList = document.createElement('div');
  shortcutEditorList.id = 'my-shortcut-editor-list';

  const shortcutEditorActions = document.createElement('div');
  shortcutEditorActions.className = 'my-shortcut-editor-actions';

  const shortcutAddButton = document.createElement('button');
  shortcutAddButton.type = 'button';
  shortcutAddButton.textContent = '➕ 추가';

  const shortcutCancelButton = document.createElement('button');
  shortcutCancelButton.type = 'button';
  shortcutCancelButton.textContent = '취소';

  const shortcutSaveButton = document.createElement('button');
  shortcutSaveButton.type = 'button';
  shortcutSaveButton.className = 'primary';
  shortcutSaveButton.textContent = '저장';

  shortcutEditorActions.append(
    shortcutAddButton,
    shortcutCancelButton,
    shortcutSaveButton
  );

  shortcutEditor.append(
    shortcutEditorTitle,
    shortcutEditorGuide,
    shortcutEditorList,
    shortcutEditorActions
  );

  shortcutEditorBackdrop.appendChild(shortcutEditor);
  document.body.appendChild(shortcutEditorBackdrop);

  let shortcutDraft = [];
  let editorDraggingIndex = null;

  function renderShortcutEditor() {
    shortcutEditorList.textContent = '';

    shortcutDraft.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'my-shortcut-editor-row';
      row.draggable = true;
      row.dataset.index = String(index);

      const handle = document.createElement('div');
      handle.className = 'my-shortcut-drag-handle';
      handle.textContent = '☰';
      handle.title = '드래그해서 순서 변경';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = item.text;
      nameInput.placeholder = '버튼 이름';
      nameInput.addEventListener('input', () => {
        shortcutDraft[index].text = nameInput.value;
      });

      const urlInput = document.createElement('input');
      urlInput.type = 'text';
      urlInput.className = 'my-shortcut-url';
      urlInput.value = item.href;
      urlInput.placeholder = '/주소 또는 https://...';
      urlInput.addEventListener('input', () => {
        shortcutDraft[index].href = urlInput.value;
      });

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'my-shortcut-delete';
      deleteButton.textContent = '×';
      deleteButton.title = '삭제';
      deleteButton.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        shortcutDraft.splice(index, 1);
        renderShortcutEditor();
      });

      row.addEventListener('dragstart', e => {
        editorDraggingIndex = index;
        row.style.opacity = '.55';
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
        }
      });

      row.addEventListener('dragover', e => {
        e.preventDefault();
      });

      row.addEventListener('drop', e => {
        e.preventDefault();
        e.stopPropagation();

        const toIndex = Number(row.dataset.index);
        if (
          editorDraggingIndex === null ||
          editorDraggingIndex === toIndex
        ) return;

        const [moved] = shortcutDraft.splice(editorDraggingIndex, 1);
        shortcutDraft.splice(toIndex, 0, moved);
        editorDraggingIndex = null;
        renderShortcutEditor();
      });

      row.addEventListener('dragend', () => {
        editorDraggingIndex = null;
        row.style.opacity = '';
      });

      row.append(handle, nameInput, urlInput, deleteButton);
      shortcutEditorList.appendChild(row);
    });
  }

  function openShortcutEditor() {
    shortcutDraft = shortcuts.map(item => ({ ...item }));
    renderShortcutEditor();
    shortcutEditorBackdrop.classList.add('open');
  }

  function closeShortcutEditor() {
    shortcutEditorBackdrop.classList.remove('open');
  }

  shortcutEditButton.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    openShortcutEditor();
  });

  shortcutAddButton.addEventListener('click', () => {
    shortcutDraft.push({
      text: '새 바로가기',
      href: '/'
    });
    renderShortcutEditor();
  });

  shortcutCancelButton.addEventListener('click', closeShortcutEditor);

  shortcutSaveButton.addEventListener('click', () => {
    const cleaned = shortcutDraft
      .map(item => ({
        text: String(item.text || '').trim(),
        href: normalizeShortcutHref(item.href)
      }))
      .filter(item => item.text);

    shortcuts = cleaned.length
      ? cleaned
      : DEFAULT_SHORTCUTS.map(item => ({ ...item }));

    saveShortcuts();
    renderShortcuts();
    closeShortcutEditor();
  });

  shortcutEditorBackdrop.addEventListener('click', e => {
    if (e.target === shortcutEditorBackdrop) {
      closeShortcutEditor();
    }
  });

  /* =========================
     2. 프로필 이름 커스텀

     - 학번 (숫자) 자동 제거
     - 기본 이름이 민유진이면 "🐰 유지니"로 표시
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
        ? '🐰 유지니'
        : (originalName || '🐰 유지니');

    let savedName = '';

    try {
      savedName = stripStudentNumber(
        localStorage.getItem(
          PROFILE_NAME_STORAGE_KEY
        ) || ''
      );
    } catch (e) {}

    // 이전 버전의 기본값 "유지니"는 새 기본값으로 자동 마이그레이션
    if (savedName === '유지니') {
      savedName = '🐰 유지니';

      try {
        localStorage.setItem(
          PROFILE_NAME_STORAGE_KEY,
          savedName
        );
      } catch (e) {}
    }

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
      stripStudentNumber(name) || defaultProfileName || '🐰 유지니';

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
     3. D-Day 표시

     - 프로필 정보 아래에 표시
     - 클릭해서 제목 / 날짜 수정
     - localStorage 저장
     ========================= */

  const DDAY_STORAGE_KEY =
    'my-uportfolio-dday-v1';

  let ddayData = null;

  function loadDday() {
    try {
      const parsed = JSON.parse(
        localStorage.getItem(DDAY_STORAGE_KEY) || 'null'
      );

      if (
        parsed &&
        typeof parsed === 'object' &&
        /^\d{4}-\d{2}-\d{2}$/.test(String(parsed.date || ''))
      ) {
        return {
          title: String(parsed.title || 'D-Day').trim() || 'D-Day',
          date: String(parsed.date)
        };
      }
    } catch (e) {}

    return null;
  }

  ddayData = loadDday();

  function saveDday() {
    try {
      if (ddayData) {
        localStorage.setItem(
          DDAY_STORAGE_KEY,
          JSON.stringify(ddayData)
        );
      } else {
        localStorage.removeItem(DDAY_STORAGE_KEY);
      }
    } catch (e) {}
  }

  function getDdayText() {
    if (!ddayData) return '📅 D-Day 설정';

    const [year, month, day] = ddayData.date
      .split('-')
      .map(Number);

    if (!year || !month || !day) {
      return '📅 D-Day 설정';
    }

    const now = new Date();
    const todayUtc = Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const targetUtc = Date.UTC(
      year,
      month - 1,
      day
    );

    const diff = Math.round(
      (targetUtc - todayUtc) / 86400000
    );

    let label = 'D-DAY';

    if (diff > 0) label = `D-${diff}`;
    if (diff < 0) label = `D+${Math.abs(diff)}`;

    return `📅 ${ddayData.title} ${label}`;
  }

  function ensureDday() {
    const userBox = document.querySelector(
      '.main-profile .user'
    );

    if (!userBox) return;

    let el = userBox.querySelector('#my-dday');

    if (!el) {
      el = document.createElement('p');
      el.id = 'my-dday';
      el.title = '클릭해서 D-Day 설정';

      Object.assign(el.style, {
        display: 'inline-block',
        margin: '7px 0 0',
        padding: '5px 9px',
        border: '1px solid var(--my-border, #dae6f5)',
        borderRadius: '999px',
        background: 'var(--my-card-2, #f1f6ff)',
        color: 'var(--my-text, #293748)',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        lineHeight: '1.35'
      });

      userBox.appendChild(el);
    }

    const currentText = getDdayText();
    if (el.textContent !== currentText) {
      el.textContent = currentText;
    }
  }

  function editDday() {
    const currentDate = ddayData?.date || '';

    const date = window.prompt(
      'D-Day 날짜를 YYYY-MM-DD 형식으로 입력해 주세요.\n비워서 확인하면 D-Day를 삭제합니다.',
      currentDate
    );

    if (date === null) return;

    const cleanedDate = date.trim();

    if (!cleanedDate) {
      ddayData = null;
      saveDday();
      ensureDday();
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
      window.alert('날짜는 YYYY-MM-DD 형식으로 입력해 주세요.');
      return;
    }

    const [year, month, day] = cleanedDate.split('-').map(Number);
    const testDate = new Date(year, month - 1, day);

    if (
      testDate.getFullYear() !== year ||
      testDate.getMonth() !== month - 1 ||
      testDate.getDate() !== day
    ) {
      window.alert('존재하는 날짜를 입력해 주세요.');
      return;
    }

    const title = window.prompt(
      'D-Day 이름을 입력해 주세요.',
      ddayData?.title || '시험'
    );

    if (title === null) return;

    ddayData = {
      title: title.trim() || 'D-Day',
      date: cleanedDate
    };

    saveDday();
    ensureDday();
  }

  ensureDday();
  setInterval(ensureDday, 1000);

  document.addEventListener(
    'click',
    e => {
      const dday = e.target.closest?.('#my-dday');
      if (!dday) return;

      e.preventDefault();
      e.stopPropagation();
      editDday();
    },
    true
  );


  /* =========================
     4. 응원 문구

     - 기존 시간대별 문구
     - 요일별 문구
     - 둘 중 하나를 랜덤 선택
     - 0.5초 감시 때문에 문구가 계속 깜빡이지 않도록
       같은 시간대에서는 한 번 선택한 문구를 유지
     - 시간대가 바뀌면 다시 랜덤 선택
     ========================= */

  const timeMessages = [
    { start: 0,  end: 4,  text: '조금만 더하고 빨리자 ㅎㅎ 사랑해🐰❣️' },
    { start: 4,  end: 11, text: '오늘 하루도 힘내💗' },
    { start: 11, end: 13, text: '점심 잘머거💗' },
    { start: 13, end: 16, text: '좋은 오후 보내🧡' },
    { start: 16, end: 23, text: '오늘 하루도 수고했어🤍' },
    { start: 23, end: 24, text: '오늘은 여기까지 해도 충분해 💗😴🤍 잘자' }
  ];

  function getTimeMessage(now = new Date()) {
    const hour = now.getHours();

    return timeMessages.find(
      item => hour >= item.start && hour < item.end
    ) || null;
  }

  function getWeekdayMessage(now = new Date()) {
    const day = now.getDay();
    const hour = now.getHours();

    if (day === 1) {
      return {
        text: '이번 주 케이스는 잘 받았어?? 천천히 시작해🤍'
      };
    }

    if (day === 2) {
      return {
        text: '금요일까지 사흘이나 남았어 ㅎㅎ 아직 여유 있어🩵'
      };
    }

    if (day === 3) {
      return {
        text: '벌써 한주의 절반이나 왔네 조금만 더힘내💓'
      };
    }

    if (day === 4) {
      return {
        text: '내일이네 ㅎㅎ 딱 하루만 더 힘내!!!🐰'
      };
    }

    if (day === 5 && hour < 12) {
      return {
        text: '열심히한만큼 잘 될거야🧡'
      };
    }

    // 금요일 오후 + 토요일 + 일요일
    return {
      text: '주말은 푹셔🤍'
    };
  }

  let randomMessageSlot = '';
  let randomMessageItem = null;

  function getMessageSlotKey(now = new Date()) {
    const hour = now.getHours();
    const timeItem = getTimeMessage(now);

    const timeSlot = timeItem
      ? `${timeItem.start}-${timeItem.end}`
      : String(hour);

    // 날짜 + 시간대가 같으면 같은 랜덤 결과 유지
    return [
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
      timeSlot
    ].join('-');
  }

  function getCurrentMessage() {
    const now = new Date();
    const slot = getMessageSlotKey(now);

    if (slot !== randomMessageSlot || !randomMessageItem) {
      const timeItem = getTimeMessage(now);
      const weekdayItem = getWeekdayMessage(now);

      const candidates = [
        timeItem,
        weekdayItem
      ].filter(Boolean);

      randomMessageItem = candidates.length
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : null;

      randomMessageSlot = slot;
    }

    return randomMessageItem;
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
   5. 계속 돌아다니는 생쥐 🐭
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


// 테마 창의 "생쥐 다시 부르기"에서 사용
function showMouseAgain() {
  mouseHidden = false;
  mouseGoingToProfile = false;
  mouseUnderProfile = false;
  chaseStartedAt = 0;
  profileLeaveStartedAt = 0;

  mouse.style.display = 'block';
  mouse.style.opacity = '1';
  mouse.style.zIndex = '999999';
  mouse.style.pointerEvents = 'auto';

  // 다시 부를 때 화면 중앙 근처에서 재시작
  x = window.innerWidth * 0.5;
  y = window.innerHeight * 0.5;
  vx = 0;
  vy = 0;
  wanderAngle = Math.random() * Math.PI * 2;

  try {
    localStorage.setItem(
      MOUSE_HIDDEN_STORAGE_KEY,
      'false'
    );
  } catch (e) {}
}


// =========================
// 생쥐가 프로필 사진 밑으로 숨는 상태
// =========================

let mouseGoingToProfile = false;
let mouseUnderProfile = false;
let chaseStartedAt = 0;
let profileLeaveStartedAt = 0;

// 이 시간 이상 계속 쫓아오면 프사 밑으로 도망감
const chaseToProfileDelay = 900;

// 프사에서 이 거리 이상 떨어져 있으면 다시 나올 준비
const profileReleaseDistance = 280;

// 커서가 멀어진 상태가 이만큼 유지되면 다시 등장
const profileReleaseDelay = 1200;

function getMouseProfileShelter() {
  const profileImg =
    document.querySelector('[data-name="profileImg"]');

  if (!profileImg) return null;

  const rect = profileImg.getBoundingClientRect();

  if (!rect.width || !rect.height) return null;

  return {
    // 사진 중앙보다 살짝 아래쪽: 사진 밑으로 들어가는 느낌
    x: rect.left + rect.width * 0.50,
    y: rect.top + rect.height * 0.66,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
    rect
  };
}

function startMouseProfileEscape() {
  if (mouseGoingToProfile || mouseUnderProfile) return;

  mouseGoingToProfile = true;
  mouseUnderProfile = false;
  chaseStartedAt = 0;
  profileLeaveStartedAt = 0;

  // 프사로 도망가는 동안에는 클릭보다 도망 동작 우선
  mouse.style.pointerEvents = 'none';
  mouse.style.opacity = '1';
  mouse.style.zIndex = '999999';
}

function releaseMouseFromProfile() {
  const shelter = getMouseProfileShelter();

  mouseGoingToProfile = false;
  mouseUnderProfile = false;
  chaseStartedAt = 0;
  profileLeaveStartedAt = 0;

  mouse.style.opacity = '1';
  mouse.style.zIndex = '999999';
  mouse.style.pointerEvents = 'auto';

  // 프사 옆에서 슬쩍 다시 나옴
  if (shelter) {
    x = Math.min(
      window.innerWidth - padding,
      shelter.rect.right + 24
    );

    y = Math.min(
      window.innerHeight - padding,
      shelter.rect.bottom - 8
    );
  }

  vx = 0;
  vy = 0;
  wanderAngle = Math.random() * Math.PI * 2;
}

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

  // 완전히 숨김 처리된 상태라면 루프만 유지
  if (mouseHidden) {
    requestAnimationFrame(animateMouse);
    return;
  }

  const now = performance.now();
  const shelter = getMouseProfileShelter();

  const dx = x - cursorX;
  const dy = y - cursorY;

  const distance = Math.sqrt(
    dx * dx + dy * dy
  );


  // =========================
  // 계속 쫓아오면 프사 쪽으로 피신 시작
  // =========================

  if (
    !mouseGoingToProfile &&
    !mouseUnderProfile
  ) {

    if (
      distance < dangerDistance &&
      distance > 0
    ) {

      if (!chaseStartedAt) {
        chaseStartedAt = now;
      }

      if (
        now - chaseStartedAt >=
        chaseToProfileDelay
      ) {
        startMouseProfileEscape();
      }

    } else if (
      distance > dangerDistance * 1.15
    ) {
      // 커서가 충분히 멀어지면 추격 판정 초기화
      chaseStartedAt = 0;
    }
  }


  // =========================
  // 프사 밑으로 도망가는 중
  // =========================

  if (mouseGoingToProfile) {

    if (!shelter) {
      mouseGoingToProfile = false;
      mouse.style.pointerEvents = 'auto';
    } else {

      const toX = shelter.x - x;
      const toY = shelter.y - y;
      const toDistance = Math.sqrt(
        toX * toX + toY * toY
      );

      if (toDistance > 0) {
        const runSpeed = Math.min(
          11,
          Math.max(5.5, toDistance * 0.075)
        );

        const targetVX =
          toX / toDistance * runSpeed;

        const targetVY =
          toY / toDistance * runSpeed;

        // 프사로 피신할 때는 평소보다 빠르게 방향 전환
        vx += (targetVX - vx) * 0.16;
        vy += (targetVY - vy) * 0.16;
      }

      x += vx;
      y += vy;

      const afterDX = shelter.x - x;
      const afterDY = shelter.y - y;
      const afterDistance = Math.sqrt(
        afterDX * afterDX + afterDY * afterDY
      );

      // 사진 가까이 들어가면 사진 뒤 레이어로 이동
      if (afterDistance < 42) {
        mouse.style.zIndex = '1';

        // 안쪽으로 들어갈수록 자연스럽게 사라짐
        mouse.style.opacity = String(
          Math.max(0, Math.min(1, afterDistance / 42))
        );
      }

      if (afterDistance < 9) {
        x = shelter.x;
        y = shelter.y;
        vx = 0;
        vy = 0;

        mouseGoingToProfile = false;
        mouseUnderProfile = true;

        mouse.style.opacity = '0';
        mouse.style.zIndex = '1';
      }

      const flip = vx < 0 ? -1 : 1;

      mouse.style.transform =
        `translate(${x}px, ${y}px) ` +
        `translate(-50%, -50%) ` +
        `scaleX(${flip})`;

      requestAnimationFrame(animateMouse);
      return;
    }
  }


  // =========================
  // 프사 밑에 숨어 있는 상태
  // =========================

  if (mouseUnderProfile) {

    if (!shelter) {
      releaseMouseFromProfile();
    } else {

      // 프사가 움직이거나 화면이 바뀌어도 밑에 붙어 있게
      x = shelter.x;
      y = shelter.y;
      vx = 0;
      vy = 0;

      mouse.style.opacity = '0';
      mouse.style.zIndex = '1';

      mouse.style.transform =
        `translate(${x}px, ${y}px) ` +
        `translate(-50%, -50%)`;

      const cursorProfileDX =
        cursorX - shelter.centerX;

      const cursorProfileDY =
        cursorY - shelter.centerY;

      const cursorProfileDistance =
        Math.sqrt(
          cursorProfileDX * cursorProfileDX +
          cursorProfileDY * cursorProfileDY
        );

      if (
        cursorProfileDistance >
        profileReleaseDistance
      ) {

        if (!profileLeaveStartedAt) {
          profileLeaveStartedAt = now;
        }

        if (
          now - profileLeaveStartedAt >=
          profileReleaseDelay
        ) {
          releaseMouseFromProfile();
        }

      } else {
        profileLeaveStartedAt = 0;
      }

      requestAnimationFrame(animateMouse);
      return;
    }
  }


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


  // 목표 속도로 부드럽게 회전
  vx +=
    (targetVX - vx) *
    steering;

  vy +=
    (targetVY - vy) *
    steering;


  // 이동
  x += vx;
  y += vy;


  // 벽 만나면 자연스럽게 방향 변경
  if (x < padding) {
    x = padding;
    wanderAngle =
      Math.random() * Math.PI - Math.PI / 2;
    vx = Math.abs(vx);
  }

  if (x > window.innerWidth - padding) {
    x = window.innerWidth - padding;
    wanderAngle =
      Math.PI / 2 + Math.random() * Math.PI;
    vx = -Math.abs(vx);
  }

  if (y < padding) {
    y = padding;
    wanderAngle = Math.random() * Math.PI;
    vy = Math.abs(vy);
  }

  if (y > window.innerHeight - padding) {
    y = window.innerHeight - padding;
    wanderAngle =
      Math.PI + Math.random() * Math.PI;
    vy = -Math.abs(vy);
  }


  // 생쥐 표시
  const flip = vx < 0 ? -1 : 1;

  const bounce =
    Math.sin(performance.now() / 90) *
    Math.min(
      2,
      Math.abs(vx) + Math.abs(vy)
    );

  mouse.style.opacity = '1';
  mouse.style.zIndex = '999999';
  mouse.style.pointerEvents = 'auto';

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
   6. 프로필 사진 후광 효과
   ========================= */
/* =========================
   6. 프로필 오로라 + 시선 추적
   ========================= */

// 현재 오로라 상태도 새로고침 후 유지
const PROFILE_AURA_STORAGE_KEY =
  'my-uportfolio-profile-aura-enabled';

let profileAuraEnabled = true;

try {
  const savedAuraState =
    localStorage.getItem(PROFILE_AURA_STORAGE_KEY);

  if (savedAuraState !== null) {
    profileAuraEnabled = savedAuraState !== 'false';
  }
} catch (e) {}

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

      try {
        localStorage.setItem(
          PROFILE_AURA_STORAGE_KEY,
          String(profileAuraEnabled)
        );
      } catch (e) {}


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
   7. 전체 페이지 테마 변경 🎨
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
    /* 파스텔 퍼플 */
    --my-bg: #fbf8ff;
    --my-card: #ffffff;
    --my-card-2: #f6efff;

    --my-text: #4a4055;
    --my-subtext: #887b95;

    --my-border: #eadcf5;

    --my-accent: #d7bce8;
    --my-accent-2: #e4cef2;

    --my-soft: #f0e4f8;

    --my-shadow:
      0 4px 20px rgba(215,188,232,.24);

    --nav-bg-1: #d7bce8;
    --nav-bg-2: #e4cef2;

    --nav-text: #4a4055;
    --nav-hover: rgba(255,255,255,.30);

    --nav-sub-bg: #ffffff;
    --nav-sub-text: #4a4055;
    --nav-sub-hover: #f6efff;
  }


  /* =========================
     핑크
     ========================= */

  html[data-my-theme="pink"] {
    /* 파스텔 핑크: RGB(255, 200, 240) = #FFC8F0 */
    --my-bg: #fff8fd;
    --my-card: #ffffff;
    --my-card-2: #fff1fa;

    --my-text: #4b3545;
    --my-subtext: #8a7182;

    --my-border: #f6ddec;

    --my-accent: rgb(255, 200, 240);
    --my-accent-2: #ffd9f3;

    --my-soft: #ffe8f8;

    --my-shadow:
      0 4px 20px rgba(255,200,240,.24);

    --nav-bg-1: rgb(255, 200, 240);
    --nav-bg-2: #ffd9f3;

    --nav-text: #4b3545;
    --nav-hover: rgba(255,255,255,.30);

    --nav-sub-bg: #ffffff;
    --nav-sub-text: #4b3545;
    --nav-sub-hover: #fff1fa;
  }


  /* =========================
     민트
     ========================= */

  html[data-my-theme="mint"] {
    /* 파스텔 민트 */
    --my-bg: #f7fcfa;
    --my-card: #ffffff;
    --my-card-2: #eef9f5;

    --my-text: #344b45;
    --my-subtext: #748b84;

    --my-border: #d8eee7;

    --my-accent: #b8e3d6;
    --my-accent-2: #cceee4;

    --my-soft: #e2f5ef;

    --my-shadow:
      0 4px 20px rgba(184,227,214,.26);

    --nav-bg-1: #b8e3d6;
    --nav-bg-2: #cceee4;

    --nav-text: #344b45;
    --nav-hover: rgba(255,255,255,.32);

    --nav-sub-bg: #ffffff;
    --nav-sub-text: #344b45;
    --nav-sub-hover: #eef9f5;
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

    width: 210px;

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


  #my-theme-custom-wrap {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 42px 1fr;
    gap: 7px;
    align-items: center;
    padding-top: 3px;
  }

  #my-theme-color-input {
    width: 42px;
    height: 34px;
    padding: 2px !important;
    border: 1px solid var(--my-border) !important;
    border-radius: 8px;
    background: var(--my-card-2) !important;
    cursor: pointer;
  }

  #my-custom-theme-apply,
  .my-theme-wide-action {
    border: 1px solid var(--my-border);
    border-radius: 9px;
    padding: 8px 5px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    background: var(--my-card-2);
    color: var(--my-text);
  }

  .my-theme-wide-action {
    grid-column: 1 / -1;
  }

  /* =========================
     프로필 카드 세로 공간 확장
     D-Day / 이름 / 응원문구가 아래에서 잘리지 않게 함
     ========================= */

  .main-profile,
  .main-profile .card-body,
  .main-profile .card-content {
    height: auto !important;
    overflow: visible !important;
  }

  .main-profile .card-body {
    min-height: 390px !important;
    padding-bottom: 22px !important;
  }

  .main-profile .card-content {
    min-height: 350px !important;
    padding-bottom: 20px !important;
    box-sizing: border-box !important;
  }

  #my-dday {
    border-color: var(--my-border) !important;
    background: var(--my-card-2) !important;
    color: var(--my-text) !important;
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
  },

  {
    id: 'custom',
    name: '나만의 색',
    icon: '🎨'
  }

];


/* =========================
   나만의 테마 색상
   ========================= */

const CUSTOM_THEME_COLOR_STORAGE_KEY =
  'my-uportfolio-custom-theme-color';

const CUSTOM_THEME_VARIABLES = [
  '--my-bg',
  '--my-card',
  '--my-card-2',
  '--my-text',
  '--my-subtext',
  '--my-border',
  '--my-accent',
  '--my-accent-2',
  '--my-soft',
  '--my-shadow',
  '--nav-bg-1',
  '--nav-bg-2',
  '--nav-text',
  '--nav-hover',
  '--nav-sub-bg',
  '--nav-sub-text',
  '--nav-sub-hover'
];

function normalizeHexColor(value) {
  const text = String(value || '').trim();

  if (/^#[0-9a-f]{6}$/i.test(text)) {
    return text.toLowerCase();
  }

  return '#7c3aed';
}

function hexToRgb(hex) {
  const clean = normalizeHexColor(hex).slice(1);

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbToHex(r, g, b) {
  const part = value =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, '0');

  return `#${part(r)}${part(g)}${part(b)}`;
}

function mixHex(colorA, colorB, amountToB) {
  const a = hexToRgb(colorA);
  const b = hexToRgb(colorB);
  const p = Math.max(0, Math.min(1, amountToB));

  return rgbToHex(
    a.r + (b.r - a.r) * p,
    a.g + (b.g - a.g) * p,
    a.b + (b.b - a.b) * p
  );
}

function getSavedCustomThemeColor() {
  try {
    return normalizeHexColor(
      localStorage.getItem(CUSTOM_THEME_COLOR_STORAGE_KEY) ||
      '#7c3aed'
    );
  } catch (e) {
    return '#7c3aed';
  }
}

function clearCustomThemeVariables() {
  CUSTOM_THEME_VARIABLES.forEach(name => {
    document.documentElement.style.removeProperty(name);
  });
}

function applyCustomThemeVariables(color) {
  const accent = normalizeHexColor(color);
  const rgb = hexToRgb(accent);
  const rootStyle = document.documentElement.style;

  rootStyle.setProperty('--my-bg', mixHex(accent, '#ffffff', .93));
  rootStyle.setProperty('--my-card', '#ffffff');
  rootStyle.setProperty('--my-card-2', mixHex(accent, '#ffffff', .96));
  rootStyle.setProperty('--my-text', '#293748');
  rootStyle.setProperty('--my-subtext', '#718096');
  rootStyle.setProperty('--my-border', mixHex(accent, '#ffffff', .78));
  rootStyle.setProperty('--my-accent', accent);
  rootStyle.setProperty('--my-accent-2', mixHex(accent, '#ffffff', .24));
  rootStyle.setProperty('--my-soft', mixHex(accent, '#ffffff', .86));
  rootStyle.setProperty(
    '--my-shadow',
    `0 4px 20px rgba(${rgb.r},${rgb.g},${rgb.b},.10)`
  );
  rootStyle.setProperty('--nav-bg-1', mixHex(accent, '#000000', .14));
  rootStyle.setProperty('--nav-bg-2', mixHex(accent, '#ffffff', .18));
  rootStyle.setProperty('--nav-text', '#ffffff');
  rootStyle.setProperty('--nav-hover', 'rgba(255,255,255,.14)');
  rootStyle.setProperty('--nav-sub-bg', '#ffffff');
  rootStyle.setProperty('--nav-sub-text', '#293748');
  rootStyle.setProperty('--nav-sub-hover', mixHex(accent, '#ffffff', .90));
}


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


  if (theme === 'custom') {
    applyCustomThemeVariables(
      getSavedCustomThemeColor()
    );
  } else {
    clearCustomThemeVariables();
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


/* =========================
   나만의 색 선택기
   ========================= */

const customThemeWrap = document.createElement('div');
customThemeWrap.id = 'my-theme-custom-wrap';

const customThemeColorInput = document.createElement('input');
customThemeColorInput.id = 'my-theme-color-input';
customThemeColorInput.type = 'color';
customThemeColorInput.value = getSavedCustomThemeColor();
customThemeColorInput.title = '나만의 테마 색상';

const customThemeApplyButton = document.createElement('button');
customThemeApplyButton.id = 'my-custom-theme-apply';
customThemeApplyButton.type = 'button';
customThemeApplyButton.textContent = '이 색으로 적용';

customThemeWrap.append(
  customThemeColorInput,
  customThemeApplyButton
);

themePanel.appendChild(customThemeWrap);

function saveAndApplyCustomColor() {
  const color = normalizeHexColor(
    customThemeColorInput.value
  );

  try {
    localStorage.setItem(
      CUSTOM_THEME_COLOR_STORAGE_KEY,
      color
    );
  } catch (e) {}

  applyMyTheme('custom');
}

customThemeColorInput.addEventListener('input', e => {
  e.stopPropagation();

  const color = normalizeHexColor(
    customThemeColorInput.value
  );

  try {
    localStorage.setItem(
      CUSTOM_THEME_COLOR_STORAGE_KEY,
      color
    );
  } catch (e) {}

  if (
    document.documentElement.getAttribute('data-my-theme') ===
    'custom'
  ) {
    applyCustomThemeVariables(color);
  }
});

customThemeApplyButton.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  saveAndApplyCustomColor();
  themePanel.classList.remove('open');
});


/* =========================
   숨긴 생쥐 다시 부르기
   ========================= */

const restoreMouseButton = document.createElement('button');
restoreMouseButton.type = 'button';
restoreMouseButton.className = 'my-theme-wide-action';
restoreMouseButton.textContent = '🐭 생쥐 다시 부르기';

restoreMouseButton.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  showMouseAgain();
  themePanel.classList.remove('open');
});

themePanel.appendChild(restoreMouseButton);



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
