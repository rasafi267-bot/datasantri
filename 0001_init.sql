CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS santri (
  id TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  nama TEXT NOT NULL,
  nis TEXT,
  nisn TEXT,
  kelas TEXT,
  kamar TEXT,
  blok TEXT,
  tempat_lahir TEXT,
  tanggal_lahir TEXT,
  alamat TEXT,
  wali TEXT,
  kontak_wali TEXT,
  foto_url TEXT,
  status TEXT DEFAULT 'Aktif',
  catatan TEXT
);

CREATE TABLE IF NOT EXISTS pelanggaran (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_santri TEXT NOT NULL,
  tanggal TEXT,
  bentuk TEXT,
  kategori TEXT,
  poin TEXT,
  keterangan TEXT
);

CREATE TABLE IF NOT EXISTS spp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_santri TEXT NOT NULL,
  bulan TEXT,
  tagihan INTEGER DEFAULT 0,
  dibayar INTEGER DEFAULT 0,
  status TEXT,
  keterangan TEXT
);

CREATE TABLE IF NOT EXISTS dekosan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_santri TEXT NOT NULL,
  bulan TEXT,
  tagihan INTEGER DEFAULT 0,
  dibayar INTEGER DEFAULT 0,
  status TEXT,
  keterangan TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT,
  tanggal TEXT,
  waktu TEXT,
  tempat TEXT,
  deskripsi TEXT,
  poster TEXT
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT,
  jabatan TEXT,
  nomor TEXT,
  keterangan TEXT
);

CREATE INDEX IF NOT EXISTS idx_pelanggaran_santri ON pelanggaran(id_santri);
CREATE INDEX IF NOT EXISTS idx_spp_santri ON spp(id_santri);
CREATE INDEX IF NOT EXISTS idx_dekosan_santri ON dekosan(id_santri);

INSERT OR IGNORE INTO admins(username,password) VALUES ('admin','kantorbebe');