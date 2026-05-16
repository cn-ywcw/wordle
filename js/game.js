"use strict";

// ============================================================
//  游戏核心逻辑
// ============================================================
window.Wordle = window.Wordle || {};

(function (W) {
  const { MAX_ATTEMPTS, WORD_LENGTH, STATE_CLASS, STATE_PRIORITY } = W;

  // ========== 游戏状态工厂 ==========
  W.createGameState = function (answers, allowed) {
    const allowedSet = new Set([...allowed, ...answers]);
    return {
      answers,
      allowed: allowedSet,
      answer: '',
      currentGuess: '',
      guesses: [],
      currentAttempt: 0,
      isGameOver: false,
      isProcessing: false,
      keyboardState: {},
    };
  };

  // ========== 初始化 / 重置 ==========
  W.startNewGame = function (state) {
    state.answer = state.answers[Math.floor(Math.random() * state.answers.length)];
    state.currentGuess = '';
    state.guesses = [];
    state.currentAttempt = 0;
    state.isGameOver = false;
    state.isProcessing = false;
    state.keyboardState = {};
    return state.answer;
  };

  // ========== 清空键盘显示 ==========
  W.clearKeyboard = function (state) {
    state.keyboardState = {};
  };

  // ========== 单词验证 ==========
  W.isValidWord = function (state, word) {
    return state.allowed.has(word.toLowerCase());
  };

  // ========== 颜色计算（处理重复字母）==========
  W.getLetterColors = function (guess, answer) {
    const result = Array(WORD_LENGTH).fill(STATE_CLASS.absent);
    const answerChars = answer.split('');
    const guessChars = guess.split('');

    const letterCounts = {};
    for (const ch of answerChars) {
      letterCounts[ch] = (letterCounts[ch] || 0) + 1;
    }

    // 第一遍：标记绿色
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessChars[i] === answerChars[i]) {
        result[i] = STATE_CLASS.correct;
        letterCounts[guessChars[i]]--;
      }
    }

    // 第二遍：标记黄色
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i] !== STATE_CLASS.correct && letterCounts[guessChars[i]] > 0) {
        result[i] = STATE_CLASS.present;
        letterCounts[guessChars[i]]--;
      }
    }

    return result;
  };

  // ========== 键盘状态合并 ==========
  W.mergeKeyboardState = function (currentState, word, colors) {
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = word[i];
      const color = colors[i];
      const prev = currentState[letter];
      const newPriority = STATE_PRIORITY[color];
      if (!prev || STATE_PRIORITY[prev] < newPriority) {
        currentState[letter] = color;
      }
    }
  };

  // ========== 提交猜测 ==========
  W.submitGuess = function (state) {
    if (state.isGameOver || state.isProcessing) return null;
    if (state.currentGuess.length !== WORD_LENGTH) {
      return { type: 'error', reason: 'length' };
    }

    const word = state.currentGuess.toLowerCase();

    if (!state.allowed.has(word)) {
      return { type: 'error', reason: 'invalid' };
    }

    state.isProcessing = true;
    state.guesses.push(word);

    const colors = W.getLetterColors(word, state.answer);
    W.mergeKeyboardState(state.keyboardState, word, colors);

    const result = { type: 'commit', word, colors, isWin: word === state.answer };

    if (word === state.answer) {
      state.isGameOver = true;
      return result;
    }

    state.currentAttempt++;
    state.currentGuess = '';

    if (state.currentAttempt >= MAX_ATTEMPTS) {
      state.isGameOver = true;
      result.isLose = true;
    }

    return result;
  };

  // ========== 输入处理 ==========
  W.handleInput = function (state, key) {
    if (state.isGameOver || state.isProcessing) return null;

    if (key === 'backspace') {
      if (state.currentGuess.length > 0) {
        state.currentGuess = state.currentGuess.slice(0, -1);
        return { type: 'update' };
      }
      return null;
    }

    if (key === 'enter') return null;

    if (!/^[a-zA-Z]$/.test(key)) return null;
    if (state.currentGuess.length >= WORD_LENGTH) return null;

    state.currentGuess += key.toLowerCase();
    return { type: 'update' };
  };

  W.getRemainingAttempts = function (state) {
    return MAX_ATTEMPTS - state.currentAttempt;
  };

  W.setProcessing = function (state, val) {
    state.isProcessing = val;
  };
})(Wordle);
