const express = require('express');
var db = require('../../../../db/MySql/umum');
const router = express.Router();

router.post('/view', (req, res) => {
    var data_batas = parseInt(req.body.page_limit) || 10;
    var data_star = ((req.body.data_ke ? parseInt(req.body.data_ke) : 1) - 1) * data_batas;
    var cari = req.body.cari_value || '';
    var halaman = 1;

    var unit_kerja = (req.body.unit_kerja ? req.body.unit_kerja : '');
    var tahun = (req.body.tahun ? req.body.tahun : '');

    let jml_data = `
        SELECT id
        FROM monev_pembangunan.realisasi_fisik_keuangan
        WHERE
          (unit_kerja = '`+ unit_kerja + `'
            AND yy = `+ tahun + `)
    `;

    let view = `
        SELECT *
        FROM monev_pembangunan.realisasi_fisik_keuangan
        WHERE
          (unit_kerja = '`+ unit_kerja + `'
            AND yy = `+ tahun + `)
        ORDER BY id DESC
        LIMIT `+ data_star + `,` + data_batas + `
    `;

    // totals: gunakan SUM kolom uang dan SUM kolom persen/fisik (untuk lain2)
    let totals = `
      SELECT 
        COALESCE(SUM(pagu_anggaran),0) AS jml_pagu,
        COALESCE(SUM(nilai_kontrak),0) AS jml_nilaikontrak,
        COALESCE(SUM(realisasi_keuangan),0) AS jml_realisasikeuangan,
        COALESCE(SUM(realisasi_fisik),0) AS sum_realisasifisik,
        COUNT(*) AS jml_data_total
      FROM monev_pembangunan.realisasi_fisik_keuangan
      WHERE
        (unit_kerja = '`+ unit_kerja + `'
          AND yy = `+ tahun + `)
    `;

    db.query(jml_data, (err, row) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        } else {
            halaman = Math.ceil(row.length / data_batas);
            if (halaman < 1) { halaman = 1; }
            db.query(view, (err1, result) => {
                if (err1) {
                    console.log(err1);
                    return res.status(500).json(err1);
                } else {
                    db.query(totals, (err2, totals_res) => {
                        if (err2) {
                            console.log('totals query error', err2);
                            return res.json({
                                data: result,
                                jml_data: halaman,
                                jml_pagu: 0,
                                jml_nilaikontrak: 0,
                                jml_realisasifisik: 0,
                                jml_realisasikeuangan: 0,
                                jml_realisasipersen: 0
                            });
                        } else {
                            const t = totals_res[0] || {};

                            // compute jml_realisasipersen using totals (Excel-style)
                            let jml_realisasipersen = 0;
                            const total_nilai_kontrak = Number(t.jml_nilaikontrak) || 0;
                            const total_realisasi_keuangan = Number(t.jml_realisasikeuangan) || 0;

                            if (total_nilai_kontrak > 0) {
                                jml_realisasipersen = (total_realisasi_keuangan / total_nilai_kontrak) * 100;
                            } else {
                                // jika nilai_kontrak = 0, kita set 0.
                                // jika kamu ingin fallback ke pagu_anggaran, ubah di sini.
                                jml_realisasipersen = 0;
                            }

                            // untuk realisasi_fisik: user minta perhitungan persen juga.
                            // di sini saya asumsikan kamu mau RATA-RATA fisik:
                            let jml_realisasifisik = 0;
                            const total_sum_fisik = Number(t.sum_realisasifisik) || 0;
                            const total_count = Number(t.jml_data_total) || 0;
                            if (total_count > 0) {
                                jml_realisasifisik = total_sum_fisik / total_count;
                            } else {
                                jml_realisasifisik = 0;
                            }

                            // rounding 2 decimal
                            jml_realisasipersen = Number(jml_realisasipersen.toFixed(2));
                            jml_realisasifisik = Number(jml_realisasifisik.toFixed(2));

                            return res.json({
                                data: result,
                                jml_data: halaman,
                                jml_pagu: t.jml_pagu || 0,
                                jml_nilaikontrak: t.jml_nilaikontrak || 0,
                                jml_realisasifisik: jml_realisasifisik,
                                jml_realisasikeuangan: t.jml_realisasikeuangan || 0,
                                jml_realisasipersen: jml_realisasipersen
                            });
                        }
                    });
                }
            });
        }
    });
});



