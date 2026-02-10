<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="main1 text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6 h_titleHead">Realisasi Fisik dan Keuangan</div>
            <div class="text-subtitle2">Realisasi Fisik dan Keuangan</div>
          </div>
          <div class="col-12 col-md-2"></div>
          <div class="col-12 col-md-4">
            <div class="row">
              <q-input v-model="cari_value" @keyup.enter="cari_data()" outlined square :dense="true" class="bg-white"
                style="width:90%" placeholder="Cari..." />
              <q-btn glossy class="bg-light-blue-10" @click="getView()" dense flat icon="refresh" style="width:10%">
                <q-tooltip content-class="bg-light-blue-10" content-style="font-size: 13px">
                  Refresh
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section>
        <div class="row">
          <div class="col-12 col-md-4 rowLeft" v-if="sidapem == 2 || sidapem == 3">
            <span class="h_lable ">Unit Kerja</span>
            <select v-model="filterku.instansi" @change="onChangexUnitKerja()" class="bg-white">
              <option value="">-- SEMUA UNIT KERJA --</option>
              <option v-for="data in $store.state.list_instansi" :key="data.id" :value="data.id">🔹 {{ data.instansi }}
              </option>
            </select>
          </div>
          <div class="col-12 col-md-4" v-if="sidapem == 2 || sidapem == 3">
            <span class="h_lable ">Sub Unit Kerja</span>
            <select v-model="filterku.unit_kerja" @change="cari_data()" class="bg-white">
              <option value="">-- SEMUA SUB-UNIT KERJA --</option>
              <option v-for="data in $store.state.list_unit_kerja" :key="data.id" :value="data.id">🔸 {{ data.unit_kerja
                }}</option>
            </select>
          </div>
          <div class="col-12 col-md-6" v-if="sidapem == 11">
            <span class="h_lable ">Sub Unit Kerja</span>
            <select disabled v-model="filterku.unit_kerja" @change="cari_data()" class="bg-white">
              <option value="">-- SEMUA SUB-UNIT KERJA --</option>
              <option v-for="data in $store.state.list_unit_kerja" :key="data.id" :value="data.id">🔸 {{ data.unit_kerja
                }}</option>
            </select>
          </div>
          <div class="col-12 col-md-6 rowRight" v-if="sidapem == 11">
            <span class="h_lable ">Tahun Anggaran</span>
            <select v-model="filterku.tahun" @change="cari_data()" class="bg-white">
              <option value="">-- Tahun --</option>
              <option v-for="data in $store.state.list_tahun" :key="data.id" :value="data.id">{{ data.id }}</option>
            </select>
          </div>
          <div class="col-12 col-md-4 rowRight" v-if="sidapem == 2 || sidapem == 3">
            <span class="h_lable ">Tahun Anggaran</span>
            <select v-model="filterku.tahun" @change="cari_data()" class="bg-white">
              <option value="">-- Tahun --</option>
              <option v-for="data in $store.state.list_tahun" :key="data.id" :value="data.id">{{ data.id }}</option>
            </select>
          </div>
        </div>

        <hr class="hrpagin2">

        <div class="tbl_responsive">
          <table width="100%">
            <tr class="h_table_head main1x_1">
              <th rowspan="2" width="4%" class="text-center">No</th>
              <th rowspan="2" width="10%">Jenis Kegiatan</th>
              <th rowspan="2" width="25%">Uraian</th>
              <th rowspan="2" width="12%">Pagu Anggaran (Rp)</th>
              <th rowspan="2" width="12%">Nilai Kontrak (Rp)</th>
              <th rowspan="2" width="12%">Nomor Kontrak</th>
              <th colspan="2" class="text-center">Tanggal Kontrak</th>
              <th colspan="3" class="text-center">Realisasi</th>
              <th rowspan="2" width="8%">Sumber Dana</th>
              <th rowspan="2" width="8%"></th>
            </tr>
            <tr class="h_table_head main1x_1">
              <th class="text-center" width="8%">Mulai</th>
              <th class="text-center" width="8%">Selesai</th>
              <th class="text-center" width="8%">Fisik (%)</th>
              <th class="text-center" width="12%">Keuangan (Rp)</th>
              <th class="text-center" width="6%">%</th>
            </tr>

            <tr class="h_table_body" v-for="(data, index) in list_data" :key="data.id">
              <td class="text-center">{{ indexing(index + 1) }}.</td>
              <td>{{ data.metode_pemilihan }}</td>
              <td>{{ data.nama_paket }}</td>
              <td class="text-right">Rp. {{ UMUM.Rupiah(data.nilai_pagu || data.nilai_pagu || 0) }}</td>
              <td class="text-right">Rp. {{ UMUM.Rupiah(data.nilai_kontrak || 0) }}</td>
              <td>{{ data.nomor_kontrak }}</td>
              <td class="text-center">{{ data.tgl_mulai ? UMUM.tglConvert(data.tgl_mulai) : '-' }}</td>
              <td class="text-center">{{ data.tgl_selesai ? UMUM.tglConvert(data.tgl_selesai) : '-' }}</td>
              <td class="text-center">{{ data.realisasi_fisik !== null && typeof data.realisasi_fisik !== 'undefined' ?
                data.realisasi_fisik + '%' : '-' }}</td>
              <td class="text-right">Rp. {{ UMUM.Rupiah(data.realisasi_keuangan || 0) }}</td>
              <td class="text-center">{{ data.realisasi_persen !== null && typeof data.realisasi_persen !== 'undefined'
                ? data.realisasi_persen + '%' : '-' }}</td>
              <td class="text-center">{{ data.sumber_dana || '-' }}</td>
              <td class="text-center">
                <q-btn-group>
                  <q-btn size="xs" @click="openEdit(data)" glossy color="orange" icon="create" class="tbl_btn">
                    <q-tooltip content-class="bg-orange-9" content-style="font-size: 9px">
                      Edit realisasi (3 field)
                    </q-tooltip>
                  </q-btn>
                </q-btn-group>
              </td>
            </tr>

            <tr class="h_table_body main1x_1 h_table_head">
              <td colspan="3" class="text-center">JUMLAH</td>
              <td class="text-right">Rp. {{ UMUM.Rupiah(jml_pagu || 0) }}</td>
              <td class="text-right">Rp. {{ UMUM.Rupiah(jml_nilaikontrak || 0) }}</td>
              <td class="text-center"></td>
              <td class="text-center"></td>
              <td class="text-center"></td>
              <td class="text-center">{{ jml_realisasifisik }}%</td>
              <td class="text-right">Rp. {{ UMUM.Rupiah(jml_realisasikeuangan || 0) }}</td>
              <td class="text-center">{{ jml_realisasipersen }}%</td>
              <td class="text-center" colspan="2"></td>
            </tr>
          </table>
        </div>

        <hr class="hrpagin">
        <br>
        <div class="flex flex-center">
          <q-pagination @click="getView()" v-model="page_first" :max="page_last" :max-pages="4" color="grey-6"
            :direction-links="true" :boundary-links="true" icon-first="skip_previous" icon-last="skip_next"
            icon-prev="fast_rewind" icon-next="fast_forward" />
        </div>
        <br>
      </q-card-section>
    </q-card>

    <!-- EDIT REALISASI (HANYA 3 FIELD) -->
    <q-dialog v-model="mdl_edit" persistent>
      <q-card class="mdl-md">
        <q-card-section class="bg-orange">
          <div class="text-h6 h_modalhead">Edit Realisasi (3 field)</div>
        </q-card-section>

        <form @submit.prevent="saveRealisasi">
          <q-card-section class="q-pt-none">
            <br>
            <div class="row">
              <div class="col-12 col-md-12 frame_cari">
                <span class="h_lable">Paket (readonly)</span>
                <div class="bg-white margin_btn q-pa-sm">{{ editForm.uraian || '-' }}</div>
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable">Realisasi Fisik (%)</span>
                <q-input v-model="editForm.realisasi_fisik" outlined square :dense="true" type="number" step="0.01"
                  class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable">Realisasi Keuangan (Rp)</span>
                <q-input v-model="editForm.realisasi_keuangan" outlined square :dense="true" type="number"
                  class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-12 frame_cari">
                <span class="h_lable">Keterangan</span>
                <q-input v-model="editForm.keterangan" outlined square :dense="true" type="textarea"
                  class="bg-white margin_btn" />
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="bg-grey-4 mdl-footer" align="right">
            <q-btn :loading="btn_save" color="primary" type="submit" label="Simpan" />
            <q-btn label="Batal" color="negative" v-close-popup @click="mdl_edit = false" />
          </q-card-actions>
        </form>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>
