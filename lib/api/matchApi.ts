'use client';

import { Match } from '../types/match';

const STORAGE_KEY = 'matches';

export const matchApi = {
  async getAll(): Promise<Match[]> {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  async getById(id: number): Promise<Match | null> {
    const matches = await this.getAll();
    return matches.find(match => match.id === id) || null;
  },

  async create(match: Omit<Match, 'id'>): Promise<Match> {
    const matches = await this.getAll();
    const newMatch: Match = {
      ...match,
      id: matches.length > 0 ? Math.max(...matches.map(m => m.id)) + 1 : 1
    };
    matches.push(newMatch);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
    return newMatch;
  },

  async update(id: number, updates: Partial<Match>): Promise<Match | null> {
    const matches = await this.getAll();
    const index = matches.findIndex(match => match.id === id);
    if (index === -1) return null;
    
    matches[index] = { ...matches[index], ...updates, id };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
    return matches[index];
  },

  async delete(id: number): Promise<boolean> {
    const matches = await this.getAll();
    const filteredMatches = matches.filter(match => match.id !== id);
    if (filteredMatches.length === matches.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredMatches));
    return true;
  }
};
