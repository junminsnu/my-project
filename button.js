(() => {
  if (document.querySelector('#profile-shortcuts')) return;

  const links = [
    ['🚀 최종 자료', '/st/clinical-training/final-ref'],
    ['📅 일정', '/st/clinical-training/practice-guide'],
    ['📚 지침', '/st/clinical/notice/list'],
    ['👤 내 정보', '/st/my/profile']
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
      padding: '10px 8px',
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

    a.onmouseenter = () => a.style.transform = 'translateY(-2px)';
    a.onmouseleave = () => a.style.transform = '';

    box.appendChild(a);
  });

  const profile = document.querySelector('.main-profile');
  profile?.parentNode.insertBefore(box, profile);
})();
