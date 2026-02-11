import { Dimensions } from 'react-native';

import { guess } from '../types';

export const { width: SIZE, height: HEIGHT } = Dimensions.get('window');
export const APP_TITLE = 'WORDVIBE';

export const colors = {
  correct: '#7C4DFF',
  present: '#FF6B9D',
  absent: '#455A64',
  keyDefault: '#546E7A',
  white: '#ffffff',
  bg: '#1A1A2E',
  primary: '#7C4DFF',
  secondary: '#00BFA5',
};

export const initialGuesses: guess[] = [
  {
    id: 0,
    letters: ['', '', '', '', ''],
    matches: ['', '', '', '', ''],
    isComplete: false,
    isCorrect: false,
  },
  {
    id: 1,
    letters: ['', '', '', '', ''],
    matches: ['', '', '', '', ''],
    isComplete: false,
    isCorrect: false,
  },
  {
    id: 2,
    letters: ['', '', '', '', ''],
    matches: ['', '', '', '', ''],
    isComplete: false,
    isCorrect: false,
  },
  {
    id: 3,
    letters: ['', '', '', '', ''],
    matches: ['', '', '', '', ''],
    isComplete: false,
    isCorrect: false,
  },
  {
    id: 4,
    letters: ['', '', '', '', ''],
    matches: ['', '', '', '', ''],
    isComplete: false,
    isCorrect: false,
  },
  {
    id: 5,
    letters: ['', '', '', '', ''],
    matches: ['', '', '', '', ''],
    isComplete: false,
    isCorrect: false,
  },
];
