// ========== 配置项：修改成你自己的信息 ==========
const LOVE_START_DATE = new Date('2020-05-20'); // 改成你的相恋开始日期
const COVER_IMG_URL = 'https://gimg2.baidu.com/image_search/src=http://wx2.sinaimg.cn/large/006EBt1Kly1h18nzq92jyj30u01hc7wh.jpg&refer=http://wx2.sinaimg.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1727850366&t=7b381202322f1459d7806878feef4301'; // 改成你们合照的地址

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  initHome();
  initNav();
  initMemory();
  initWish();
  setCover();
});

// 设置首页封面
function setCover() {
  document.getElementById('home-cover').src = COVER_IMG_URL;
}

// ========== 首页倒计时 ==========
function initHome() {
  const now = new Date();
  const days = Math.floor((now - LOVE_START_DATE) / (1000 * 60 * 60 * 24));
  document.getElementById('day-count').textContent = days;
}

// ========== 导航切换 ==========
function initNav() {
  const links = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');
  links.forEach(link => {
    link.addEventListener('click', () => {
      const target = link.dataset.target;
      // 切换active
      links.forEach(l => l.classList.remove('active'));
      pages.forEach(p => p.classList.remove('active-page'));
      link.classList.add('active');
      document.getElementById(target).classList.add('active-page');
    })
  })
}

// ========== 记忆长廊模块 ==========
function initMemory() {
  const modal = document.getElementById('memory-modal');
  const addBtn = document.getElementById('add-memory-btn');
  const cancelBtn = document.getElementById('cancel-memory');
  const saveBtn = document.getElementById('save-memory');
  const imgInput = document.getElementById('memory-img');
  const preview = document.getElementById('img-preview');

  // 打开弹窗
  addBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.getElementById('memory-text').value = '';
    imgInput.value = '';
    preview.innerHTML = '';
  });
  // 关闭弹窗
  cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  // 图片预览
  imgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="预览图">`;
    }
    reader.readAsDataURL(file);
  });

  // 保存记忆
  saveBtn.addEventListener('click', () => {
    const text = document.getElementById('memory-text').value.trim();
    const img = preview.querySelector('img')?.src || '';
    if (!text) {
      alert('请写下今天的记忆哦');
      return;
    }
    const newMemory = {
      id: Date.now(),
      date: new Date().toLocaleString('zh-CN'),
      text: text,
      img: img
    };
    const memories = getAllMemories();
    memories.unshift(newMemory);
    localStorage.setItem('loveMemories', JSON.stringify(memories));
    renderMemories();
    modal.classList.remove('active');
  });

  // 初始渲染
  renderMemories();
}

function getAllMemories() {
  return JSON.parse(localStorage.getItem('loveMemories') || '[]');
}

function renderMemories() {
  const listEl = document.getElementById('memory-list');
  const memories = getAllMemories();
  if (memories.length === 0) {
    listEl.innerHTML = `<p class="empty-tip">还没有打卡记忆，快来写下我们的第一条吧～</p>`;
    return;
  }
  listEl.innerHTML = '';
  memories.forEach(memory => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    let imgHtml = memory.img ? `<img class="memory-img" src="${memory.img}" alt="记忆照片">` : '';
    card.innerHTML = `
      <div class="memory-date">🕒 ${memory.date}</div>
      <div class="memory-text">${memory.text}</div>
      ${imgHtml}
      <div class="delete-btn"><button data-id="${memory.id}">删除</button></div>
    `;
    card.querySelector('.delete-btn button').addEventListener('click', () => {
      if (confirm('确定要删除这条记忆吗？')) {
        deleteMemory(memory.id);
      }
    })
    listEl.appendChild(card);
  })
}

function deleteMemory(id) {
  let memories = getAllMemories();
  memories = memories.filter(m => m.id !== id);
  localStorage.setItem('loveMemories', JSON.stringify(memories));
  renderMemories();
}

// ========== 愿望清单模块 ==========
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
    if (!text) {
      alert('请写下愿望内容哦');
      return;
    }
    const newWish = {
      id: Date.now(),
      text: text,
      completed: false
    };
    const wishes = getAllWishes();
    wishes.unshift(newWish);
    localStorage.setItem('loveWishes', JSON.stringify(wishes));
    renderWishes();
    modal.classList.remove('active');
  });

  renderWishes();
}

function getAllWishes() {
  return JSON.parse(localStorage.getItem('loveWishes') || '[]');
}

function renderWishes() {
  const listEl = document.getElementById('wish-list');
  const wishes = getAllWishes();
  if (wishes.length === 0) {
    listEl.innerHTML = `<p class="empty-tip">还没有添加愿望，快来写下我们的第一个小目标吧～</p>`;
    return;
  }
  listEl.innerHTML = '';
  wishes.forEach(wish => {
    const item = document.createElement('div');
    item.className = `wish-item ${wish.completed ? 'completed' : ''}`;
    item.innerHTML = `
      <div class="wish-content">
        <input type="checkbox" class="wish-checkbox" ${wish.completed ? 'checked' : ''} data-id="${wish.id}">
        <p>${wish.text}</p>
      </div>
      <button class="delete-btn" data-id="${wish.id}">删除</button>
    `;
    item.querySelector('.wish-checkbox').addEventListener('change', (e) => {
      toggleWishComplete(wish.id, e.target.checked);
    });
    item.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm('确定要删除这个愿望吗？')) {
        deleteWish(wish.id);
      }
    });
    listEl.appendChild(item);
  })
}

function toggleWishComplete(id, isCompleted) {
  const wishes = getAllWishes();
  const target = wishes.find(w => w.id === id);
  if (target) {
    target.completed = isCompleted;
    localStorage.setItem('loveWishes', JSON.stringify(wishes));
    renderWishes();
  }
}

function deleteWish(id) {
  let wishes = getAllWishes();
  wishes = wishes.filter(w => w.id !== id);
  localStorage.setItem('loveWishes', JSON.stringify(wishes));
  renderWishes();
}
