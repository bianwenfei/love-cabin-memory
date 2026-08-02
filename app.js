// 默认初始配置（第一次打开会自动保存，之后你改设置会覆盖）
const DEFAULT_CONFIG = {
  loveStartDate: '2022-06-26',
  nameBoy: '男生',
  nameGirl: '女生',
  coverImg: 'https://gimg2.baidu.com/image_search/src=http://wx2.sinaimg.cn/large/006EBt1Kly1h18nzq92jyj30u01hc7wh.jpg&refer=http://wx2.sinaimg.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1727850366&t=7b381202322f1459d7806878feef4301'
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initSettings();
  initCountdown();
  initRouter();
  initMemory();
  initWish();
  initRecipe();
  initDailyTask();
  renderMainCover();
});

// ========== 设置模块：可改名字/合照 ==========
function getConfig() {
  return JSON.parse(localStorage.getItem('loveConfig') || JSON.stringify(DEFAULT_CONFIG));
}
function saveConfig(config) {
  localStorage.setItem('loveConfig', JSON.stringify(config));
}

function initSettings() {
  const config = getConfig();
  const openBtn = document.getElementById('open-settings');
  const modal = document.getElementById('settings-modal');
  const cancelBtn = document.getElementById('cancel-settings');
  const saveBtn = document.getElementById('save-settings');

  // 打开弹窗填充已有数据
  openBtn.addEventListener('click', () => {
    const config = getConfig();
    modal.classList.add('active');
    document.getElementById('name-boy').value = config.nameBoy;
    document.getElementById('name-girl').value = config.nameGirl;
    document.getElementById('love-date').value = config.loveStartDate;
    if(config.coverImg) {
      document.getElementById('cover-preview').innerHTML = `<img src="${config.coverImg}" alt="预览">`;
    }
  });

  cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  // 图片预览
  document.getElementById('cover-img').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('cover-preview').innerHTML = `<img src="${e.target.result}" alt="预览">`;
    }
    reader.readAsDataURL(file);
  });

  // 保存设置
  saveBtn.addEventListener('click', () => {
    const newConfig = {
      nameBoy: document.getElementById('name-boy').value.trim(),
      nameGirl: document.getElementById('name-girl').value.trim(),
      loveStartDate: document.getElementById('love-date').value,
      coverImg: document.getElementById('cover-preview').querySelector('img')?.src || getConfig().coverImg
    };
    saveConfig(newConfig);
    initCountdown();
    renderMainCover();
    document.getElementById('couple-names').textContent = `${newConfig.nameBoy} ♥ ${newConfig.nameGirl}`;
    modal.classList.remove('active');
    alert('设置保存成功！');
  });

  // 初始渲染名字
  document.getElementById('couple-names').textContent = `${config.nameBoy} ♥ ${config.nameGirl}`;
}

function renderMainCover() {
  document.getElementById('main-cover').src = getConfig().coverImg;
}

// ========== 倒计时 ==========
function initCountdown() {
  const config = getConfig();
  const start = new Date(config.loveStartDate);
  const now = new Date();
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  document.getElementById('main-day-count').textContent = days;
}

// ========== 路由跳转 ==========
function initRouter() {
  // 返回首页按钮
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchPage('home');
    });
  });
  // 宫格入口跳转
  document.querySelectorAll('.func-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const target = card.getAttribute('href').replace('#', '');
      switchPage(target);
    });
  });
}

function switchPage(targetId) {
  document.querySelectorAll('.main-page, .page').forEach(p => p.classList.remove('active-page'));
  document.getElementById(targetId).classList.add('active-page');
  window.scrollTo(0, 0);
}

// ========== 记忆长廊 ==========
function initMemory() {
  const modal = document.getElementById('memory-modal');
  const addBtn = document.getElementById('add-memory-btn');
  const cancelBtn = document.getElementById('cancel-memory');
  const saveBtn = document.getElementById('save-memory');
  const imgInput = document.getElementById('memory-img');
  const preview = document.getElementById('img-preview');

  addBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.getElementById('memory-text').value = '';
    imgInput.value = '';
    preview.innerHTML = '';
  });
  cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  imgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => preview.innerHTML = `<img src="${e.target.result}" alt="预览图">`;
    reader.readAsDataURL(file);
  });

  saveBtn.addEventListener('click', () => {
    const text = document.getElementById('memory-text').value.trim();
    const img = preview.querySelector('img')?.src || '';
    if (!text) return alert('请写下记忆内容哦');
    const memories = JSON.parse(localStorage.getItem('loveMemories') || '[]');
    memories.unshift({id: Date.now(), date: new Date().toLocaleString('zh-CN'), text, img});
    localStorage.setItem('loveMemories', JSON.stringify(memories));
    renderMemories();
    modal.classList.remove('active');
  });
  renderMemories();
}

