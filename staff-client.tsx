'use client';

import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, Utensils, PanelsTopLeft, CalendarDays, Search, Plus, RefreshCw, X, Check, Eye, EyeOff, Pencil, ExternalLink, LogOut, ChevronRight } from 'lucide-react';
import BannerManager from './banner-manager';
import PostManager from './post-manager';
import { categories, Item, money } from '@/lib/menu';
import type { Banner } from '@/lib/banners';
import type { PubPost } from '@/lib/posts';

type Tab = 'overview' | 'menu' | 'banners' | 'posts';
const tabs = [
  { id: 'overview' as Tab, name: 'Огляд', icon: LayoutDashboard },
  { id: 'menu' as Tab, name: 'Меню', icon: Utensils },
  { id: 'banners' as Tab, name: 'Рекламні банери', icon: PanelsTopLeft },
  { id: 'posts' as Tab, name: 'Акції та події', icon: CalendarDays },
];
const titles: Record<Tab, string> = { overview: 'Паб у твоїх руках.', menu: 'Керування меню', banners: 'Рекламні банери', posts: 'Акції та події' };
const descriptions: Record<Tab, string> = {
  overview: 'Страви, пропозиції та новини — в одному місці.',
  menu: 'Оновлюй ціни та склад. Вимикай позиції, які сьогодні закінчилися.',
  banners: 'Пропозиції у верхньому блоці меню гостей.',
  posts: 'Публікуй актуальні акції та анонси подій.',
};

