// Shared helpers. Data lives in localStorage until Module 02 adds the backend API.
const KEYS = {
  users: 'blog_users',
  session: 'blog_session',
  posts: 'blog_posts'
};

const read = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
};

const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const esc = s => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

const fmtDate = ts => new Date(ts).toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});

/* ---------- Auth ---------- */
const Auth = {
  user: () => read(KEYS.session, null),

  register(name, email, password) {
    const users = read(KEYS.users, []);
    if (users.some(u => u.email === email)) {
      return 'An account with this email already exists.';
    }
    users.push({ id: Date.now(), name, email, password });
    write(KEYS.users, users);
    return null;
  },

  login(email, password) {
    const u = read(KEYS.users, []).find(u => u.email === email && u.password === password);
    if (!u) return 'Email or password is incorrect.';
    write(KEYS.session, { id: u.id, name: u.name, email: u.email });
    return null;
  },

  logout() {
    localStorage.removeItem(KEYS.session);
    location.href = 'index.html';
  },

  require() {
    if (!Auth.user()) location.href = 'login.html';
  }
};

/* ---------- Posts ---------- */
const Posts = {
  all() {
    let p = read(KEYS.posts, null);
    if (!p) {
      p = [
        {
          id: 1,
          title: 'Getting started with HTML and CSS',
          category: 'Web',
          author: 'Codomax Team',
          authorId: 0,
          content: 'HTML gives a page its structure and CSS gives it style. Start with semantic tags like header, main and footer, then use flexbox and grid to lay things out.',
          createdAt: Date.now() - 86400000 * 3
        },
        {
          id: 2,
          title: 'JavaScript basics every beginner needs',
          category: 'JavaScript',
          author: 'Codomax Team',
          authorId: 0,
          content: 'Learn variables, functions, arrays and the DOM first. Once you can read from a form and update the page, you are ready to build real apps.',
          createdAt: Date.now() - 86400000 * 2
        }
      ];
      write(KEYS.posts, p);
    }
    return p.sort((a, b) => b.createdAt - a.createdAt);
  },

  get: id => Posts.all().find(p => p.id === Number(id)),

  save(post) {
    const all = read(KEYS.posts, []);
    const i = all.findIndex(p => p.id === post.id);
    if (i >= 0) {
      all[i] = post;
    } else {
      all.push(post);
    }
    write(KEYS.posts, all);
  },

  remove(id) {
    write(KEYS.posts, read(KEYS.posts, []).filter(p => p.id !== Number(id)));
  }
};

/* ---------- UI helpers ---------- */
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

function renderNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  const u = Auth.user();

  const link = (href, text) =>
    `<a href="${href}" ${page === href ? 'class="active" aria-current="page"' : ''}>${text}</a>`;

  const links = u
    ? link('index.html', 'Home') +
      link('dashboard.html', 'Dashboard') +
      link('create-blog.html', 'Write') +
      `<a href="#" id="logout">Log out</a>`
    : link('index.html', 'Home') +
      link('login.html', 'Log in') +
      link('register.html', 'Register');

  document.getElementById('site-header').innerHTML =
    `<div class="bar"><a class="brand" href="index.html">Inkwell</a><nav aria-label="Main">${links}</nav></div>`;

  const out = document.getElementById('logout');
  if (out) {
    out.addEventListener('click', e => {
      e.preventDefault();
      Auth.logout();
    });
  }
}

function postCard(p, withActions = false) {
  return `<article class="card">
    <span class="tag">${esc(p.category)}</span>
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.content.slice(0, 120))}${p.content.length > 120 ? '…' : ''}</p>
    <div class="meta">${esc(p.author)} · ${fmtDate(p.createdAt)}</div>
    <div class="actions">
      <button class="small" data-read="${p.id}">Read</button>
      ${withActions
        ? `<a class="btn ghost small" href="create-blog.html?id=${p.id}">Edit</a>
           <button class="small danger" data-del="${p.id}">Delete</button>`
        : ''}
    </div>
  </article>`;
}

function openPost(id) {
  const p = Posts.get(id);
  if (!p) return;

  const d = document.getElementById('post-dialog');
  d.innerHTML = `
    <h2>${esc(p.title)}</h2>
    <p class="meta">${esc(p.category)} · ${esc(p.author)} · ${fmtDate(p.createdAt)}</p>
    <div class="body">${esc(p.content)}</div>
    <p><button class="small" id="close-dialog">Close</button></p>`;
  d.showModal();
  document.getElementById('close-dialog').onclick = () => d.close();
}

document.addEventListener('DOMContentLoaded', renderNav);