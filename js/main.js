"use strict";

// ============================================================
//  入口 —— 编排游戏逻辑与 UI
// ============================================================

(function () {
  if (typeof ANSWERS_DATA === 'undefined' || typeof ALLOWED_DATA === 'undefined') {
    var msg = document.getElementById('message');
    if (msg) {
      msg.textContent = '单词库加载失败，请刷新重试';
      msg.className = 'message show error';
    }
    return;
  }

  var W = Wordle;

  console.log('单词库加载成功');
  console.log('  答案库单词数:', ANSWERS_DATA.length);
  console.log('  合法单词数:', ALLOWED_DATA.length + ANSWERS_DATA.length);

  // ========== 初始化 ==========
  var gameState = W.createGameState(ANSWERS_DATA, ALLOWED_DATA);
  W.cacheElements();
  W.renderGrid();
  W.renderKeyboard();
  bindEvents();
  beginGame();

  function beginGame() {
    W.startNewGame(gameState);
    console.log('  本轮答案:', gameState.answer);
    W.hideMessage();
    W.hideModal();
    W.updateAttempts(W.MAX_ATTEMPTS);
    W.renderKeyboard();
  }

  // ========== 事件绑定 ==========
  function bindEvents() {
    var els = W.getElements();

    // 虚拟键盘点击
    els.keyboard.addEventListener('click', function (e) {
      var key = e.target.closest('.key');
      if (!key) return;
      processKey(key.dataset.key);
    });

    // 物理键盘
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        processKey('enter');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        processKey('backspace');
      } else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        processKey(e.key);
      }
    });

    // 重新开始按钮
    els.btnRestart.addEventListener('click', beginGame);
    els.modalRestart.addEventListener('click', beginGame);
  }

  // ========== 按键处理 ==========
  function processKey(key) {
    if (gameState.isGameOver || gameState.isProcessing) return;

    if (key === 'enter') {
      handleEnter();
      return;
    }

    if (key === 'backspace') {
      W.handleInput(gameState, 'backspace');
      W.updateCurrentRow(gameState.currentGuess, gameState.currentAttempt, gameState.keyboardState);
      return;
    }

    if (!/^[a-zA-Z]$/.test(key)) return;
    W.handleInput(gameState, key);
    W.updateCurrentRow(gameState.currentGuess, gameState.currentAttempt, gameState.keyboardState);
  }

  function handleEnter() {
    var currentAttempt = gameState.currentAttempt;
    var result = W.submitGuess(gameState);

    if (!result) return;

    if (result.type === 'error') {
      W.showMessage(result.reason === 'length' ? '请输入 5 个字母' : '不是合法单词', 'error');
      W.shakeRow(currentAttempt);
      gameState.currentGuess = '';
      W.updateCurrentRow(gameState.currentGuess, gameState.currentAttempt, gameState.keyboardState);
      return;
    }

    // 提交成功
    W.updateSubmittedRow(currentAttempt, result.word, result.colors);
    W.updateKeyboardColors(gameState.keyboardState);

    if (result.isWin) {
      setTimeout(function () {
        W.showMessage('恭喜你猜对了！🎉', 'success');
        W.showModal(gameState.answer, true);
        W.setProcessing(gameState, false);
      }, 600);
      return;
    }

    W.updateCurrentRow(gameState.currentGuess, gameState.currentAttempt, gameState.keyboardState);
    W.updateAttempts(W.getRemainingAttempts(gameState));

    if (result.isLose) {
      setTimeout(function () {
        W.showMessage('游戏结束！答案是: ' + gameState.answer.toUpperCase(), 'info');
        W.showModal(gameState.answer, false);
        W.setProcessing(gameState, false);
      }, 600);
      return;
    }

    setTimeout(function () {
      W.setProcessing(gameState, false);
    }, 300);
  }
})();
