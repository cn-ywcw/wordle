"use strict";

// ============================================================
//  UI 渲染层
// ============================================================
window.Wordle = window.Wordle || {};

(function (W) {
  const { MAX_ATTEMPTS, WORD_LENGTH, KEYBOARD_ROWS, KEY_LABELS, KEY_CLASSES } = W;

  // ========== DOM 元素缓存 ==========
  let els = {};

  W.cacheElements = function () {
    els = {
      grid: document.getElementById('grid'),
      keyboard: document.getElementById('keyboard'),
      message: document.getElementById('message'),
      attempts: document.getElementById('attempts'),
      btnRestart: document.getElementById('btnRestart'),
      modalOverlay: document.getElementById('modalOverlay'),
      modalTitle: document.getElementById('modalTitle'),
      modalAnswer: document.getElementById('modalAnswer'),
      modalRestart: document.getElementById('modalRestart'),
    };
  };

  W.getElements = function () {
    return els;
  };

  // ========== 网格 ==========
  W.renderGrid = function () {
    els.grid.innerHTML = '';
    for (let row = 0; row < MAX_ATTEMPTS; row++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'grid-row';
      rowEl.dataset.row = row;
      for (let col = 0; col < WORD_LENGTH; col++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.col = col;
        rowEl.appendChild(cell);
      }
      els.grid.appendChild(rowEl);
    }
  };

  W.updateSubmittedRow = function (rowIndex, word, colors) {
    const row = els.grid.children[rowIndex];
    if (!row) return;
    const cells = row.children;
    for (let j = 0; j < WORD_LENGTH; j++) {
      cells[j].textContent = word[j].toUpperCase();
      cells[j].className = `grid-cell ${colors[j]} flip flip-delay-${j}`;
    }
  };

  W.updateCurrentRow = function (currentGuess, currentAttempt, keyboardState) {
    if (currentAttempt >= MAX_ATTEMPTS) return;
    const row = els.grid.children[currentAttempt];
    if (!row) return;
    const cells = row.children;

    for (let j = 0; j < WORD_LENGTH; j++) {
      if (j < currentGuess.length) {
        cells[j].textContent = currentGuess[j].toUpperCase();
        const state = keyboardState[currentGuess[j]];
        cells[j].className = state ? `grid-cell filled ${state}` : 'grid-cell filled';
      } else {
        cells[j].textContent = '';
        cells[j].className = 'grid-cell';
      }
    }
  };

  // ========== 键盘 ==========
  W.renderKeyboard = function () {
    els.keyboard.innerHTML = '';

    for (const row of KEYBOARD_ROWS) {
      const rowEl = document.createElement('div');
      rowEl.className = 'keyboard-row';

      for (const key of row) {
        const btn = document.createElement('button');
        btn.className = `key ${KEY_CLASSES[key] || ''}`;
        btn.dataset.key = key;
        btn.textContent = KEY_LABELS[key] || key.toUpperCase();
        rowEl.appendChild(btn);
      }

      els.keyboard.appendChild(rowEl);
    }
  };

  W.updateKeyboardColors = function (keyboardState) {
    const keys = els.keyboard.querySelectorAll('.key');
    for (const key of keys) {
      const letter = key.dataset.key;
      if (letter === 'enter' || letter === 'backspace') continue;
      key.className = 'key';
      const state = keyboardState[letter];
      if (state) key.classList.add(state);
    }
  };

  // ========== 抖动动画 ==========
  W.shakeRow = function (rowIndex) {
    const row = els.grid.children[rowIndex];
    if (!row) return;
    for (const cell of row.children) {
      cell.classList.add('shake');
    }
    setTimeout(function () {
      for (const cell of row.children) {
        cell.classList.remove('shake');
      }
    }, 400);
  };

  // ========== 消息提示 ==========
  let messageTimer = null;

  W.showMessage = function (text, type) {
    type = type || 'error';
    if (messageTimer) clearTimeout(messageTimer);
    els.message.textContent = text;
    els.message.className = 'message show ' + type;
    messageTimer = setTimeout(W.hideMessage, 2000);
  };

  W.hideMessage = function () {
    els.message.className = 'message';
    els.message.textContent = '';
    if (messageTimer) {
      clearTimeout(messageTimer);
      messageTimer = null;
    }
  };

  // ========== 剩余次数 ==========
  W.updateAttempts = function (remaining) {
    els.attempts.textContent = '剩余尝试: ' + remaining;
  };

  // ========== 弹窗 ==========
  W.showModal = function (answer, isWin) {
    els.modalTitle.textContent = isWin ? '🎉 恭喜你赢了！' : '😞 游戏结束';
    els.modalTitle.className = 'modal-title ' + (isWin ? 'win' : 'lose');
    els.modalAnswer.textContent = answer.toUpperCase();
    els.modalOverlay.classList.add('show');
  };

  W.hideModal = function () {
    els.modalOverlay.classList.remove('show');
  };
})(Wordle);
