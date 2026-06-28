"use strict";

// ============================================================
//  游戏配置常量
// ============================================================
window.Wordle = window.Wordle || {};

Wordle.MAX_ATTEMPTS = 6;
Wordle.WORD_LENGTH = 5;

// QWERTY 键盘布局
Wordle.KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'enter', 'backspace'],
];

Wordle.KEY_LABELS = {
  enter: '↵ ENTER',
  backspace: '⌫',
};

Wordle.KEY_CLASSES = {
  enter: 'key-wide key-enter',
  backspace: 'key-wide key-backspace',
};

Wordle.STATE_CLASS = {
  correct: 'correct',
  present: 'present',
  absent: 'absent',
};

Wordle.STATE_PRIORITY = { correct: 3, present: 2, absent: 1 };
