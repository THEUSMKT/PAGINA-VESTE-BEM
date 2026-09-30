/* ==========================================================================
   Veste Bem Moda Homem — interações e animações
   GSAP 3 + ScrollTrigger + Lenis vêm por CDN. Sem eles o site continua
   inteiro e legível: só as animações deixam de rodar.
   ========================================================================== */

/* Depoimentos de exemplo: com true, cada card mostra o selo "EXEMPLO".
   Quando os depoimentos reais estiverem no index.html, troque para false. */
const MODO_DEMO = true;

(function () {
  'use strict';

  const root = document.documentElement;
  const $ = (seletor, contexto = document) => contexto.querySelector(seletor);
  const $$ = (seletor, contexto = document) => Array.from(contexto.querySelectorAll(seletor));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const desktop = window.matchMedia('(min-width: 1024px)');

  const temGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const animar = temGSAP && root.classList.contains('js');

  // Confirma para o script do <head> que o JS assumiu; sem GSAP, nada fica escondido.
  root.classList.add('is-ready');
  if (!animar) {
    root.classList.remove('js');
    root.classList.add('no-js');
  }

  let lenis = null;
  let menuAberto = false;

  /* ------------------------------------------------------------------------
     Selo "EXEMPLO" dos depoimentos
     ------------------------------------------------------------------------ */
  if (!MODO_DEMO) $$('[data-demo-badge]').forEach((selo) => selo.remove());

  /* ------------------------------------------------------------------------
     Indicador "aberto agora" — sempre pelo fuso de São Paulo
     ------------------------------------------------------------------------ */
  const HORARIOS = { // minutos desde 00h; domingo (0) fechado
    1: [540, 1110], 2: [540, 1110], 3: [540, 1110], 4: [540, 1110], 5: [540, 1110],
    6: [540, 1020],
  };
  const NOMES_DIA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const DIAS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const relogioSP = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });

  function agoraEmSaoPaulo() {
    const partes = {};
    relogioSP.formatToParts(new Date()).forEach((parte) => { partes[parte.type] = parte.value; });
    return {
      dia: DIAS_EN.indexOf(partes.weekday),
      minutos: (Number(partes.hour) % 24) * 60 + Number(partes.minute),
    };
  }

  function atualizarStatusDaLoja() {
    const status = $('[data-open-status]');
    if (!status) return;
    const { dia, minutos } = agoraEmSaoPaulo();
    const hoje = HORARIOS[dia];
    const aberto = Boolean(hoje) && minutos >= hoje[0] && minutos < hoje[1];
    let texto = 'Aberto agora';
    if (!aberto) {
      let quando = 'hoje';
      if (!hoje || minutos >= hoje[0]) {
        let proximo = dia;
        do { proximo = (proximo + 1) % 7; } while (!HORARIOS[proximo]);
        quando = NOMES_DIA[proximo];
      }
      texto = `Fechado · abre ${quando} às 09h`;
    }
    $('.open-status__text', status).textContent = texto;
    status.classList.toggle('is-closed', !aberto);
    status.hidden = false;
    $$('.hours li').forEach((linha) => {
      linha.classList.toggle('is-today', linha.dataset.days.split(' ').includes(String(dia)));
    });
  }
  atualizarStatusDaLoja();
  window.setInterval(atualizarStatusDaLoja, 60000);

  /* ------------------------------------------------------------------------
     Header compacto, barra de progresso, dock e barra fixa do mobile
     ------------------------------------------------------------------------ */
  const header = $('.site-header');
  const barraProgresso = $('.progress__bar');
  const dock = $('.dock');
  const barraMobile = $('.mobile-bar');
  let visiteNaTela = false;
  let quadroScroll = 0;

  function atualizarScroll() {
    quadroScroll = 0;
    const y = window.scrollY;
    const maximo = root.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 80);
    barraProgresso.style.transform = `scaleX(${maximo > 0 ? Math.min(y / maximo, 1) : 0})`;
    const mostrar = y > 600;
    dock.classList.toggle('is-visible', mostrar);
    barraMobile.classList.toggle('is-visible', mostrar && !visiteNaTela && !menuAberto);
  }
  function agendarScroll() {
    if (!quadroScroll) quadroScroll = window.requestAnimationFrame(atualizarScroll);
  }
  window.addEventListener('scroll', agendarScroll, { passive: true });
  window.addEventListener('resize', agendarScroll);
  atualizarScroll();

  // Na seção Visite os próprios CTAs cumprem o papel da barra fixa.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entrada]) => {
      visiteNaTela = entrada.isIntersecting;
      atualizarScroll();
    }, { threshold: 0.15 }).observe($('#visite'));
  }

  /* ------------------------------------------------------------------------
     Menu mobile — cortina, foco preso, Esc fecha
     ------------------------------------------------------------------------ */
  const botaoMenu = $('.menu-toggle');
  const menu = $('#menu');

  function abrirMenu() {
    menuAberto = true;
    menu.removeAttribute('inert');
    menu.classList.add('is-open');
    root.classList.add('menu-open');
    botaoMenu.setAttribute('aria-expanded', 'true');
    botaoMenu.setAttribute('aria-label', 'Fechar menu');
    if (lenis) lenis.stop();
    atualizarScroll();
    $('a', menu).focus({ preventScroll: true });
  }

  function fecharMenu(devolverFoco) {
    if (!menuAberto) return;
    menuAberto = false;
    menu.classList.remove('is-open');
    menu.setAttribute('inert', '');
    root.classList.remove('menu-open');
    botaoMenu.setAttribute('aria-expanded', 'false');
    botaoMenu.setAttribute('aria-label', 'Abrir menu');
    if (lenis) lenis.start();
    atualizarScroll();
    if (devolverFoco) botaoMenu.focus();
  }

  botaoMenu.addEventListener('click', () => (menuAberto ? fecharMenu(true) : abrirMenu()));

  document.addEventListener('keydown', (evento) => {
    if (!menuAberto) return;
    if (evento.key === 'Escape') {
      evento.preventDefault();
      fecharMenu(true);
      return;
    }
    if (evento.key !== 'Tab') return;
    const focaveis = [botaoMenu, ...$$('a[href], button:not([disabled])', menu)];
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  });

  desktop.addEventListener('change', (consulta) => { if (consulta.matches) fecharMenu(false); });

  /* ------------------------------------------------------------------------
     Links internos — rolagem suave (Lenis quando ativo) e foco no destino
     ------------------------------------------------------------------------ */
  function rolarAte(alvo) {
    if (lenis) {
      lenis.scrollTo(alvo, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    } else {
      alvo.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }
  }

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (evento) => {
      const id = link.getAttribute('href').slice(1);
      const alvo = id && document.getElementById(id);
      if (!alvo) return;
      evento.preventDefault();
      fecharMenu(false);
      rolarAte(alvo);
      if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1');
      alvo.focus({ preventScroll: true });
    });
  });

  /* ------------------------------------------------------------------------
     Galeria de trajes — card ativo, dots, teclado e arraste
     (carrossel nativo por padrão; trilha presa pelo GSAP acima de 900px)
     ------------------------------------------------------------------------ */
  const secaoTrajes = $('#trajes');
  const viewport = $('.trajes__viewport');
  const trilha = $('.trajes__track');
  const cards = $$('.traje');
  const pontos = $$('.trajes__dot');
  const contador = $('.trajes__current');
  let indiceAtivo = 0;
  let galeriaPresa = null; // { st, distancia } enquanto o pin estiver ativo

  function definirAtivo(indice) {
    if (indice === indiceAtivo) return;
    indiceAtivo = indice;
    cards.forEach((card, i) => card.classList.toggle('is-active', i === indice));
    pontos.forEach((ponto, i) => {
      ponto.classList.toggle('is-active', i === indice);
      if (i === indice) ponto.setAttribute('aria-current', 'true');
      else ponto.removeAttribute('aria-current');
    });
    contador.textContent = String(indice + 1).padStart(2, '0');
    if (animar && !reduceMotion.matches) {
      window.gsap.fromTo(contador, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out', overwrite: true });
    }
  }

  const centroDoCard = (card) => card.offsetLeft + card.offsetWidth / 2;

  function mostrarCard(indice) {
    const card = cards[Math.max(0, Math.min(cards.length - 1, indice))];
    const suave = reduceMotion.matches ? 'auto' : 'smooth';
    if (galeriaPresa) {
      const { st, distancia } = galeriaPresa;
      const x = Math.max(0, Math.min(distancia(), centroDoCard(card) - window.innerWidth / 2));
      if (lenis) lenis.scrollTo(st.start + x, { duration: 1.1 });
      else window.scrollTo({ top: st.start + x, behavior: suave });
    } else {
      viewport.scrollTo({ left: centroDoCard(card) - viewport.clientWidth / 2, behavior: suave });
    }
  }

  pontos.forEach((ponto, i) => ponto.addEventListener('click', () => mostrarCard(i)));

  viewport.addEventListener('keydown', (evento) => {
    const destinos = { ArrowRight: indiceAtivo + 1, ArrowLeft: indiceAtivo - 1, Home: 0, End: cards.length - 1 };
    if (!(evento.key in destinos)) return;
    evento.preventDefault();
    mostrarCard(destinos[evento.key]);
  });

  let quadroGaleria = 0;
  viewport.addEventListener('scroll', () => {
    if (galeriaPresa || quadroGaleria) return;
    quadroGaleria = window.requestAnimationFrame(() => {
      quadroGaleria = 0;
      const centro = viewport.scrollLeft + viewport.clientWidth / 2;
      let maisPerto = 0;
      let menorDistancia = Infinity;
      cards.forEach((card, i) => {
        const distancia = Math.abs(centroDoCard(card) - centro);
        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          maisPerto = i;
        }
      });
      definirAtivo(maisPerto);
    });
  }, { passive: true });

  // Arraste: na trilha presa move a rolagem da página; no carrossel, o scroll lateral (só mouse — o toque já é nativo).
  let arrasto = null;
  viewport.addEventListener('dragstart', (evento) => evento.preventDefault());
  viewport.addEventListener('pointerdown', (evento) => {
    if (evento.button !== 0) return;
    if (!galeriaPresa && (evento.pointerType !== 'mouse' || reduceMotion.matches)) return;
    arrasto = {
      id: evento.pointerId,
      x: evento.clientX,
      inicio: galeriaPresa ? (lenis ? lenis.targetScroll : window.scrollY) : viewport.scrollLeft,
      moveu: false,
    };
  });
  viewport.addEventListener('pointermove', (evento) => {
    if (!arrasto || evento.pointerId !== arrasto.id) return;
    const dx = evento.clientX - arrasto.x;
    if (!arrasto.moveu) {
      if (Math.abs(dx) < 5) return;
      arrasto.moveu = true;
      viewport.setPointerCapture(evento.pointerId);
      viewport.classList.add('is-dragging');
    }
    if (galeriaPresa) {
      const { st } = galeriaPresa;
      const y = Math.max(st.start, Math.min(st.end, arrasto.inicio - dx));
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    } else {
      viewport.scrollLeft = arrasto.inicio - dx;
    }
  });
  const soltar = (evento) => {
    if (!arrasto || evento.pointerId !== arrasto.id) return;
    arrasto = null;
    viewport.classList.remove('is-dragging');
  };
  viewport.addEventListener('pointerup', soltar);
  viewport.addEventListener('pointercancel', soltar);

  /* ========================================================================
     Daqui para baixo, só com GSAP carregado
     ======================================================================== */
  if (!animar) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------------
     Smooth scroll (Lenis) — só com mouse e sem reduced-motion
     ------------------------------------------------------------------------ */
  if (!reduceMotion.matches && finePointer.matches && typeof window.Lenis === 'function') {
    // syncTouch: false é o antigo smoothTouch: false — no toque, rolagem nativa.
    lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 1, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((tempo) => lenis.raf(tempo * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ------------------------------------------------------------------------
     Tela de entrada + animação do hero
     ------------------------------------------------------------------------ */
  const preloader = $('.preloader');
  const heroImg = $('.hero__img');

  function sairDoPreloader() {
    return new Promise((pronto) => {
      if (!preloader || reduceMotion.matches) {
        if (preloader) preloader.remove();
        pronto();
        return;
      }
      preloader.style.animation = 'none'; // desliga a salvaguarda do CSS: o JS assumiu
      const TETO = 1600; // ms desde o início da navegação — nunca prender o usuário
      const restante = Math.max(0, TETO - performance.now());

      gsap.fromTo('.preloader__logo', { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power3.out' });
      const fio = gsap.fromTo('.preloader__fill', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' });

      const fioCompleto = new Promise((resolver) => fio.eventCallback('onComplete', resolver));
      const fontes = document.fonts ? document.fonts.ready : Promise.resolve();
      const imagem = heroImg.complete ? Promise.resolve() : new Promise((resolver) => {
        heroImg.addEventListener('load', resolver, { once: true });
        heroImg.addEventListener('error', resolver, { once: true });
      });
      const teto = new Promise((resolver) => window.setTimeout(resolver, restante));

      Promise.race([Promise.all([fioCompleto, fontes, imagem]), teto]).then(() => {
        preloader.style.pointerEvents = 'none';
        gsap.fromTo(preloader,
          { clipPath: 'inset(0% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'power2.inOut', onComplete: () => preloader.remove() });
        window.setTimeout(pronto, 200);
      });
    });
  }

  function animarHero() {
    if (reduceMotion.matches) {
      gsap.to(['.hero__img', '.hero__eyebrow', '.hero__title .line', '.hero__text', '.hero__actions', '.scroll-cue__label'], { opacity: 1, duration: 0.2 });
      return;
    }
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .fromTo(heroImg, { scale: 1.12, opacity: 0 }, { scale: 1.08, opacity: 1, duration: 1.6 }, 0)
      .to(heroImg, { scale: 1, duration: 14, ease: 'power2.out' }, 1.6) // Ken Burns lento, uma vez
      .fromTo('.hero__eyebrow', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 0.3)
      .fromTo('.hero__title .line',
        { clipPath: 'inset(100% 0% 0% 0%)', y: 40 },
        {
          clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.2, stagger: 0.12,
          // sem o recorte no fim, acentos e descendentes do Cormorant não ficam cortados
          onComplete: () => gsap.set('.hero__title .line', { clipPath: 'none' }),
        }, 0.45)
      .fromTo(['.hero__text', '.hero__actions'], { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.95)
      .fromTo('.scroll-cue__line', { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'power2.inOut' }, 1.3)
      .fromTo('.scroll-cue__label', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.5)
      .to('.scroll-cue__label', { opacity: 0.35, duration: 1.4, ease: 'power2.inOut', repeat: -1, yoyo: true }, 2.3);
  }

  sairDoPreloader().then(animarHero);

  /* ------------------------------------------------------------------------
     Blocos responsivos (gsap.matchMedia desfaz tudo ao mudar a condição)
     ------------------------------------------------------------------------ */
  const MOVIMENTO = '(prefers-reduced-motion: no-preference)';
  const mm = gsap.matchMedia();

  // A trilha presa vem primeiro: o espaço do pin altera a posição de tudo abaixo.
  mm.add(`${MOVIMENTO} and (min-width: 900px)`, prenderGaleria);
  mm.add('(prefers-reduced-motion: reduce)', revelarSemMovimento);
  mm.add(MOVIMENTO, () => {
    revelar();
    desenharPassos();
    parallaxGeral();
    const limparContadores = contadores();
    const limparMarquee = marquee();
    return () => {
      limparContadores();
      limparMarquee();
    };
  });
  mm.add(`${MOVIMENTO} and (min-width: 768px)`, iconesFlutuantes);
  mm.add([
    `${MOVIMENTO} and (max-width: 1023px)`,
    `${MOVIMENTO} and (hover: none)`,
    `${MOVIMENTO} and (pointer: coarse)`,
  ].join(', '), () => parallax('.ocasioes__bg', { yPercent: -8 }, { yPercent: 8 }, '.ocasioes'));
  mm.add(`${MOVIMENTO} and (min-width: 1024px) and (hover: hover) and (pointer: fine)`, () => {
    const limpezas = [ativarCursor(), ativarMagneticos(), ativarHolofote()];
    return () => limpezas.forEach((limpar) => limpar());
  });

  // Sublinhado do item de navegação da seção visível
  $$('.site-nav a').forEach((link) => {
    ScrollTrigger.create({
      trigger: document.getElementById(link.hash.slice(1)),
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (st) => link.classList.toggle('is-current', st.isActive),
    });
  });

  /* ---------------- Revelações ---------------- */
  function revelar() {
    const entrada = { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' };

    $$('[data-reveal]').forEach((bloco) => {
      gsap.fromTo(bloco, { opacity: 0, y: 34 }, { ...entrada, scrollTrigger: { trigger: bloco, start: 'top 82%', once: true } });
    });

    $$('[data-reveal-stagger]').forEach((grupo) => {
      gsap.fromTo(grupo.children, { opacity: 0, y: 34 }, { ...entrada, stagger: 0.1, scrollTrigger: { trigger: grupo, start: 'top 82%', once: true } });
    });

    $$('[data-lines]').forEach((titulo) => {
      gsap.fromTo($$('.line', titulo), { y: 0, yPercent: 100 }, {
        y: 0, yPercent: 0, duration: 1.1, ease: 'power3.out', stagger: 0.09,
        scrollTrigger: { trigger: titulo, start: 'top 85%', once: true },
      });
    });

    // Imagem: máscara abrindo + escala caindo ao mesmo tempo
    $$('[data-reveal-img]').forEach((moldura) => {
      const deBaixo = moldura.dataset.revealImg === 'up';
      gsap.timeline({
        scrollTrigger: { trigger: moldura, start: 'top 82%', once: true },
        defaults: { duration: deBaixo ? 1.1 : 1.2, ease: 'power3.out' },
      })
        .fromTo(moldura,
          { clipPath: deBaixo ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
        .fromTo($('img', moldura), { scale: deBaixo ? 1.15 : 1.18 }, { scale: 1 }, 0);
    });

    gsap.fromTo('.quote',
      { opacity: 0, y: 34, rotateX: -8, transformPerspective: 900, transformOrigin: '50% 0%' },
      { opacity: 1, y: 0, rotateX: 0, duration: 1, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: '.quotes', start: 'top 82%', once: true } });

    $$('.occasion__icon').forEach((icone) => {
      gsap.fromTo(icone.children, { strokeDashoffset: 1 }, {
        strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.08,
        scrollTrigger: { trigger: icone, start: 'top 88%', once: true },
      });
    });

    gsap.fromTo('.manifesto__rule', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.manifesto__media', start: 'top 80%', end: 'bottom 55%', scrub: 1 },
    });
  }

  function revelarSemMovimento() {
    const fade = (alvos, gatilho) => gsap.to(alvos, {
      opacity: 1, duration: 0.2, scrollTrigger: { trigger: gatilho, start: 'top 92%', once: true },
    });
    $$('[data-reveal]').forEach((bloco) => fade(bloco, bloco));
    $$('[data-reveal-stagger]').forEach((grupo) => fade(grupo.children, grupo));
    $$('[data-lines]').forEach((titulo) => fade($$('.line', titulo), titulo));
    $$('[data-reveal-img]').forEach((moldura) => fade(moldura, moldura));
    fade('.quote', '.quotes');
    $$('.step').forEach((passo) => passo.classList.add('is-on'));
  }

  /* ---------------- Linha dourada do "Como funciona" ---------------- */
  function desenharPassos() {
    const passos = $$('.step');
    const acender = (progresso) => {
      const linha = $(desktop.matches ? '.steps__line--h' : '.steps__line--v').getBoundingClientRect();
      passos.forEach((passo) => {
        const marca = $('.step__marker', passo).getBoundingClientRect();
        const posicao = desktop.matches
          ? (marca.left + marca.width / 2 - linha.left) / linha.width
          : (marca.top + marca.height / 2 - linha.top) / linha.height;
        passo.classList.toggle('is-on', progresso >= posicao - 0.01);
      });
    };
    gsap.fromTo('.steps__line line', { strokeDashoffset: 1 }, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 60%', scrub: 1 },
      onUpdate() { acender(this.progress()); },
    });
  }

  /* ---------------- Parallax ---------------- */
  function parallax(alvo, de, para, gatilho, inicio = 'top bottom', fim = 'bottom top') {
    gsap.fromTo(alvo, de, {
      ...para,
      ease: 'none',
      scrollTrigger: {
        trigger: gatilho, start: inicio, end: fim, scrub: 1, invalidateOnRefresh: true,
        onToggle: (st) => gsap.set(alvo, { willChange: st.isActive ? 'transform' : 'auto' }),
      },
    });
  }

  function parallaxGeral() {
    const hero = $('.hero');
    parallax('.hero__media', { yPercent: 0 }, { yPercent: 18 }, hero, 'top top', 'bottom top');
    parallax('.hero__content', { y: 0, opacity: 1 }, { y: () => hero.offsetHeight * 0.08, opacity: 0 }, hero, 'top top', 'bottom top');
    parallax('.final__media', { yPercent: -8 }, { yPercent: 8 }, '.final');
  }

  /* ---------------- Números ---------------- */
  function contadores() {
    const itens = $$('[data-count]').map((el) => {
      const casas = Number(el.dataset.decimals || 0);
      const formato = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
      const valor = parseFloat(el.dataset.count);
      const estado = { v: 0 };
      el.textContent = formato.format(0);
      gsap.to(estado, {
        v: valor, duration: 1.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => { el.textContent = formato.format(estado.v); },
      });
      return () => { el.textContent = formato.format(valor); };
    });
    return () => itens.forEach((restaurar) => restaurar());
  }

  /* ---------------- Marquee ---------------- */
  function marquee() {
    const faixa = $('.marquee');
    const [frente, fundo] = $$('.marquee__track', faixa);
    const loops = [
      gsap.fromTo(frente, { xPercent: 0 }, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 }),
      gsap.fromTo(fundo, { xPercent: -50 }, { xPercent: 0, duration: 55, ease: 'none', repeat: -1 }),
    ];
    let base = 1;
    let impulso = 1;
    let espera = 0;
    const aplicar = () => loops.forEach((loop) => {
      gsap.to(loop, { timeScale: base * impulso, duration: 0.6, ease: 'power2.out', overwrite: true });
    });

    // Acelera de leve conforme a velocidade da rolagem
    ScrollTrigger.create({
      trigger: faixa,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (st) => {
        impulso = 1 + Math.min(Math.abs(st.getVelocity()) / 1500, 2.5);
        aplicar();
        window.clearTimeout(espera);
        espera = window.setTimeout(() => { impulso = 1; aplicar(); }, 180);
      },
    });

    const pausar = () => { base = 0; aplicar(); };
    const retomar = () => { base = 1; aplicar(); };
    faixa.addEventListener('mouseenter', pausar);
    faixa.addEventListener('mouseleave', retomar);
    return () => {
      window.clearTimeout(espera);
      faixa.removeEventListener('mouseenter', pausar);
      faixa.removeEventListener('mouseleave', retomar);
    };
  }

  /* ---------------- Galeria horizontal com pin ---------------- */
  function prenderGaleria() {
    secaoTrajes.classList.add('is-pinned');
    const imagens = cards.map((card) => $('.traje__img', card));
    const moverImagem = imagens.map((img) => gsap.quickSetter(img, 'x', 'px'));
    const distancia = () => Math.max(0, trilha.scrollWidth - window.innerWidth);
    let centros = [];

    const medir = () => { centros = cards.map(centroDoCard); };
    const atualizar = () => {
      const x = gsap.getProperty(trilha, 'x');
      const meio = window.innerWidth / 2;
      let maisPerto = 0;
      let menorDistancia = Infinity;
      centros.forEach((centro, i) => {
        const deslocamento = x + centro - meio;
        // Parallax interno: a foto anda no sentido oposto, a 12% da velocidade da trilha
        moverImagem[i](-deslocamento * 0.12);
        if (Math.abs(deslocamento) < menorDistancia) {
          menorDistancia = Math.abs(deslocamento);
          maisPerto = i;
        }
      });
      definirAtivo(maisPerto);
    };

    const tween = gsap.to(trilha, {
      x: () => -distancia(),
      ease: 'none',
      onUpdate: atualizar,
      scrollTrigger: {
        trigger: secaoTrajes,
        pin: true,
        scrub: 1,
        start: 'top top',
        end: () => `+=${distancia()}`,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        refreshPriority: 1,
        onRefresh: () => { medir(); atualizar(); },
      },
    });

    galeriaPresa = { st: tween.scrollTrigger, distancia };
    medir();
    atualizar();

    return () => {
      galeriaPresa = null;
      secaoTrajes.classList.remove('is-pinned');
      gsap.set(imagens, { clearProps: 'transform' });
    };
  }

  /* ---------------- Ícones flutuantes (deriva no CSS, parallax aqui) ---------------- */
  function iconesFlutuantes() {
    $$('.float').forEach((icone) => {
      const secao = icone.parentElement;
      const alcance = () => 0.15 * (secao.offsetHeight + window.innerHeight);
      gsap.fromTo(icone, { y: () => alcance() / 2 }, {
        y: () => -alcance() / 2,
        ease: 'none',
        scrollTrigger: { trigger: secao, start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true },
      });
    });
  }

  /* ---------------- Cursor customizado ---------------- */
  function ativarCursor() {
    const ponto = $('.cursor-dot');
    const anel = $('.cursor-ring');
    const rotulo = $('.cursor-ring__label');
    const alvo = { x: -100, y: -100 };
    const atual = { x: -100, y: -100 };
    let visivel = false;
    let estado = '';

    root.classList.add('has-cursor');
    const esconder = (sim) => {
      ponto.classList.toggle('is-hidden', sim);
      anel.classList.toggle('is-hidden', sim);
    };
    esconder(true);

    const mover = (evento) => {
      if (evento.pointerType === 'touch') return;
      alvo.x = evento.clientX;
      alvo.y = evento.clientY;
      if (!visivel) {
        visivel = true;
        atual.x = alvo.x;
        atual.y = alvo.y;
        esconder(false);
      }
      ponto.style.transform = `translate3d(${alvo.x}px, ${alvo.y}px, 0)`;
    };

    const seguir = () => {
      atual.x += (alvo.x - atual.x) * 0.14;
      atual.y += (alvo.y - atual.y) * 0.14;
      anel.style.transform = `translate3d(${atual.x}px, ${atual.y}px, 0)`;
    };

    const definirEstado = (novo, texto = '') => {
      if (novo === estado) return;
      estado = novo;
      anel.classList.remove('is-link', 'is-drag', 'is-image');
      if (novo) anel.classList.add(`is-${novo}`);
      rotulo.textContent = texto;
    };

    const sobre = (evento) => {
      const el = evento.target instanceof Element ? evento.target : null;
      if (!el) return;
      // O mapa é um iframe: o cursor nativo dele assume
      if (el.closest('.map')) {
        esconder(true);
        return;
      }
      if (visivel) esconder(false);
      if (galeriaPresa && el.closest('.trajes__viewport')) definirEstado('drag', 'Arraste');
      else if (el.closest('a, button')) definirEstado('link');
      else if (el.closest('.frame')) definirEstado('image', '+');
      else definirEstado('');
    };

    const sair = () => esconder(true);
    const entrar = () => { if (visivel) esconder(false); };

    window.addEventListener('pointermove', mover, { passive: true });
    document.addEventListener('pointerover', sobre);
    root.addEventListener('mouseleave', sair);
    root.addEventListener('mouseenter', entrar);
    gsap.ticker.add(seguir);

    return () => {
      root.classList.remove('has-cursor');
      window.removeEventListener('pointermove', mover);
      document.removeEventListener('pointerover', sobre);
      root.removeEventListener('mouseleave', sair);
      root.removeEventListener('mouseenter', entrar);
      gsap.ticker.remove(seguir);
    };
  }

  /* ---------------- Botões magnéticos ---------------- */
  function ativarMagneticos() {
    const RAIO = 90;
    const FORCA = 9;
    const itens = $$('[data-magnetic]').map((el) => ({
      el,
      x: gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' }),
      y: gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' }),
      ativo: false,
    }));
    let ultimo = null;
    let quadro = 0;

    const soltarItem = (item) => {
      if (!item.ativo) return;
      item.ativo = false;
      item.x(0);
      item.y(0);
    };

    const calcular = () => {
      quadro = 0;
      itens.forEach((item) => {
        const caixa = item.el.getBoundingClientRect();
        const alcanceX = caixa.width / 2 + RAIO;
        const alcanceY = caixa.height / 2 + RAIO;
        const dx = ultimo.clientX - (caixa.left + caixa.width / 2);
        const dy = ultimo.clientY - (caixa.top + caixa.height / 2);
        if (Math.abs(dx) < alcanceX && Math.abs(dy) < alcanceY) {
          item.ativo = true;
          item.x((dx / alcanceX) * FORCA);
          item.y((dy / alcanceY) * FORCA);
        } else {
          soltarItem(item);
        }
      });
    };

    const mover = (evento) => {
      ultimo = evento;
      if (!quadro) quadro = window.requestAnimationFrame(calcular);
    };
    const sair = () => itens.forEach(soltarItem);

    window.addEventListener('pointermove', mover, { passive: true });
    root.addEventListener('mouseleave', sair);
    return () => {
      window.removeEventListener('pointermove', mover);
      root.removeEventListener('mouseleave', sair);
      window.cancelAnimationFrame(quadro);
      gsap.set(itens.map((item) => item.el), { clearProps: 'transform' });
    };
  }

  /* ---------------- Holofote da seção Experiência ---------------- */
  function ativarHolofote() {
    const secao = $('#experiencia');
    const camada = $('.spotlight', secao);
    const feixe = $('.spotlight__beam', camada);
    const posicao = { x: 0, y: 0 };
    let ponteiro = null;

    const relativo = () => {
      const caixa = secao.getBoundingClientRect();
      return { x: ponteiro.clientX - caixa.left, y: ponteiro.clientY - caixa.top };
    };
    const entrar = (evento) => {
      ponteiro = evento;
      Object.assign(posicao, relativo());
      camada.classList.add('is-on');
    };
    const mover = (evento) => { ponteiro = evento; };
    const sair = () => {
      ponteiro = null;
      camada.classList.remove('is-on');
    };
    const seguir = () => {
      if (!ponteiro) return;
      const destino = relativo();
      posicao.x += (destino.x - posicao.x) * 0.08;
      posicao.y += (destino.y - posicao.y) * 0.08;
      feixe.style.setProperty('--mx', `${posicao.x}px`);
      feixe.style.setProperty('--my', `${posicao.y}px`);
    };

    secao.addEventListener('pointerenter', entrar);
    secao.addEventListener('pointermove', mover);
    secao.addEventListener('pointerleave', sair);
    gsap.ticker.add(seguir);
    return () => {
      sair();
      secao.removeEventListener('pointerenter', entrar);
      secao.removeEventListener('pointermove', mover);
      secao.removeEventListener('pointerleave', sair);
      gsap.ticker.remove(seguir);
    };
  }

  /* ------------------------------------------------------------------------
     Recalcular posições: no load, quando as fontes chegam e no resize (200ms)
     ------------------------------------------------------------------------ */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  let esperaResize = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(esperaResize);
    esperaResize = window.setTimeout(() => ScrollTrigger.refresh(), 200);
  });
})();
