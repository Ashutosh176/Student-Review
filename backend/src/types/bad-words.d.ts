declare module 'bad-words' {
  export default class Filter {
    constructor(options?: { emptyList?: boolean });
    isProfane(text: string): boolean;
    clean(text: string): string;
    addWords(...words: string[]): void;
    removeWords(...words: string[]): void;
    list: string[];
  }
}
