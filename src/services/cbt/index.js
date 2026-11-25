import { mockAdapter } from './mockAdapter.js';

// Titik penggantian adapter: saat endpoint CBT tersedia, ganti ekspor ini
// dengan adapter berbasis HTTP tanpa mengubah pemanggil di UI.
export const cbtAdapter = mockAdapter;