// ADD
router.post('/addData', (req, res) => {
    console.log('/addData body => ', req.body);

    // parse numeric fields safely
    const pagu_anggaran = Number(req.body.pagu_anggaran) || 0;
    const nilai_kontrak = Number(req.body.nilai_kontrak) || 0;
    const realisasi_keuangan = Number(req.body.realisasi_keuangan) || 0;
    const realisasi_fisik = (req.body.realisasi_fisik !== undefined && req.body.realisasi_fisik !== null && req.body.realisasi_fisik !== '') ? Number(req.body.realisasi_fisik) : null;
    const sumber_dana = req.body.sumber_dana || null;

    // hitung realisasi_persen di server (jika nilai_kontrak > 0)
    let realisasi_persen = null;

    if (nilai_kontrak > 0) {
        // pakai nilai kontrak
        realisasi_persen = (realisasi_keuangan / nilai_kontrak) * 100;
    } else if (pagu_anggaran > 0) {
        // fallback pakai pagu
        realisasi_persen = (realisasi_keuangan / pagu_anggaran) * 100;
    } else {
        realisasi_persen = null;
    }

    // pembulatan 2 decimal
    if (realisasi_persen !== null && !isNaN(realisasi_persen)) {
        realisasi_persen = Math.round(realisasi_persen * 100) / 100;
    } else {
        realisasi_persen = null;
    }

    // dd/mm/yy mungkin dikirim dari frontend; kalau tidak, coba ambil dari tgl_mulai
    let dd = req.body.dd || '';
    let mm = req.body.mm || '';
    let yy = req.body.yy || '';  // Ambil yy dari input pengguna
    if ((!dd || !mm) && req.body.tgl_mulai) {
        const d = new Date(req.body.tgl_mulai);
        dd = d.getDate();
        mm = d.getMonth() + 1;
    }
    // Jika yy masih kosong, fallback ke tahun dari tgl_mulai
    if (!yy && req.body.tgl_mulai) {
        const d = new Date(req.body.tgl_mulai);
        yy = d.getFullYear();
    }

    let insert = `
      INSERT INTO monev_pembangunan.realisasi_fisik_keuangan
      (
        jenis_kegiatan, uraian, pagu_anggaran, nilai_kontrak, nomor_kontrak,
        tgl_mulai, tgl_berakhir, realisasi_fisik, realisasi_keuangan, realisasi_persen,
        sumber_dana, keterangan, dd, mm, yy, unit_kerja, createBy, createAt
      ) VALUES (
        '`+ (req.body.jenis_kegiatan || '') + `',
        '`+ (req.body.uraian || '') + `',
        `+ pagu_anggaran + `,
        `+ nilai_kontrak + `,
        '`+ (req.body.nomor_kontrak || '') + `',
        '`+ (req.body.tgl_mulai || '') + `',
        '`+ (req.body.tgl_berakhir || '') + `',
        `+ (realisasi_fisik === null ? 'NULL' : realisasi_fisik) + `,
        `+ realisasi_keuangan + `,
        `+ (realisasi_persen === null ? 'NULL' : realisasi_persen) + `,
        `+ (sumber_dana ? ("'" + sumber_dana + "'") : "NULL") + `,
        '`+ (req.body.keterangan || '') + `',
        `+ (dd !== '' ? dd : "NULL") + `,
        `+ (mm !== '' ? mm : "NULL") + `,
        `+ (yy !== '' ? yy : "NULL") + `,
        '`+ (req.body.unit_kerja || '') + `',
        '`+ (req.user && req.user._id ? req.user._id : '') + `',
        NOW()
      )
    `;

    db.query(insert, (err, row) => {
        if (err) {
            console.log('addData error:', err);
            res.status(500).send(err);
        } else {
            res.send(row);
        }
    });
});
// EDIT DATA
router.post('/editData', (req, res) => {
    console.log('/editData body => ', req.body);

    // ambil dan parse nilai numerik
    const id = req.body.id || '';
    const pagu_anggaran = Number(req.body.pagu_anggaran) || 0;
    const nilai_kontrak = Number(req.body.nilai_kontrak) || 0;
    const realisasi_keuangan = Number(req.body.realisasi_keuangan) || 0;
    const realisasi_fisik = (req.body.realisasi_fisik !== undefined && req.body.realisasi_fisik !== null && req.body.realisasi_fisik !== '')
        ? Number(req.body.realisasi_fisik)
        : null;
    const sumber_dana = req.body.sumber_dana || null;

    // HITUNG realisasi_persen seperti di addData:
    let realisasi_persen = null;
    if (nilai_kontrak > 0) {
        realisasi_persen = (realisasi_keuangan / nilai_kontrak) * 100;
    } else if (pagu_anggaran > 0) {
        realisasi_persen = (realisasi_keuangan / pagu_anggaran) * 100;
    } else {
        realisasi_persen = null;
    }
    if (realisasi_persen !== null && !isNaN(realisasi_persen)) {
        realisasi_persen = Math.round(realisasi_persen * 100) / 100; // 2 decimal
    } else {
        realisasi_persen = null;
    }

    // dd/mm/yy fallback dari tgl_mulai bila belum dikirim
    let dd = req.body.dd || '';
    let mm = req.body.mm || '';
    let yy = req.body.yy || '';  // Ambil yy dari input pengguna
    if ((!dd || !mm) && req.body.tgl_mulai) {
        const d = new Date(req.body.tgl_mulai);
        dd = d.getDate();
        mm = d.getMonth() + 1;
    }
    // Jika yy masih kosong, fallback ke tahun dari tgl_mulai
    if (!yy && req.body.tgl_mulai) {
        const d = new Date(req.body.tgl_mulai);
        yy = d.getFullYear();
    }

    // build UPDATE query (tidak ada file handling)
    let query = `
      UPDATE monev_pembangunan.realisasi_fisik_keuangan SET
        jenis_kegiatan = '`+ (req.body.jenis_kegiatan || '') + `',
        uraian = '`+ (req.body.uraian || '') + `',
        pagu_anggaran = `+ pagu_anggaran + `,
        nilai_kontrak = `+ nilai_kontrak + `,
        nomor_kontrak = '`+ (req.body.nomor_kontrak || '') + `',
        tgl_mulai = '`+ (req.body.tgl_mulai || '') + `',
        tgl_berakhir = '`+ (req.body.tgl_berakhir || '') + `',
        realisasi_fisik = `+ (realisasi_fisik === null ? 'NULL' : realisasi_fisik) + `,
        realisasi_keuangan = `+ realisasi_keuangan + `,
        realisasi_persen = `+ (realisasi_persen === null ? 'NULL' : realisasi_persen) + `,
        sumber_dana = `+ (sumber_dana ? ("'" + sumber_dana + "'") : "NULL") + `,
        keterangan = '`+ (req.body.keterangan || '') + `',
        dd = `+ (dd !== '' ? dd : "NULL") + `,
        mm = `+ (mm !== '' ? mm : "NULL") + `,
        yy = `+ (yy !== '' ? yy : "NULL") + `,
        unit_kerja = '`+ (req.body.unit_kerja || '') + `',
        editeBy = '`+ (req.user && req.user._id ? req.user._id : '') + `',
        editeAt = NOW()
      WHERE id = '`+ id + `'
    `;

    db.query(query, (err, row) => {
        if (err) {
            console.log('editData error:', err);
            return res.status(500).send(err);
        }
        return res.send(row);
    });
});


// REMOVE DATA
router.post('/removeData', (req, res) => {
    console.log('/removeData body => ', req.body);

    const id = req.body.id || '';

    if (!id) {
        return res.status(400).json({ error: 'missing id' });
    }

    // jika nanti ada file, tambahkan hapus_file logic di sini
    const query = `
      DELETE FROM monev_pembangunan.realisasi_fisik_keuangan
      WHERE id = '`+ id + `'
    `;

    db.query(query, (err, row) => {
        if (err) {
            console.log('removeData error:', err);
            return res.status(500).send(err);
        }
        return res.send(row);
    });
});

module.exports = router;