import FETCHING from '../../library/fetching'
import UMUM from '../../library/umum'
import DATAMASTER from '../../library/dataMaster'

export default {
  name: 'RealisasiKeuangan',
  data() {
    return {
      sidapem: null,
      form: {
        // not used for realisasi-add: data_pembangunan is master
      },
      editForm: {
        id: '',
        uraian: '',
        realisasi_fisik: null,
        realisasi_keuangan: 0,
        keterangan: ''
      },

      jml_pagu: 0,
      jml_nilaikontrak: 0,
      jml_realisasifisik: 0,
      jml_realisasikeuangan: 0,
      jml_realisasipersen: 0,

      filterku: {
        program_kode: '',
        tahun: '',
        unit_kerja: '',
        instansi: '',
      },

      list_data: [],

      page_first: 1,
      page_last: 0,
      page_limit: 8,
      cari_value: "",
      cek_load_data: true,

      mdl_edit: false,
      btn_save: false,
      FETCHING: FETCHING,
      UMUM: UMUM,
      DATAMASTER: DATAMASTER,
    }
  },
  methods: {
    getView() {
      this.$store.commit("shoWLoading");
      fetch(this.$store.state.url.CT_DATA_PEMBANGUNAN + "view", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
        },
        body: JSON.stringify({
          data_ke: this.page_first,
          cari_value: this.cari_value,
          page_limit: this.page_limit,
          instansi: this.filterku.instansi,
          unit_kerja: this.filterku.unit_kerja,
          tahun: this.filterku.tahun,
        })
      })
        .then(res => res.json())
        .then(res_data => {
          this.list_data = res_data.data || [];
          this.page_last = res_data.jml_data || 1;

          this.jml_pagu = typeof res_data.jml_pagu !== 'undefined' ? res_data.jml_pagu : 0;
          this.jml_nilaikontrak = typeof res_data.jml_nilaikontrak !== 'undefined' ? res_data.jml_nilaikontrak : 0;
          this.jml_realisasifisik = typeof res_data.jml_realisasifisik !== 'undefined' ? res_data.jml_realisasifisik : 0;
          this.jml_realisasikeuangan = typeof res_data.jml_realisasikeuangan !== 'undefined' ? res_data.jml_realisasikeuangan : 0;
          this.jml_realisasipersen = typeof res_data.jml_realisasipersen !== 'undefined' ? res_data.jml_realisasipersen : 0;

          this.$store.commit("hideLoading");
        }).catch(err => {
          console.error('getView error', err);
          this.$store.commit("hideLoading");
        });
    },

    openEdit(data) {
      // populate editForm with minimal fields (only 3 editable)
      this.editForm.id = data.id;
      this.editForm.uraian = data.uraian || data.nama_paket || '';
      this.editForm.realisasi_fisik = (data.realisasi_fisik === null || typeof data.realisasi_fisik === 'undefined') ? null : data.realisasi_fisik;
      this.editForm.realisasi_keuangan = data.realisasi_keuangan || 0;
      this.editForm.keterangan = data.keterangan || '';
      this.mdl_edit = true;
    },

    saveRealisasi() {
      if (!this.editForm.id) {
        this.Notify('ID data tidak ditemukan', 'negative', 'warning');
        return;
      }

      this.btn_save = true;
      fetch(this.$store.state.url.CT_DATA_PEMBANGUNAN + "updateRealisasi", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: 'kikensbatara ' + localStorage.token
        },
        body: JSON.stringify({
          id: this.editForm.id,
          realisasi_fisik: this.editForm.realisasi_fisik,
          realisasi_keuangan: Number(this.editForm.realisasi_keuangan) || 0,
          keterangan: this.editForm.keterangan
        })
      }).then(res => res.json()).then((res_json) => {
        this.btn_save = false;
        if (res_json && res_json.success) {
          this.Notify('Sukses menyimpan realisasi', 'primary', 'check_circle_outline');
          this.mdl_edit = false;
          this.getView();
        } else {
          // some backends return object even without success flag
          this.Notify('Simpan selesai', 'primary', 'check_circle_outline');
          this.mdl_edit = false;
          this.getView();
        }
      }).catch(err => {
        this.btn_save = false;
        console.error('saveRealisasi error', err);
        this.Notify('Gagal menyimpan realisasi', 'negative', 'warning');
      });
    },

    // helper / pagination
    Notify(message, positive, icon) {
      this.$q.notify({
        message: message,
        color: positive,
        icon: icon,
        position: 'top',
        timeout: 800,
      })
    },

    cari_data() {
      this.page_first = 1;
      this.getView();
    },

    indexing(index) {
      var idx = ((this.page_first - 1) * this.page_limit) + index
      return idx
    },

    async onChangexInstansi() {
      // pastikan list_instansi ter-load dulu
      await DATAMASTER.getInstansiAsync("");
      await this.onChangexUnitKerjaLocal(); // pakai local yang sudah ada
    },

    async onChangexUnitKerja() {
      // tetapkan ulang unit list (jangan auto pilih kecuali hanya 1)
      const unitkerjax = await DATAMASTER.getUnitKerjaAsync(this.filterku.instansi);
      // jangan paksa pilih, biarkan '' = Semua
      this.filterku.unit_kerja = '';
      // optional: jika cuma 1 unit tersedia, auto set (sama seperti data_pembangunan)
      if (unitkerjax && unitkerjax.length === 1) {
        this.filterku.unit_kerja = unitkerjax[0].id;
      }
      this.getView();
    },
    async onChangexUnitKerjaLocal() {
      var unitkerjax = await DATAMASTER.getUnitKerjaAsync(this.filterku.instansi)
      if (unitkerjax && unitkerjax.length > 0) {
        this.filterku.unit_kerja = unitkerjax[0].id
      } else {
        this.filterku.unit_kerja = ''
      }
      this.getView();
    },

    btn_prev() {
      if (this.page_first > 1) {
        this.page_first--
        this.getView();
      }
    },
    btn_next() {
      if (this.page_first < this.page_last) {
        this.page_first++
        this.getView();
      }
    },

  },

  async mounted() {
    let profilex = JSON.parse(localStorage.profile || '{}');
    let profile = profilex.profile || {};
    this.filterku.instansi = profile.instansi_id || '';
    this.filterku.unit_kerja = profile.unit_kerja || '';

    this.sidapem = profile.sidapem || null;

    const d = new Date();
    this.filterku.tahun = d.getFullYear();

    await DATAMASTER.getInstansiAsync('');
    DATAMASTER.getMasterPermintaan(); // jika async, tambahkan await
    DATAMASTER.getTahun();            // jika async, tambahkan await
    // sekarang load unit sesuai instansi (yang sudah terisi dari profile)
    await this.onChangexUnitKerja(); // ini akan set filterku.unit_kerja = '' dan memanggil getView()
  },
}
</script>

<style scoped>
/* sesuaikan style jika perlu */
</style>
