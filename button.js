const a=document.createElement('a');

a.href='/st/clinical-training/final-ref';
a.textContent='최종평가 바로가기 →';

Object.assign(a.style,{
  display:'inline-block',
  padding:'14px 24px',
  background:'linear-gradient(135deg,#2563eb,#7c3aed)',
  color:'#fff',
  fontSize:'16px',
  fontWeight:'700',
  textDecoration:'none',
  borderRadius:'12px',
  boxShadow:'0 8px 20px #0003',
  transition:'.2s',
  margin:'10px'
});

a.onmouseenter=()=>a.style.transform='translateY(-3px) scale(1.04)';
a.onmouseleave=()=>a.style.transform='';

document.querySelector('[data-name="my_word"]')?.append(a);
