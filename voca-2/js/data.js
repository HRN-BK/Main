import { supabase } from './supabase.js';

export async function addVocabulary(word, definition) {
  const { data, error } = await supabase.from('vocabulary').insert({ word, definition });
  if (error) throw error;
  return data;
}

export async function getVocabulary() {
  const { data, error } = await supabase.from('vocabulary').select('*').order('id');
  if (error) throw error;
  return data;
}

export async function addSymbol(symbol, value) {
  const { data, error } = await supabase.from('symbols').insert({ symbol, value });
  if (error) throw error;
  return data;
}

export async function getSymbols() {
  const { data, error } = await supabase.from('symbols').select('*').order('id');
  if (error) throw error;
  return data;
}

export async function addFormula(formula, description) {
  const { data, error } = await supabase.from('formulas').insert({ formula, description });
  if (error) throw error;
  return data;
}

export async function getFormulas() {
  const { data, error } = await supabase.from('formulas').select('*').order('id');
  if (error) throw error;
  return data;
}
