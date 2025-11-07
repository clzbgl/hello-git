/* Todo 应用主逻辑 */
(function () {
  const STORAGE_KEY = 'todo-items-v1';
  const FILTERS = { ALL: 'all', ACTIVE: 'active', COMPLETED: 'completed' };

  /** @typedef {{ id: string, text: string, completed: boolean }} Todo */
  /** @type {Todo[]} */
  let todos = [];
  /** @type {keyof typeof FILTERS | 'all' | 'active' | 'completed'} */
  let currentFilter = FILTERS.ALL;

  // DOM 引用
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const filtersEl = document.querySelector('.filters');
  const itemsLeftEl = document.getElementById('items-left');
  const clearCompletedBtn = document.getElementById('clear-completed');

  // 工具函数
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      todos = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(todos)) todos = [];
    } catch {
      todos = [];
    }
  };
  const generateId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

  // 渲染
  function render() {
    // 过滤
    let view = todos;
    if (currentFilter === FILTERS.ACTIVE) view = todos.filter(t => !t.completed);
    if (currentFilter === FILTERS.COMPLETED) view = todos.filter(t => t.completed);

    // 列表
    list.innerHTML = '';
    for (const todo of view) {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.completed ? ' completed' : '');
      li.dataset.id = todo.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-check';
      checkbox.checked = todo.completed;
      checkbox.setAttribute('aria-label', '标记完成');

      const text = document.createElement('div');
      text.className = 'todo-text';
      text.textContent = todo.text;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'todo-remove';
      removeBtn.type = 'button';
      removeBtn.title = '删除';
      removeBtn.setAttribute('aria-label', '删除');
      removeBtn.textContent = '✕';

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(removeBtn);
      list.appendChild(li);
    }

    // 统计
    const left = todos.filter(t => !t.completed).length;
    itemsLeftEl.textContent = `${left} 项未完成`;

    // 清除按钮状态
    clearCompletedBtn.disabled = todos.every(t => !t.completed);
  }

  // 事件处理
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = (input.value || '').trim();
    if (!text) return;
    todos.unshift({ id: generateId(), text, completed: false });
    input.value = '';
    save();
    render();
    input.focus();
  });

  list.addEventListener('click', (e) => {
    const target = /** @type {HTMLElement} */(e.target);
    const item = target.closest('.todo-item');
    if (!item) return;
    const id = item.dataset.id;
    if (!id) return;

    if (target.classList.contains('todo-remove')) {
      todos = todos.filter(t => t.id !== id);
      save();
      render();
      return;
    }
  });

  list.addEventListener('change', (e) => {
    const target = /** @type {HTMLElement} */(e.target);
    if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') return;
    const item = target.closest('.todo-item');
    if (!item) return;
    const id = item.dataset.id;
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    todo.completed = target.checked;
    save();
    render();
  });

  filtersEl.addEventListener('click', (e) => {
    const btn = /** @type {HTMLElement} */(e.target);
    if (!(btn instanceof HTMLButtonElement) || !btn.dataset.filter) return;
    const selected = btn.dataset.filter;
    if (selected !== FILTERS.ALL && selected !== FILTERS.ACTIVE && selected !== FILTERS.COMPLETED) return;
    currentFilter = selected;
    for (const el of /** @type {NodeListOf<HTMLButtonElement>} */(filtersEl.querySelectorAll('.filter'))) {
      const isActive = el.dataset.filter === selected;
      el.classList.toggle('active', isActive);
      el.setAttribute('aria-pressed', String(isActive));
    }
    render();
  });

  clearCompletedBtn.addEventListener('click', () => {
    const hasCompleted = todos.some(t => t.completed);
    if (!hasCompleted) return;
    todos = todos.filter(t => !t.completed);
    save();
    render();
  });

  // 初始化
  load();
  render();
})();


