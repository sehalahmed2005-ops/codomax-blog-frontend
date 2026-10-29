// Shared helpers. Data now comes from the Node.js/Express backend API.
const API = 'http://localhost:5000/api';

const KEYS = {
  session: 'blog_session',
  token: 'blog_token'
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

/* ---------- API helper ---------- */
async function api(path, method = 'GET', body) {
  const token = localStorage.getItem(KEYS.token);
  let res;
  try {
    res = await fetch(API + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

/* ---------- Auth ---------- */
const Auth = {
  user: () => read(KEYS.session, null),

  // returns an error message, or null on success
  async register(name, email, password) {
    try {
      await api('/auth/register', 'POST', { name, email, password });
      return null;
    } catch (e) {
      return e.message;
    }
  },

  async login(email, password) {
    try {
      const data = await api('/auth/login', 'POST', { email, password });
      localStorage.setItem(KEYS.token, data.token);
      write(KEYS.session, data.user);
      return null;
    } catch (e) {
      return e.message;
    }
  },

  logout() {
    localStorage.removeItem(KEYS.session);
    localStorage.removeItem(KEYS.token);
    location.href = 'index.html';
  },

  require() {
    if (!Auth.user() || !localStorage.getItem(KEYS.token)) location.href = 'login.html';
  }
};

/* ---------- Posts ---------- */
const Posts = {
  async all() {
    try {
      const list = await api('/blogs');
      return list.sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
      toast(e.message);
      return [];
    }
  },

  async get(id) {
    try {
      return await api('/blogs/' + Number(id));
    } catch {
      return undefined;
    }
  },

  // creates or updates; returns an error message, or null on success
  async save(post) {
    try {
      const data = { title: post.title, category: post.category, content: post.content };
      const exists = post.id ? await Posts.get(post.id) : null;
      if (exists) {
        await api('/blogs/' + post.id, 'PUT', data);
      } else {
        await api('/blogs', 'POST', data);
      }
      return null;
    } catch (e) {
      return e.message;
    }
  },

  async remove(id) {
    try {
      await api('/blogs/' + Number(id), 'DELETE');
      return null;
    } catch (e) {
      return e.message;
    }
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

async function openPost(id) {
  const p = await Posts.get(id);
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