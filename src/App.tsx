import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CreditCard,
  GraduationCap,
  LogIn,
  Menu,
  MonitorPlay,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { Course, SiteContent } from './lib/content';
import { createContactMessage, getPublishedCourses, getSiteContent } from './lib/content';
import { insforge, isInsforgeConfigured } from './lib/insforge';
import { formatClp, startCheckout } from './lib/payments';

type AuthMode = 'login' | 'register';

const navItems = [
  { label: 'Cursos disponibles', href: '#cursos' },
  { label: 'Aula Virtual', href: '#aula' },
  { label: 'Sobre nosotros', href: '#sobre-nosotros' },
  { label: 'Contacto', href: '#contacto' },
];

const sectionIds = navItems.map((item) => item.href.replace('#', ''));

function App() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeSection, setActiveSection] = useState(sectionIds[0]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authStatus, setAuthStatus] = useState('');
  const [contactStatus, setContactStatus] = useState('');
  const navRef = useRef<HTMLElement | null>(null);
  const navLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    async function load() {
      const [siteContent, publishedCourses] = await Promise.all([
        getSiteContent(),
        getPublishedCourses(),
      ]);
      setContent(siteContent);
      setCourses(publishedCourses);
      setActiveCourse(publishedCourses[0] ?? null);
    }

    void load();
  }, []);

  useEffect(() => {
    if (!content) return;

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    function syncActiveSection() {
      // Marker below the fixed header for stable "current section" detection.
      const marker = window.scrollY + 160;
      let current = sectionIds[0];

      sections.forEach((section) => {
        if (marker >= section.offsetTop) {
          current = section.id;
        }
      });

      setActiveSection((prev) => (prev === current ? prev : current));
    }

    syncActiveSection();
    window.addEventListener('scroll', syncActiveSection, { passive: true });
    window.addEventListener('resize', syncActiveSection);
    return () => {
      window.removeEventListener('scroll', syncActiveSection);
      window.removeEventListener('resize', syncActiveSection);
    };
  }, [content]);

  useLayoutEffect(() => {
    function updatePill() {
      const activeHref = `#${activeSection}`;
      const navElement = navRef.current;
      const activeLink = navLinkRefs.current[activeHref];

      if (!navElement || !activeLink) {
        const firstLink = navLinkRefs.current[navItems[0].href];
        if (!navElement || !firstLink) {
          setPillStyle((prev) => ({ ...prev, opacity: 0 }));
          return;
        }
        setPillStyle({
          left: firstLink.offsetLeft,
          width: firstLink.offsetWidth,
          opacity: 1,
        });
        return;
      }

      setPillStyle({
        left: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
        opacity: 1,
      });
    }

    updatePill();
    const frame = window.requestAnimationFrame(updatePill);
    window.addEventListener('resize', updatePill);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePill);
    };
  }, [activeSection, menuOpen, content]);

  const moodleUrl = useMemo(() => {
    if (!content) return '';
    const base = activeCourse?.moodleCourseUrl ?? content.moodleUrl;
    return base;
  }, [activeCourse, content]);

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthStatus('Procesando...');

    try {
      if (!insforge) {
        setAuthStatus('Configura InsForge para activar el inicio de sesion real.');
        return;
      }

      const { error } =
        authMode === 'login'
          ? await insforge.auth.signInWithPassword({
              email: authEmail,
              password: authPassword,
            })
          : await insforge.auth.signUp({
              email: authEmail,
              password: authPassword,
            });

      if (error) throw new Error(error.message ?? 'No fue posible autenticar.');
      setAuthStatus(authMode === 'login' ? 'Sesion iniciada.' : 'Cuenta creada.');
    } catch (error) {
      setAuthStatus(error instanceof Error ? error.message : 'Ocurrio un error.');
    }
  }

  async function handleContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setContactStatus('Enviando...');

    try {
      await createContactMessage({
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        phone: String(form.get('phone') ?? ''),
        message: String(form.get('message') ?? ''),
      });
      event.currentTarget.reset();
      setContactStatus('Mensaje recibido. Te contactaremos pronto.');
    } catch (error) {
      setContactStatus(error instanceof Error ? error.message : 'No se pudo enviar el mensaje.');
    }
  }

  if (!content) {
    return <main className="loading">Cargando plataforma...</main>;
  }

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label={content.brandName}>
          <img
            className="brand-logo"
            src={`${import.meta.env.BASE_URL}assets/VYRCAP_logo.png`}
            alt="Logo VYRCAP OTEC"
          />
          <span className="brand-name">VYRCAP - OTEC</span>
        </a>

        <button
          className="icon-button menu-button"
          type="button"
          aria-label="Abrir navegacion"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={menuOpen ? 'nav nav-open' : 'nav'} ref={navRef}>
          <span
            className="nav-pill"
            aria-hidden="true"
            style={{
              transform: `translateX(${pillStyle.left}px)`,
              width: `${pillStyle.width}px`,
              opacity: pillStyle.opacity,
            }}
          />
          {navItems.map((item) => (
            <a
              key={item.href}
              className={activeSection === item.href.replace('#', '') ? 'nav-link is-active' : 'nav-link'}
              href={item.href}
              onClick={() => {
                setActiveSection(item.href.replace('#', ''));
                setMenuOpen(false);
              }}
              ref={(element) => {
                navLinkRefs.current[item.href] = element;
              }}
            >
              {item.label}
            </a>
          ))}
          <button className="ghost-button auth-button" type="button" onClick={() => setAuthOpen(true)}>
            <LogIn size={18} />
            Iniciar sesion
          </button>
        </nav>
      </header>

      <main id="inicio">
        <section className="hero">
          <img src={`${import.meta.env.BASE_URL}assets/hero-training.png`} alt="" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <p>{content.eyebrow}</p>
            <h1>{content.heroTitle}</h1>
            <span>{content.heroBody}</span>
            <div className="hero-actions">
              <a className="primary-button" href="#cursos">
                {content.primaryCta}
                <ArrowRight size={18} />
              </a>
              <a className="secondary-button" href="#aula">
                {content.secondaryCta}
                <MonitorPlay size={18} />
              </a>
            </div>
          </div>
        </section>

        <section className="metrics" aria-label="Resumen">
          <div>
            <strong>{courses.length}</strong>
            <span>Cursos publicados</span>
          </div>
          <div>
            <strong>Moodle</strong>
            <span>Aula virtual embebible</span>
          </div>
          <div>
            <strong>MP</strong>
            <span>Pagos iniciales</span>
          </div>
        </section>

        <section className="brand-banner-section" aria-label="Identidad institucional">
          <div className="brand-banner-shell">
            <img
              src={`${import.meta.env.BASE_URL}assets/VYRCAP_banner.png`}
              alt="Banner institucional VYRCAP OTEC"
              loading="lazy"
            />
          </div>
        </section>

        <section className="section" id="cursos">
          <div className="section-heading">
            <p>Cursos disponibles</p>
            <h2>Oferta editable desde base de datos</h2>
          </div>

          <div className="course-grid">
            {courses.map((course) => (
              <article
                className={activeCourse?.id === course.id ? 'course-card active' : 'course-card'}
                key={course.id}
              >
                <div className="course-topline">
                  <span>{course.durationHours} horas</span>
                  <strong>{formatClp(course.priceClp)}</strong>
                </div>
                <h3>{course.title}</h3>
                <p>{course.shortDescription}</p>
                <div className="course-actions">
                  <button type="button" onClick={() => setActiveCourse(course)}>
                    <BookOpen size={17} />
                    Ver detalle
                  </button>
                  <button type="button" onClick={() => void startCheckout(course)}>
                    <CreditCard size={17} />
                    Pagar
                  </button>
                </div>
              </article>
            ))}
          </div>

          {activeCourse && (
            <article className="course-detail">
              <div>
                <p className="detail-label">Curso seleccionado</p>
                <h3>{activeCourse.title}</h3>
                <p>{activeCourse.description}</p>
                <h4>Objetivo</h4>
                <p>{activeCourse.objective}</p>
              </div>
              <div className="detail-list">
                <h4>Contenidos principales</h4>
                {activeCourse.contents.map((item) => (
                  <span key={item}>
                    <Check size={16} />
                    {item}
                  </span>
                ))}
                <h4>Dirigido a</h4>
                <p>{activeCourse.audience}</p>
                <h4>Modalidad</h4>
                <p>{activeCourse.modality}</p>
              </div>
            </article>
          )}
        </section>

        <section className="section split-section" id="aula">
          <div>
            <p className="section-kicker">Acceso a Aula Virtual</p>
            <h2>Moodle integrado al flujo de compra y matricula</h2>
            <p>
              El sitio queda preparado para abrir el aula en una vista embebida cuando la
              configuracion de Moodle lo permita, o dirigir al estudiante a una ventana segura.
            </p>
            <div className="integration-list">
              <span>
                <GraduationCap size={18} />
                Cursos vinculables por URL Moodle
              </span>
              <span>
                <ShieldCheck size={18} />
                Ordenes de pago trazables
              </span>
              <span>
                <LogIn size={18} />
                Login conectado a InsForge Auth
              </span>
            </div>
            <a className="primary-button compact" href={moodleUrl} target="_blank" rel="noreferrer">
              Abrir aula
              <ArrowRight size={18} />
            </a>
          </div>
          <div className="moodle-frame">
            <img
              src={`${import.meta.env.BASE_URL}assets/moodle-preview.png`}
              alt="Vista previa de aula virtual"
              loading="lazy"
            />
          </div>
        </section>

        <section className="section about-section" id="sobre-nosotros">
          <div className="section-heading">
            <p>Sobre nosotros</p>
            <h2>{content.aboutTitle}</h2>
          </div>
          <p>{content.aboutBody}</p>
        </section>

        <section className="section contact-section" id="contacto">
          <div>
            <p className="section-kicker">Contacto</p>
            <h2>Conversemos sobre el proximo curso</h2>
            <address>
              <span>{content.contactEmail}</span>
              <span>{content.contactPhone}</span>
              <span>{content.contactAddress}</span>
            </address>
          </div>
          <form className="contact-form" onSubmit={handleContactSubmit}>
            <label>
              Nombre
              <input name="name" autoComplete="name" required />
            </label>
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Telefono
              <input name="phone" autoComplete="tel" />
            </label>
            <label>
              Mensaje
              <textarea name="message" rows={5} required />
            </label>
            <button className="primary-button compact" type="submit">
              Enviar
              <ArrowRight size={18} />
            </button>
            {contactStatus && <p className="form-status">{contactStatus}</p>}
          </form>
        </section>
      </main>

      <footer>
        <span>VYRCAP - OTEC</span>
        <span>{isInsforgeConfigured ? 'InsForge conectado' : 'InsForge pendiente de variables'}</span>
      </footer>

      {authOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setAuthOpen(false)}>
          <section className="auth-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button
              className="icon-button close-button"
              type="button"
              aria-label="Cerrar"
              onClick={() => setAuthOpen(false)}
            >
              <X size={20} />
            </button>
            <h2>{authMode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}</h2>
            <form onSubmit={handleAuthSubmit}>
              <label>
                Email
                <input
                  type="email"
                  autoComplete="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  required
                />
              </label>
              <label>
                Contrasena
                <input
                  type="password"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  required
                />
              </label>
              <button className="primary-button compact" type="submit">
                <LogIn size={18} />
                Continuar
              </button>
            </form>
            <button
              className="text-button"
              type="button"
              onClick={() => setAuthMode((mode) => (mode === 'login' ? 'register' : 'login'))}
            >
              {authMode === 'login' ? 'Necesito crear una cuenta' : 'Ya tengo cuenta'}
            </button>
            {authStatus && <p className="form-status">{authStatus}</p>}
          </section>
        </div>
      )}
    </>
  );
}

export default App;
