/**
 * Word service implementation for managing game words
 */

import { IWordService } from '../interfaces';
import { GameWord, Difficulty } from '../types';

/**
 * Service for managing words used in the Pictionary game
 * Implements IWordService interface following Dependency Inversion Principle
 */
export class WordService implements IWordService {
  private readonly words: Map<Difficulty, GameWord[]> = new Map();

  constructor() {
    this.initializeWords();
  }

  /**
   * Initializes the word database with predefined words
   * @private
   */
  private initializeWords(): void {
    // Easy words - simple, common objects
    const easyWords: GameWord[] = [
      {
        id: 'easy_1',
        word: 'cat',
        difficulty: Difficulty.EASY,
        category: 'animals',
        hints: ['It has whiskers', 'It says meow'],
      },
      {
        id: 'easy_2',
        word: 'house',
        difficulty: Difficulty.EASY,
        category: 'buildings',
        hints: ['People live in it', 'It has a roof'],
      },
      {
        id: 'easy_3',
        word: 'sun',
        difficulty: Difficulty.EASY,
        category: 'nature',
        hints: ['It shines in the sky', 'It gives us light'],
      },
      {
        id: 'easy_4',
        word: 'car',
        difficulty: Difficulty.EASY,
        category: 'vehicles',
        hints: ['It has four wheels', 'People drive it'],
      },
      {
        id: 'easy_5',
        word: 'tree',
        difficulty: Difficulty.EASY,
        category: 'nature',
        hints: ['It has leaves', 'Birds nest in it'],
      },
    ];

    // Medium words - more complex concepts
    const mediumWords: GameWord[] = [
      {
        id: 'medium_1',
        word: 'butterfly',
        difficulty: Difficulty.MEDIUM,
        category: 'animals',
        hints: ['It has colorful wings', 'It was once a caterpillar'],
      },
      {
        id: 'medium_2',
        word: 'telescope',
        difficulty: Difficulty.MEDIUM,
        category: 'objects',
        hints: ['Used to see far away', 'Astronomers use it'],
      },
      {
        id: 'medium_3',
        word: 'rainbow',
        difficulty: Difficulty.MEDIUM,
        category: 'nature',
        hints: ['Appears after rain', 'Has seven colors'],
      },
      {
        id: 'medium_4',
        word: 'lighthouse',
        difficulty: Difficulty.MEDIUM,
        category: 'buildings',
        hints: ['Guides ships at sea', 'Has a bright light on top'],
      },
      {
        id: 'medium_5',
        word: 'volcano',
        difficulty: Difficulty.MEDIUM,
        category: 'nature',
        hints: ['It can erupt', 'Lava comes from it'],
      },
    ];

    // Hard words - abstract concepts and complex objects
    const hardWords: GameWord[] = [
      {
        id: 'hard_1',
        word: 'democracy',
        difficulty: Difficulty.HARD,
        category: 'concepts',
        hints: ['A form of government', 'People vote in it'],
      },
      {
        id: 'hard_2',
        word: 'photosynthesis',
        difficulty: Difficulty.HARD,
        category: 'science',
        hints: ['Plants do this', 'Converts sunlight to energy'],
      },
      {
        id: 'hard_3',
        word: 'constellation',
        difficulty: Difficulty.HARD,
        category: 'astronomy',
        hints: ['Pattern of stars', 'Big Dipper is one'],
      },
      {
        id: 'hard_4',
        word: 'metamorphosis',
        difficulty: Difficulty.HARD,
        category: 'science',
        hints: ['A transformation process', 'Caterpillar to butterfly'],
      },
      {
        id: 'hard_5',
        word: 'archaeology',
        difficulty: Difficulty.HARD,
        category: 'science',
        hints: ['Study of ancient things', 'Involves digging up artifacts'],
      },
    ];

    this.words.set(Difficulty.EASY, easyWords);
    this.words.set(Difficulty.MEDIUM, mediumWords);
    this.words.set(Difficulty.HARD, hardWords);
  }

  /**
   * Gets a random word based on the specified difficulty
   * @param difficulty - Difficulty level for word selection
   * @returns Promise resolving to a random word
   */
  public async getRandomWord(difficulty: string): Promise<GameWord> {
    const difficultyEnum = difficulty as Difficulty;
    const wordsForDifficulty = this.words.get(difficultyEnum);

    if (!wordsForDifficulty || wordsForDifficulty.length === 0) {
      throw new Error(`No words available for difficulty: ${difficulty}`);
    }

    const randomIndex = Math.floor(Math.random() * wordsForDifficulty.length);
    const selectedWord = wordsForDifficulty[randomIndex];

    if (!selectedWord) {
      throw new Error(`Failed to select word for difficulty: ${difficulty}`);
    }

    return selectedWord;
  }

  /**
   * Gets all available words for a specific difficulty
   * @param difficulty - Difficulty level
   * @returns Promise resolving to array of words
   */
  public async getWordsByDifficulty(difficulty: string): Promise<GameWord[]> {
    const difficultyEnum = difficulty as Difficulty;
    const wordsForDifficulty = this.words.get(difficultyEnum);

    if (!wordsForDifficulty) {
      return [];
    }

    return [...wordsForDifficulty]; // Return a copy to prevent external modification
  }

  /**
   * Validates if a guess matches the target word
   * @param guess - The guessed word
   * @param targetWord - The word to match against
   * @returns Whether the guess is correct
   */
  public validateGuess(guess: string, targetWord: string): boolean {
    if (!guess || !targetWord) {
      return false;
    }

    // Normalize both strings for comparison
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedTarget = targetWord.toLowerCase().trim();

    return normalizedGuess === normalizedTarget;
  }

  /**
   * Adds a new word to the service
   * @param word - The word to add
   */
  public addWord(word: GameWord): void {
    const wordsForDifficulty = this.words.get(word.difficulty);
    if (wordsForDifficulty) {
      wordsForDifficulty.push(word);
    } else {
      this.words.set(word.difficulty, [word]);
    }
  }

  /**
   * Gets the total number of words available
   * @returns Total word count
   */
  public getTotalWordCount(): number {
    let total = 0;
    for (const wordList of this.words.values()) {
      total += wordList.length;
    }
    return total;
  }

  /**
   * Gets word count for a specific difficulty
   * @param difficulty - Difficulty level
   * @returns Word count for the specified difficulty
   */
  public getWordCountForDifficulty(difficulty: Difficulty): number {
    const wordsForDifficulty = this.words.get(difficulty);
    return wordsForDifficulty ? wordsForDifficulty.length : 0;
  }
}
