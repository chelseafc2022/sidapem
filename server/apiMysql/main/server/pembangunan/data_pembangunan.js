const express = require('express');
var db = require('../../../../db/MySql/umum');
const router = express.Router();

// view menggunakan parameterized where
router.post('/view', (req, res) => {
  const data_batas = parseInt(req.body.page_limit) || 10;
  const data_star = ((req.body.data_ke ? parseInt(req.body.data_ke) : 1) - 1) * data_batas;
  const unit_kerja = req.body.unit_kerja || '';
  const tahun = req.body.tahun || '';

  let where = '1=1';
  const params = [];

  if (unit_kerja) {
    where += ' AND unit_kerja = ?';
    params.push(unit_kerja);
  }
  if (tahun) {
    where += ' AND yy = ?';
    params.push(tahun);
  }

  const countSql = `SELECT COUNT(*) as cnt FROM sidapem.data_pembangunan WHERE ${where}`;
  db.query(countSql, params, (err, cntRes) => {
    if (err) return res.status(500).json(err);
    const totalRows = cntRes[0].cnt || 0;
    const halaman = Math.max(1, Math.ceil(totalRows / data_batas));

    const viewSql = `
      SELECT id, kode_rup_kontrak, nama_paket, lokasi_kegiatan, jenis_pengadaan,
             metode_pemilihan, nilai_pagu, nilai_kontrak, nomor_kontrak, pemenang_tender, keterangan,
             tgl_mulai, tgl_selesai, realisasi_fisik, realisasi_keuangan, realisasi_persen,
             sumber_dana, dd, mm, yy, unit_kerja, instansi
      FROM sidapem.data_pembangunan
      WHERE ${where}
      ORDER BY id DESC
      LIMIT ?, ?
    `;
    const viewParams = params.concat([data_star, data_batas]);
    db.query(viewSql, viewParams, (err2, rows) => {
      if (err2) return res.status(500).json(err2);

      const totalsSql = `
        SELECT COALESCE(SUM(nilai_pagu),0) AS jml_pagu,
               COALESCE(SUM(nilai_kontrak),0) AS jml_nilaikontrak,
               COALESCE(SUM(COALESCE(realisasi_keuangan,0)),0) AS jml_realisasikeuangan,
               COALESCE(SUM(COALESCE(realisasi_fisik,0)),0) AS sum_realisasifisik,
               COUNT(*) AS jml_data_total
        FROM sidapem.data_pembangunan
        WHERE ${where}
      `;
      db.query(totalsSql, params, (err3, tRes) => {
        if (err3) return res.status(500).json(err3);
        const t = tRes[0] || {};
        let jml_realisasipersen = 0;
        const total_nilai_kontrak = Number(t.jml_nilaikontrak) || 0;
        const total_realisasi_keuangan = Number(t.jml_realisasikeuangan) || 0;
        if (total_nilai_kontrak > 0) {
          jml_realisasipersen = Number(((total_realisasi_keuangan / total_nilai_kontrak) * 100).toFixed(2));
        }
        const jml_realisasifisik = t.jml_data_total ? Number((Number(t.sum_realisasifisik) / Number(t.jml_data_total)).toFixed(2)) : 0;

        return res.json({
          data: rows,
          jml_data: halaman,
          jml_pagu: t.jml_pagu || 0,
          jml_nilaikontrak: t.jml_nilaikontrak || 0,
          jml_realisasifisik: jml_realisasifisik,
          jml_realisasikeuangan: t.jml_realisasikeuangan || 0,
          jml_realisasipersen: jml_realisasipersen
        });
      });
    });
  });
});

router.post('/updateRealisasi', (req, res) => {
  const id = req.body.id;
  if (!id) return res.status(400).json({ error: 'missing id' });

  const realisasi_fisik = (req.body.realisasi_fisik === '' || req.body.realisasi_fisik === null) ? null : Number(req.body.realisasi_fisik);
  const realisasi_keuangan = Number(req.body.realisasi_keuangan) || 0;
  const keterangan = req.body.keterangan || '';

  // ambil nilai_kontrak & nilai_pagu dari DB dulu (untuk hitung persen)
  db.query('SELECT nilai_kontrak, nilai_pagu FROM sidapem.data_pembangunan WHERE id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'data not found' });

    const row = rows[0];
    const nilai_kontrak = Number(row.nilai_kontrak) || 0;
    const nilai_pagu = Number(row.nilai_pagu) || 0;

    let realisasi_persen = null;
    if (nilai_kontrak > 0) {
      realisasi_persen = (realisasi_keuangan / nilai_kontrak) * 100;
    } else if (nilai_pagu > 0) {
      realisasi_persen = (realisasi_keuangan / nilai_pagu) * 100;
    }
    if (realisasi_persen !== null && !isNaN(realisasi_persen)) {
      realisasi_persen = Math.round(realisasi_persen * 100) / 100;
    } else {
      realisasi_persen = null;
    }

    const q = `
      UPDATE sidapem.data_pembangunan
      SET realisasi_fisik = ?, realisasi_keuangan = ?, realisasi_persen = ?, keterangan = ?, editeBy = ?, editeAt = NOW()
      WHERE id = ?
    `;
    const vals = [realisasi_fisik, realisasi_keuangan, realisasi_persen, keterangan, (req.user && req.user._id) ? req.user._id : '', id];

    db.query(q, vals, (err2, result) => {
      if (err2) return res.status(500).json(err2);
      return res.json({ success: true, result });
    });
  });
});

