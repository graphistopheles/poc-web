/* =========================================================================
   Interacciones por página: acordeones, calculadora, filtros, formularios
   ========================================================================= */
export function initPages({ gsap, ScrollTrigger, reduce }) {
  accordions(gsap);
  calculator(gsap);
  wikidocFilter(gsap, ScrollTrigger);
  forms(gsap);
  agentTabs(gsap);
}

function accordions(gsap) {
  document.querySelectorAll('[data-acc]').forEach((acc) => {
    acc.querySelectorAll('.acc__item').forEach((item) => {
      const btn = item.querySelector('.acc__btn');
      const panel = item.querySelector('.acc__panel');
      if (item.classList.contains('is-open')) gsap.set(panel, { height: 'auto' });
      btn.addEventListener('click', () => {
        const open = !item.classList.contains('is-open');
        acc.querySelectorAll('.acc__item.is-open').forEach((o) => {
          if (o === item) return;
          o.classList.remove('is-open');
          o.querySelector('.acc__btn').setAttribute('aria-expanded', 'false');
          gsap.to(o.querySelector('.acc__panel'), { height: 0, duration: 0.5, ease: 'expo.out' });
        });
        item.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
        gsap.to(panel, { height: open ? 'auto' : 0, duration: 0.6, ease: 'expo.out' });
      });
    });
  });
}

/* Calculadora de ausentismo (estimación referencial) */
function calculator(gsap) {
  const c = document.querySelector('[data-calc]');
  if (!c) return;
  const f = {
    people: c.querySelector('[name=people]'),
    salary: c.querySelector('[name=salary]'),
    days: c.querySelector('[name=days]'),
  };
  const out = {
    cost: c.querySelector('[data-out=cost]'),
    save: c.querySelector('[data-out=save]'),
    daysBack: c.querySelector('[data-out=days]'),
  };
  const lbl = {
    people: c.querySelector('[data-lbl=people]'),
    salary: c.querySelector('[data-lbl=salary]'),
    days: c.querySelector('[data-lbl=days]'),
  };
  const REDUCTION = 0.25; // supuesto referencial: -25% ausentismo de corta duración
  const WORKDAYS = 22;
  const clp = (n) => '$' + Math.round(n).toLocaleString('es-CL');
  const num = (n) => Math.round(n).toLocaleString('es-CL');
  const shown = { cost: 0, save: 0, days: 0 };

  function update() {
    const p = +f.people.value, s = +f.salary.value, d = +f.days.value;
    Object.entries(f).forEach(([k, el]) => {
      const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
      el.style.setProperty('--p', pct + '%');
    });
    lbl.people.textContent = num(p);
    lbl.salary.textContent = clp(s);
    lbl.days.textContent = d;
    const daily = s / WORKDAYS;
    const cost = p * d * daily;
    const target = { cost, save: cost * REDUCTION, days: p * d * REDUCTION };
    gsap.to(shown, {
      ...target, duration: 0.8, ease: 'power3.out', overwrite: true,
      onUpdate: () => {
        out.cost.textContent = clp(shown.cost);
        out.save.textContent = clp(shown.save);
        out.daysBack.textContent = num(shown.days);
      },
    });
  }
  Object.values(f).forEach((el) => el.addEventListener('input', update));
  update();
}

function wikidocFilter(gsap) {
  const bar = document.querySelector('[data-filter]');
  if (!bar) return;
  const cards = [...document.querySelectorAll('[data-cat]')];
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-f]');
    if (!b) return;
    bar.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const f = b.dataset.f;
    const show = cards.filter((c) => f === 'all' || c.dataset.cat === f);
    const hide = cards.filter((c) => !show.includes(c));
    gsap.to(hide, { opacity: 0, scale: 0.96, duration: 0.25, onComplete: () => hide.forEach((h) => (h.hidden = true)) });
    gsap.delayedCall(0.26, () => {
      show.forEach((s) => (s.hidden = false));
      gsap.fromTo(show, { opacity: 0, y: 24, scale: 1 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'expo.out' });
    });
  });
}

function forms(gsap) {
  document.querySelectorAll('[data-demo-form]').forEach((form) => {
    const err = form.querySelector('[data-form-error]');
    const done = form.parentElement.querySelector('[data-form-done]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let bad = null;
      form.querySelectorAll('[required]').forEach((el) => {
        const ok = el.type === 'checkbox' ? el.checked : el.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value) : !!el.value.trim();
        el.setAttribute('aria-invalid', String(!ok));
        if (!ok && !bad) bad = el;
      });
      if (bad) {
        err.textContent = bad.type === 'checkbox' ? 'Debes aceptar la política de privacidad.' : 'Revisa los campos marcados para continuar.';
        bad.focus();
        gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        return;
      }
      err.textContent = '';
      gsap.to(form, {
        opacity: 0, y: -16, duration: 0.4, ease: 'power2.in',
        onComplete: () => {
          form.hidden = true;
          done.hidden = false;
          gsap.from(done.children, { opacity: 0, y: 24, stagger: 0.08, duration: 0.8, ease: 'expo.out' });
        },
      });
    });
  });
}

/* Selector de agentes en /agentes-ia */
function agentTabs(gsap) {
  const root = document.querySelector('[data-agents]');
  if (!root) return;
  const tabs = [...root.querySelectorAll('[role=tab]')];
  const panels = [...root.querySelectorAll('[role=tabpanel]')];
  function select(i, focus = false) {
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
    panels.forEach((p, j) => {
      if (j === i) {
        p.hidden = false;
        gsap.fromTo(p.querySelectorAll('[data-anim]'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out' });
        gsap.fromTo(p.querySelector('.ag-detail__img'), { scale: 0.6, rotate: -12, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.6)' });
      } else p.hidden = true;
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
    });
  });
}
