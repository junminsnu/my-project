
(() => {
  if (document.querySelector('#my-shortcuts')) return;

  const links = [
    ['🚀 최종 자료', '/st/clinical-training/final-ref'],
    ['📅 일정', '/st/clinical-training/practice-guide'],
    ['📚 지침', '/st/clinical/notice/list'],
    ['👤 내 정보', '/st/my/profile']
  ];

  const box = document.createElement('div');
  box.id = 'my-shortcuts';

  Object.assign(box.style, {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    zIndex: '99999',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  });

  links.forEach(([text, href]) => {
    const a = document.createElement('a');

    a.href = href;
    a.textContent = text;

    Object.assign(a.style, {
      padding: '12px 20px',
      borderRadius: '14px',
      background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
      color: '#fff',
      textDecoration: 'none',
      fontWeight: '700',
      boxShadow: '0 4px 15px #0003'
    });

    box.appendChild(a);
  });

  document.body.appendChild(box);
})();