function renderMemories() {
  const list = document.getElementById('memory-list');
  const memories = JSON.parse(localStorage.getItem('loveMemories') || '[]');
  if (memories.length === 0) return list.innerHTML = `<p class="empty-tip">还没有打卡记忆，快来写下我们的第一条吧～</p>`;
  list.innerHTML = '';
  memories.forEach(m => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.innerHTML = `
      <div class="memory-date">🕒 ${m.date}</div>
      <div class="memory-text">${m.text}</div>
      ${m.img ? `<img class="memory-img" src="${m.img}">` : ''}
      <div class="delete-btn"><button data-id="${m.id}">删除</button></div>
    `;
    card.querySelector('button').addEventListener('click', () => {
      if(confirm('确定删除？')) {
        localStorage.setItem('loveMemories', JSON.stringify(memories.filter(item => item.id !== m.id)));
        renderMemories();
      }
    });
    list.appendChild(card);
  });
}

// ========== 愿望清单 ==========
function initWish() {
  const modal = document.getElementById('wish-modal');
  const addBtn = document.getElementById('add-wish-btn');
  const cancelBtn = document.getElementById('cancel-wish');
  const saveBtn = document.getElementById('save-wish');

  addBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.getElementById('wish-text').value = '';
  });
  cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  saveBtn.addEventListener('click', () => {
    const text = document.getElementById('wish-text').value.trim();
    if (!text) return alert('请输入愿望内容哦');
    const wishes = JSON.parse(localStorage.getItem('loveWishes') || '[]');
    wishes.unshift({id: Date.now(), text, completed: false});
    localStorage.setItem('loveWishes', JSON.stringify(wishes));
    renderWishes();
    modal.classList.remove('active');
  });
  renderWishes();
}

function renderWishes() {
  const list = document.getElementById('wish-list');
  const wishes = JSON.parse(localStorage.getItem('loveWishes') || '[]');
  if (wishes.length === 0) return list.innerHTML = `<p class="empty-tip">还没有添加愿望，快来写下我们的第一个小目标吧～</p>`;
  list.innerHTML = '';
  wishes.forEach(w => {
    const item = document.createElement('div');
    item.className = `wish-item ${w.completed ? 'completed' : ''}`;
    item.innerHTML = `
      <div class="wish-content">
        <input type="checkbox" class="wish-checkbox" ${w.completed?'checked':''} data-id="${w.id}">
        <p>${w.text}</p>
      </div>
      <button class="delete-btn" data-id="${w.id}">删除</button>
    `;
    item.querySelector('.wish-checkbox').addEventListener('change', e => {
      w.completed = e.target.checked;
      localStorage.setItem('loveWishes', JSON.stringify(wishes));
      renderWishes();
    });
    item.querySelector('.delete-btn').addEventListener('click', () => {
      if(confirm('确定删除？')) {
        localStorage.setItem('loveWishes', JSON.stringify(wishes.filter(i => i.id !== w.id)));
        renderWishes();
      }
    });
    list.appendChild(item);
  });
}

// ========== 新增：菜谱模块 ==========
function initRecipe() {
  const modal = document.getElementById('recipe-modal');
  const addBtn = document.getElementById('add-recipe-btn');
  const cancelBtn = document.getElementById('cancel-recipe');
  const saveBtn = document.getElementById('save-recipe');
  const preview = document.getElementById('recipe-preview');

  addBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.getElementById('recipe-name').value = '';
    document.getElementById('recipe-step').value = '';
    document.getElementById('recipe-img').value = '';
    preview.innerHTML = '';
  });
  cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  document.getElementById('recipe-img').addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e => preview.innerHTML = `<img src="${e.target.result}">`;
    reader.readAsDataURL(file);
  });

  saveBtn.addEventListener('click', () => {
    const name = document.getElementById('recipe-name').value.trim();
    const step = document.getElementById('recipe-step').value.trim();
    const img = preview.querySelector('img')?.src || '';
    if(!name || !step) return alert('请填写菜名和做法哦');
    const recipes = JSON.parse(localStorage.getItem('loveRecipes') || '[]');
    recipes.unshift({id: Date.now(), name, step, img});
    localStorage.setItem('loveRecipes', JSON.stringify(recipes));
    renderRecipes();
    modal.classList.remove('active');
  });
  renderRecipes();
}

