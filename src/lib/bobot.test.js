import test from 'node:test';
import assert from 'node:assert/strict';
import { validasiBobot } from './bobot.js';

test('total 101 ditolak', () => {
  assert.deepEqual(validasiBobot([{ bobot: 60 }, { bobot: 41 }]), {
    valid: false,
    errors: ['Total bobot tidak boleh lebih dari 100'],
  });
});

test('total 100 diterima', () => {
  assert.deepEqual(validasiBobot([{ bobot: 60 }, { bobot: 40 }]), { valid: true, errors: [] });
});

test('total 80 tidak dinormalisasi', () => {
  assert.deepEqual(validasiBobot([{ bobot: 80 }]), { valid: true, errors: [] });
});

test('bobot negatif ditolak meskipun totalnya 100', () => {
  assert.deepEqual(validasiBobot([{ bobot: 150 }, { bobot: -50 }]), {
    valid: false,
    errors: ['Bobot tidak boleh negatif'],
  });
});

test('bobot bukan angka ditolak', () => {
  assert.deepEqual(validasiBobot([{ bobot: Number('abc') }]), {
    valid: false,
    errors: ['Bobot harus berupa angka'],
  });
});

test('bobot tak hingga ditolak', () => {
  assert.deepEqual(validasiBobot([{ bobot: Infinity }]), {
    valid: false,
    errors: ['Bobot harus berupa angka'],
  });
});

test('bobot berupa teks ditolak', () => {
  assert.deepEqual(validasiBobot([{ bobot: '50' }]), {
    valid: false,
    errors: ['Bobot harus berupa angka'],
  });
});