// (di file router data_pembangunan)
// gantikan handler addData Anda dengan ini (paste menggantikan fungsi lama)
router.post('/addData', (req, res) => {
  console.log('==> addData called, body:', JSON.stringify(req.body).slice(0,2000));

  try {
    const nilai_pagu = Number(req.body.nilai_pagu) || 0;
    const nilai_kontrak = Number(req.body.nilai_kontrak) || 0;

    const tgl_mulai = req.body.tgl_mulai || null;
    const tgl_selesai = req.body.tgl_selesai || null;

    // dd, mm, yy fallback
    let dd = (typeof req.body.dd !== 'undefined') ? req.body.dd : null;
    let mm = (typeof req.body.mm !== 'undefined') ? req.body.mm : null;
    let yy = (typeof req.body.yy !== 'undefined') ? req.body.yy : null;

    // if ((!dd || !mm || !yy) && req.body.tgl_mulai) {
    //   const d = new Date(req.body.tgl_mulai);
    //   dd = d.getDate();
    //   mm = d.getMonth() + 1;
    //   yy = d.getFullYear();
    // }

    if ((!dd || !mm || !yy) && req.body.tgl_mulai) {
      const tglStr = req.body.tgl_mulai.toString(); // Pastikan string
      if (/^\d{4}-\d{2}-\d{2}$/.test(tglStr)) { // Validasi format YYYY-MM-DD
        const d = new Date(tglStr);
        if (!isNaN(d.getTime())) { // Pastikan Date valid
          dd = d.getDate();
          mm = d.getMonth() + 1;
          yy = d.getFullYear();
        }
      } else if (/^\d{4}$/.test(tglStr)) { // Jika hanya tahun (misal "2012")
        yy = parseInt(tglStr);
        dd = null;
        mm = null;
      }
      // Jika tidak valid, biarkan dd/mm/yy null atau throw error
    }

    const sql = `
      INSERT INTO sidapem.data_pembangunan
      (kode_rup_kontrak, nama_paket, lokasi_kegiatan, metode_pemilihan, jenis_pengadaan,
       nilai_pagu, nilai_kontrak, nomor_kontrak, tgl_mulai, tgl_selesai,
       sumber_dana, satuan_kerja, pemenang_tender, keterangan, dd, mm, yy,
       instansi, unit_kerja, createBy, createAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      req.body.kode_rup_kontrak || '',
      req.body.nama_paket || '',
      req.body.lokasi_kegiatan || '',
      req.body.metode_pemilihan || '',
      req.body.jenis_pengadaan || '',
      nilai_pagu,
      nilai_kontrak,
      req.body.nomor_kontrak || '',
      tgl_mulai,
      tgl_selesai,
      req.body.sumber_dana || '',
      req.body.satuan_kerja || '',
      req.body.pemenang_tender || '',
      req.body.keterangan || '',
      (dd !== '' && dd !== null ? dd : null),
      (mm !== '' && mm !== null ? mm : null),
      (yy !== '' && yy !== null ? yy : null),
      req.body.instansi || '',
      req.body.unit_kerja || '',
      (req.user && req.user._id) ? req.user._id : ''
    ];

    console.log('addData - prepared SQL values:', values);

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('addData - db error:', err);
        // return full error for debugging (you can remove stack in production)
        return res.status(500).json({ success: false, error: err && err.message ? err.message : err });
      }

      console.log('addData - db result:', result);
      // result may be OkPacket with affectedRows and insertId
      if (result && result.affectedRows && result.affectedRows > 0) {
        console.log('addData - success insertId:', result.insertId);
        return res.json({ success: true, insertId: result.insertId });
      } else {
        console.warn('addData - no rows inserted, result:', result);
        return res.json({ success: false, message: 'No rows inserted', meta: result });
      }
    });
  } catch (e) {
    console.error('addData - exception:', e);
    return res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/editData', (req, res) => {
  try {
    const id = req.body.id;
    if (!id) return res.status(400).json({ success: false, error: 'missing id' });

    // helper lokal
    function toMySQLDateOnly(value) {
      if (!value && value !== 0) return null;
      const d = (value instanceof Date) ? value : new Date(value);
      if (isNaN(d.getTime())) return null;
      const Y = d.getUTCFullYear();
      const M = String(d.getUTCMonth() + 1).padStart(2, '0');
      const D = String(d.getUTCDate()).padStart(2, '0');
      return `${Y}-${M}-${D}`;
    }

    const nilai_pagu = Number(req.body.nilai_pagu) || 0;
    const nilai_kontrak = Number(req.body.nilai_kontrak) || 0;

    // normalize tanggal dengan format YYYY-MM-DD (untuk kolom DATE)
    const tgl_mulai = toMySQLDateOnly(req.body.tgl_mulai);
    const tgl_selesai = toMySQLDateOnly(req.body.tgl_selesai);

    let dd = (typeof req.body.dd !== 'undefined' && req.body.dd !== '') ? req.body.dd : null;
    let mm = (typeof req.body.mm !== 'undefined' && req.body.mm !== '') ? req.body.mm : null;
    let yy = (typeof req.body.yy !== 'undefined' && req.body.yy !== '') ? req.body.yy : null;

    if ((!dd || !mm || !yy) && tgl_mulai) {
      const d = new Date(tgl_mulai + 'T00:00:00Z');
      dd = d.getUTCDate();
      mm = d.getUTCMonth() + 1;
      yy = d.getUTCFullYear();
    }

    // Build update SQL (parameterized). We intentionally DO NOT change realisasi_* here;
    // use updateRealisasi route for that.
    const sql = `
      UPDATE sidapem.data_pembangunan SET
        kode_rup_kontrak = ?,
        nama_paket = ?,
        lokasi_kegiatan = ?,
        metode_pemilihan = ?,
        jenis_pengadaan = ?,
        nilai_pagu = ?,
        nilai_kontrak = ?,
        nomor_kontrak = ?,
        tgl_mulai = ?,
        tgl_selesai = ?,
        sumber_dana = ?,
        satuan_kerja = ?,     -- if you don't use this, map frontend to send ''
        pemenang_tender = ?,
        keterangan = ?,
        dd = ?,
        mm = ?,
        yy = ?,
        unit_kerja = ?,
        instansi = ?,
        editeBy = ?,
        editeAt = NOW()
      WHERE id = ?
    `;

    const values = [
      req.body.kode_rup_kontrak || '',
      req.body.nama_paket || '',
      req.body.lokasi_kegiatan || '',
      req.body.metode_pemilihan || '',
      req.body.jenis_pengadaan || '',
      nilai_pagu,
      nilai_kontrak,
      req.body.nomor_kontrak || '',
      req.body.tgl_mulai || null,
      req.body.tgl_selesai || null,
      req.body.sumber_dana || '',
      req.body.satuan_kerja || '',   // <-- pastikan frontend mengirim atau diganti jadi req.body.unit_kerja
      req.body.pemenang_tender || '',
      req.body.keterangan || '',
      dd,
      mm,
      yy,
      req.body.unit_kerja || '',
      req.body.instansi || '',
      (req.user && req.user._id ? req.user._id : ''),
      id
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('editData - db error:', err);
        return res.status(500).json({ success: false, error: err && err.message ? err.message : err });
      }

      // Return updated row for convenience to frontend
      db.query('SELECT * FROM sidapem.data_pembangunan WHERE id = ?', [id], (err2, rows) => {
        if (err2) {
          console.error('editData - select after update error:', err2);
          return res.json({ success: true, result, updated: null });
        }
        return res.json({ success: true, result, updated: rows[0] || null });
      });
    });

  } catch (e) {
    console.error('editData - exception:', e);
    return res.status(500).json({ success: false, error: e.message });
  }
});



// REMOVE DATA
router.post('/removeData', (req, res) => {
    console.log('/removeData body => ', req.body);

    const id = req.body.id || '';

    if (!id) {
        return res.status(400).json({ error: 'missing id' });
    }

    const query = `DELETE FROM sidapem.data_pembangunan WHERE id = ?`;
    db.query(query, [id], (err, row) => {
        if (err) {
            console.log('removeData error:', err);
            return res.status(500).send(err);
        }
        return res.send(row);
    });
});

module.exports = router;