export default function Staff({ email, name }: { email: string; name: string }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [items, setItems] = useState<Item[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [posts, setPosts] = useState<PubPost[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState<Item | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [filter, setFilter] = useState('all');
  const [updated, setUpdated] = useState<Date | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function read(url: string) {
    const response = await fetch(url);
    const data: any = await response.json();
    if (!response.ok) throw new Error(data.error || 'Не вдалося завантажити дані');
    return data;
  }

  async function load() {
    setRefreshing(true);
    try {
      const [menu, ads, news] = await Promise.all([
        read('/api/staff'), read('/api/banners?staff=1'), read('/api/posts?staff=1'),
      ]);
      setItems(menu.items);
      setBanners(ads.banners);
      setPosts(news.posts);
      setUpdated(new Date());
      setError('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const id = location.hash.slice(1);
    if (tabs.some(t => t.id === id)) setTab(id as Tab);
    void load();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!edit) return;
    const previous = document.activeElement as HTMLElement | null;
    const form = formRef.current;
    form?.querySelector<HTMLInputElement>('input')?.focus();
    function keyboard(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) setEdit(null);
      if (e.key !== 'Tab') return;
      const elements = form?.querySelectorAll<HTMLElement>('input:not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled)');
      if (!elements?.length) return;
      const first = elements[0], last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('keydown', keyboard); previous?.focus(); };
  }, [!!edit, busy]);

  function navigate(next: Tab) {
    setTab(next);
    history.replaceState(null, '', '/admin#' + next);
    setError('');
  }

  async function save(item: Item) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/staff', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'item', item: { ...item, hidden: !!item.hidden } }),
      });
      const data: any = await response.json();
      if (!response.ok) throw new Error(data.error);
      setItems(current => current.some(x => x.id === item.id)
        ? current.map(x => x.id === item.id ? item : x) : [...current, item]);
      setEdit(null);
      setUpdated(new Date());
      setNotice('Зміни збережено. Меню гостей оновлено.');
    } catch (e) {
      setError((e as Error).message);
    } finally { setBusy(false); }
  }

  function addItem() {
    setError('');
    setEdit({ id: 'custom-' + crypto.randomUUID(), name: '', about: '', volume: '', price: 100,
      category: category === 'all' ? categories[0] : category, available: true, hidden: false });
  }

  const listed = items.filter(x => !x.hidden);
  const unavailable = listed.filter(x => !x.available);
  const hidden = items.filter(x => x.hidden);
  const rows = items.filter(x => (category === 'all' || x.category === category)
    && (filter === 'all' || (filter === 'available' && x.available && !x.hidden)
      || (filter === 'unavailable' && !x.available && !x.hidden) || (filter === 'hidden' && x.hidden))
    && (x.name + ' ' + x.about).toLowerCase().includes(query.toLowerCase()));

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <a href="/admin" className="wordmark">БУНКЕР<span>ПАБ</span></a>
      <span className="admin-sidebar-label">КЕРУВАННЯ ПАБОМ</span>
      <nav aria-label="Розділи адмінки">{tabs.map(t => <button key={t.id} className={tab === t.id ? 'current' : ''} onClick={() => navigate(t.id)}>
        <t.icon size={19}/><span>{t.name}</span>{t.id === 'menu' && <small>{listed.length}</small>}
      </button>)}</nav>
      <div className="admin-sidebar-bottom">
        <a href="/" target="_blank" rel="noreferrer"><ExternalLink size={17}/>Меню гостей</a>
        <div className="admin-account"><div className="account-initial">{(name || email).slice(0,1).toUpperCase()}</div><div><strong>{name || 'Власник'}</strong><small>{email}</small></div></div>
        <a href="/admin/login" onClick={async e=>{e.preventDefault();const r=await fetch('/api/auth/logout',{method:'POST'});if(r.ok)window.location.href='/admin/login';}}><LogOut size={17}/>Вийти</a>
      </div>
    </aside>
    <main className="admin-main">
      <header className="admin-topline"><span>Панель адміністратора <ChevronRight size={14}/> {tabs.find(t => t.id === tab)?.name}</span><a href="/" target="_blank" rel="noreferrer">Переглянути сайт <ExternalLink size={15}/></a><a className="admin-mobile-signout" href="/admin/login" onClick={async e=>{e.preventDefault();const r=await fetch('/api/auth/logout',{method:'POST'});if(r.ok)window.location.href='/admin/login';}} aria-label="Вийти з адмінки"><LogOut size={17}/></a></header>
      <div className="admin-page-heading"><div><span className="eyebrow">БУНКЕР ПАБ / КЕРУВАННЯ</span><h1>{titles[tab]}</h1><p>{descriptions[tab]}</p></div><button className="secondary" disabled={refreshing || busy} onClick={load}><RefreshCw size={17} className={refreshing ? 'spin' : ''}/>{refreshing ? 'Оновлюємо…' : 'Оновити'}</button></div>
      {error && !edit && <div className="error-banner" role="alert">{error}<button onClick={load}>Спробувати ще раз</button></div>}
      {notice && <div className="admin-toast" role="status"><Check size={18}/>{notice}</div>}
      {loading ? <div className="admin-loading"><RefreshCw className="spin"/>Завантажуємо панель…</div> : <>
        {tab === 'overview' && <>
          <div className="admin-metrics">
            <button onClick={() => { setFilter('all'); navigate('menu'); }}><Utensils size={20}/><span>У меню гостей</span><strong>{listed.length}</strong><small>Позицій у {categories.length} категоріях</small></button>
            <button onClick={() => { setFilter('unavailable'); navigate('menu'); }}><EyeOff size={20}/><span>Сьогодні немає</span><strong>{unavailable.length}</strong><small>Видимі, але недоступні</small></button>
            <button onClick={() => navigate('banners')}><PanelsTopLeft size={20}/><span>Увімкнені банери</span><strong>{banners.filter(x => x.enabled).length}</strong><small>Дати показу задані в редакторі</small></button>
            <button onClick={() => navigate('posts')}><CalendarDays size={20}/><span>Акції та події</span><strong>{posts.filter(x => x.enabled).length}</strong><small>Увімкнені публікації</small></button>
          </div>
          <div className="admin-overview-grid">
            <section className="admin-block"><div className="block-title"><h2>Меню за категоріями</h2><button onClick={() => navigate('menu')}>Усе меню</button></div><div className="category-overview">{categories.map(c => <button key={c} onClick={() => { setCategory(c); setFilter('all'); navigate('menu'); }}><span>{c}</span><strong>{listed.filter(x => x.category === c).length}</strong><ChevronRight size={16}/></button>)}</div></section>
            <div className="admin-overview-side"><section className="admin-block"><div className="block-title"><h2>Швидкі дії</h2></div><button className="quick-action" onClick={() => { navigate('menu'); addItem(); }}><Plus size={20}/><div><strong>Додати позицію</strong><small>Страва, напій або закуска</small></div><ChevronRight size={16}/></button><button className="quick-action" onClick={() => navigate('banners')}><PanelsTopLeft size={20}/><div><strong>Оновити банери</strong><small>Текст, кнопки та дати показу</small></div><ChevronRight size={16}/></button><button className="quick-action" onClick={() => navigate('posts')}><CalendarDays size={20}/><div><strong>Анонсувати подію</strong><small>Акції та новини для гостей</small></div><ChevronRight size={16}/></button></section>
            <section className="admin-block menu-summary"><h2>Видимість меню</h2><div><span>Доступні</span><strong>{listed.length - unavailable.length}</strong></div><div><span>Сьогодні немає</span><strong>{unavailable.length}</strong></div><button onClick={() => { setFilter('hidden'); navigate('menu'); }}><span>Приховані</span><strong>{hidden.length}</strong></button><p>Приховані позиції можна повернути в меню в будь-який момент.</p></section></div>
          </div>
        </>}
        {tab === 'menu' && <>
          <div className="menu-admin-toolbar"><div className="search"><Search size={19}/><input aria-label="Пошук позицій" placeholder="Назва або інгредієнт" value={query} onChange={e => setQuery(e.target.value)}/>{query && <button className="icon" aria-label="Очистити пошук" onClick={() => setQuery('')}><X size={17}/></button>}</div><select aria-label="Категорія" value={category} onChange={e => setCategory(e.target.value)}><option value="all">Усі категорії</option>{categories.map(c => <option key={c}>{c}</option>)}</select><button className="primary" onClick={addItem}><Plus size={18}/>Додати позицію</button></div>
          <div className="menu-status-filters">{[['all','Усі',items.length],['available','Доступні',listed.length-unavailable.length],['unavailable','Сьогодні немає',unavailable.length],['hidden','Приховані',hidden.length]].map(([id,label,n]) => <button key={id} className={filter === id ? 'current' : ''} onClick={() => setFilter(id as string)}>{label}<span>{n}</span></button>)}</div>
          <div className="admin-menu-table"><div className="menu-table-head"><span>ПОЗИЦІЯ / КАТЕГОРІЯ</span><span>ЦІНА</span><span>ДОСТУПНІСТЬ</span><span>ДІЇ</span></div>{!rows.length ? <div className="no-results"><Search size={26}/><h2>Позицій не знайдено</h2><p>Змініть пошук або фільтри.</p><button onClick={() => { setQuery(''); setCategory('all'); setFilter('all'); }}>Скинути фільтри</button></div> : rows.map(x => <div key={x.id} className={'admin-menu-row '+(x.hidden?'is-hidden':'')}><div className="admin-item-name"><strong>{x.name}</strong><small>{x.category} · {x.volume || 'Об’єм не вказано'}</small></div><strong className="admin-item-price">{money(x.price)}</strong><div className="availability-cell">{x.hidden ? <span className="visibility-label"><EyeOff size={15}/>Прихована</span> : <button className={'availability-toggle '+(x.available?'on':'')} role="switch" aria-checked={x.available} aria-label={'Доступність: '+x.name} disabled={busy} onClick={() => save({...x,available:!x.available})}><span/><small>{x.available?'Доступна':'Немає'}</small></button>}</div><div className="row-actions"><button className="icon" disabled={busy} title="Редагувати" aria-label={'Редагувати '+x.name} onClick={() => {setError('');setEdit({...x,hidden:!!x.hidden});}}><Pencil size={17}/></button><button className="icon" disabled={busy} title={x.hidden?'Повернути в меню':'Приховати'} aria-label={(x.hidden?'Повернути в меню ':'Приховати ')+x.name} onClick={() => save({...x,hidden:!x.hidden})}>{x.hidden?<Eye size={17}/>:<EyeOff size={17}/>}</button></div></div>)}</div><p className="table-footnote">Показано {rows.length} з {items.length} позицій. Зміни одразу доступні після оновлення меню гостей.</p>
        </>}
        {tab === 'banners' && <div className="admin-content-panel"><BannerManager onChange={load}/></div>}
        {tab === 'posts' && <div className="admin-content-panel"><PostManager onChange={load}/></div>}
      </>}
      <footer className="admin-footer"><span>Бункер Паб · Панель керування</span><span>{updated ? 'Оновлено о '+updated.toLocaleTimeString('uk-UA',{hour:'2-digit',minute:'2-digit'}) : ''}</span></footer>
    </main>
    {edit && <div className="overlay"><form ref={formRef} className="edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-item-title" onSubmit={e => {e.preventDefault();void save(edit);}}><div className="panel-head"><div><span className="eyebrow">МЕНЮ ПАБУ</span><h2 id="edit-item-title">{items.some(x=>x.id===edit.id)?'Редагувати позицію':'Нова позиція'}</h2></div><button type="button" className="icon" aria-label="Закрити редактор" disabled={busy} onClick={()=>setEdit(null)}><X/></button></div><label>Назва<input required maxLength={150} placeholder="Назва страви або напою" value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})}/></label><label>Категорія<select value={edit.category} onChange={e=>setEdit({...edit,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Склад / опис<textarea maxLength={1000} rows={3} placeholder="Інгредієнти та деталі для гостей" value={edit.about} onChange={e=>setEdit({...edit,about:e.target.value})}/></label><div className="form-grid"><label>Вага / об’єм<input maxLength={50} placeholder="300 г або 250 мл" value={edit.volume} onChange={e=>setEdit({...edit,volume:e.target.value})}/></label><label>Ціна, грн<input required type="number" min="1" max="100000" step="1" value={edit.price} onChange={e=>setEdit({...edit,price:+e.target.value})}/></label></div><label className="checkbox"><input type="checkbox" checked={edit.available} onChange={e=>setEdit({...edit,available:e.target.checked})}/>Доступна сьогодні</label><label className="checkbox"><input type="checkbox" checked={!!edit.hidden} onChange={e=>setEdit({...edit,hidden:e.target.checked})}/>Приховати з меню гостей</label>{error&&<p className="error" role="alert">{error}</p>}<div className="editor-actions"><button type="button" className="secondary" disabled={busy} onClick={()=>setEdit(null)}>Скасувати</button><button type="submit" className="primary" disabled={busy}><Check size={18}/>{busy?'Зберігаємо…':'Зберегти'}</button></div></form></div>}
  </div>;
}