function renderRecipes() {
  const list = document.getElementById('recipe-list');
  const recipes = JSON.parse(localStorage.getItem('loveRecipes') || '[]');
  if (recipes.length === 0) return list.innerHTML = `<p class="empty-tip">还没有添加菜谱，快来收藏我们一起做过的菜吧～</p>`;
  list.innerHTML = '';
  recipes.forEach(r => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      ${r.img ? `<img src="${r.img}" alt="${r.name}">` : ''}
      <div class="recipe-info">
        <h3>${r.name}</h3>
        <p class="recipe-step">${r.step}</p>
        <div class="delete-btn" style="margin-top:0.5rem"><button data-id="${r.id}">删除</button></div>
      </div>
    `;
    card.querySelector('button').addEventListener('click', () => {
      if(confirm('确定删除？')) {
        localStorage.setItem('loveRecipes', JSON.stringify(recipes.filter(i => i.id !== r.id)));
        renderRecipes();
      }
    });
    list.appendChild(card);
  });
}

// ========== 新增：每日任务打卡 ==========
function initDailyTask() {
  const modal = document.getElementById('task-modal');
  const addBtn = document.getElementById('add-task-btn');
  const cancelBtn = document.getElementById('cancel-task');
  const saveBtn = document.getElementById('save-task');

  addBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.getElementById('task-text').value = '';
  });
  cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  saveBtn.addEventListener('click', () => {
    const text = document.getElementById('task-text').value.trim();
    if(!text) return alert('请输入任务内容哦');
    const tasks = JSON.parse(localStorage.getItem('dailyTasks') || '[]');
    tasks.unshift({id: Date.now(), text, createdAt: new Date().toDateString()});
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
    renderTasks();
    renderTodayTasks();
    calcContinueDays();
    modal.classList.remove('active');
  });
  renderTasks();
  renderTodayTasks();
  calcContinueDays();
}

function renderTodayTasks() {
  const container = document.getElementById('today-task-list');
  const today = new Date().toDateString();
  const tasks = JSON.parse(localStorage.getItem('dailyTasks') || '[]');
  const todayTasks = tasks.filter(t => t.createdAt === today);
  if(todayTasks.length === 0) {
    container.innerHTML = `<p style="color:#999">今天还没有打卡任务哦，快去添加吧～</p>`;
    return;
  }
  container.innerHTML = '';
  todayTasks.forEach(t => {
    const item = document.createElement('div');
    item.className = 'task-today-item';
    item.innerHTML = `✅ ${t.text}`;
    container.appendChild(item);
  });
}

function renderTasks() {
  const container = document.getElementById('task-list');
  const tasks = JSON.parse(localStorage.getItem('dailyTasks') || '[]');
  if(tasks.length === 0) {
    container.innerHTML = `<p class="empty-tip">还没有添加每日任务哦～</p>`;
    return;
  }
  container.innerHTML = '';
  tasks.forEach(t => {
    const item = document.createElement('div');
    item.className = `task-item`;
    item.innerHTML = `
      <div class="task-content">
        <p>${t.text}</p>
      </div>
      <div class="task-date" style="color:#999; font-size:0.8rem">${new Date(t.createdAt).toLocaleDateString()}</div>
      <button class="delete-btn" data-id="${t.id}">删除</button>
    `;
    item.querySelector('button').addEventListener('click', () => {
      if(confirm('确定删除？')) {
        localStorage.setItem('dailyTasks', JSON.stringify(tasks.filter(i => i.id !== t.id)));
        renderTasks();
        renderTodayTasks();
        calcContinueDays();
      }
    });
    container.appendChild(item);
  });
}

function calcContinueDays() {
  const tasks = JSON.parse(localStorage.getItem('dailyTasks') || '[]');
  if(tasks.length === 0) {
    document.getElementById('continue-days').textContent = 0;
    return 0;
  }
  // 去重日期排序
  const dates = [...new Set(tasks.map(t => t.createdAt))].map(d => new Date(d)).sort((a,b) => b - a);
  let count = 1;
  let today = new Date();
  // 如果最新一天不是今天，从昨天开始算
  if(dates[0].toDateString() !== today.toDateString()) {
    document.getElementById('continue-days').textContent = 0;
    return 0;
  }
  for(let i=1; i<dates.length; i++) {
    const prevDate = new Date(dates[i-1]);
    prevDate.setDate(prevDate.getDate() - 1);
    if(prevDate.toDateString() === dates[i].toDateString()) {
      count++;
    } else {
      break;
    }
  }
  document.getElementById('continue-days').textContent = count;
  return count;
}
