<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <q-card-section class="main1 text-white">
        <div class="row">
          <div class="col-12 col-md-6">
            <div class="text-h6 h_titleHead">Data Pembangunan</div>
            <div class="text-subtitle2">Data</div>
            <!-- <div class="text-red">
              sidapem = {{ sidapem }} ({{ typeof sidapem }})
          </div> -->
          </div>
          <div class="col-12 col-md-2"></div>
          <div class="col-12 col-md-4">
            <div class="row">
              <q-input v-model="cari_value" @keyup.enter="cari_data()" outlined square :dense="true" class="bg-white"
                style="width:90%" placeholder="Cari..." />
              <!-- <q-btn glossy class="bg-light-blue-10" @click="mdl_add = true" dense flat icon="add" style="width:10%"> -->
              <q-btn v-if="[11, 4, 2].includes(sidapem)" glossy class="bg-light-blue-10" @click="openAdd" dense flat icon="add" style="width:10%">
                <q-tooltip content-class="bg-light-blue-10" content-style="font-size: 13px">
                  Click untuk menambah data
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section>
        <div class="row">
          <div class="col-12 col-md-4 rowLeft">
            <span class="h_lable ">Unit Kerja</span>
            <select v-if="sidapem == 11" v-model="filterku.instansi" @change="onChangexUnitKerja()" class="bg-white"
              disabled>
              <option value="">-- SEMUA UNIT KERJA --</option>
              <option v-for="data in $store.state.list_instansi" :key="data.id" :value="data.id">🔹 {{ data.instansi }}
              </option>
            </select>
            <select v-else v-model="filterku.instansi" @change="onChangexUnitKerja()" class="bg-white">
              <option value="">-- SEMUA UNIT KERJA --</option>
              <option v-for="data in $store.state.list_instansi" :key="data.id" :value="data.id">🔹 {{ data.instansi }}
              </option>
            </select>
          </div>
          <div class="col-12 col-md-4 ">
            <span class="h_lable ">Sub Unit Kerja</span>
            <select v-if="sidapem == 11" v-model="filterku.unit_kerja" @change="cari_data()" class="bg-white" disabled>
              <option value="">-- SEMUA SUB-UNIT KERJA --</option>
              <option v-for="data in $store.state.list_unit_kerja" :key="data.id" :value="data.id">🔸 {{ data.unit_kerja
                }}</option>
            </select>
            <select v-else v-model="filterku.unit_kerja" @change="cari_data()" class="bg-white">
              <option value="">-- SEMUA SUB-UNIT KERJA --</option>
              <option v-for="data in $store.state.list_unit_kerja" :key="data.id" :value="data.id">🔸 {{ data.unit_kerja
                }}</option>
            </select>
          </div>
          <div class="col-12 col-md-4 rowRight">
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
              <th width="4%">No</th>
              <th width="30%" v-if="sidapem != 11">Unit Kerja</th>
              <th width="12%" v-else>Kode RUP/Kontrak</th>
              <th>Nama Paket</th>
              <th width="18%" v-if="[11, 4, 2].includes(sidapem)" >Lokasi</th>
              <th width="12%">Jenis Pengadaan</th>
              <th width="12%">Nilai Pagu (Rp)</th>
              <th width="12%">Nilai Kontrak (Rp)</th>
              <th class="text-center" width="10%">Aksi</th>
            </tr>

            <tr class="h_table_body" v-for="(data, index) in list_data" :key="data.id">
              <td class="text-center">{{ indexing(index + 1) }}.</td>
              <td v-if="sidapem != 11">
                {{ data._unit_kerja_name || ($store.state.list_unit_kerja.find(x => x.id === data.unit_kerja) ||
                {}).unit_kerja || '-' }}
              </td>
              <td v-else>{{ data.kode_rup_kontrak }}</td>

              <td>{{ data.nama_paket }}</td>
              <td v-if="[11, 4, 2].includes(sidapem)" >{{ data.lokasi_kegiatan }}</td>
              <td>{{ data.jenis_pengadaan }}</td>
              <td class="text-right">Rp. {{ UMUM.Rupiah(data.nilai_pagu || 0) }}</td>
              <td class="text-right">Rp. {{ UMUM.Rupiah(data.nilai_kontrak || 0) }}</td>
              <td class="text-center">
                <q-btn-group>
                  <q-btn size="xs" @click="openDetail(data)" glossy color="primary" icon="visibility" class="tbl_btn">
                    <q-tooltip content-class="bg-primary" content-style="font-size: 9px">Lihat Detail</q-tooltip>
                  </q-btn>
                  <q-btn size="xs" v-if="[11, 4, 2].includes(sidapem)" @click="openEdit(data)" glossy color="orange" icon="create" class="tbl_btn">
                    <q-tooltip content-class="bg-orange-9" content-style="font-size: 9px">Ubah</q-tooltip>
                  </q-btn>
                  <q-btn size="xs" v-if="[11, 4, 2].includes(sidapem)" @click="openDelete(data)" glossy color="negative" icon="delete_forever"
                    class="tbl_btn">
                    <q-tooltip content-class="bg-red" content-style="font-size: 9px">Hapus</q-tooltip>
                  </q-btn>
                </q-btn-group>
              </td>
            </tr>
          </table>
        </div>

        <hr class="hrpagin">
        <br>
        <div class="flex flex-center">
          <q-pagination @click="getView()" v-model="page_first" :max="page_last" :max-pages="4" color="grey-6"
            :direction-links="true" :boundary-links="true" icon-first="skip_previous" icon-last="skip_next"
            icon-prev="fast_rewind" icon-next="fast_forward">
          </q-pagination>
        </div>
        <br>
      </q-card-section>
    </q-card>

    <!-- MODAL TAMBAH -->
    <q-dialog v-model="mdl_add" persistent>
      <q-card class="mdl-md">
        <q-card-section class="main1">
          <div class="flexModal">
            <div class="text-h6 h_modalhead">Simpan Data</div>
            <div class="flexModalRight">
              <q-btn @click="mdl_add = false" round push size="sm" color="deep-purple-5" text-color="white" label="X" />
            </div>
          </div>
        </q-card-section>

        <form @submit.prevent="addData()">
          <q-card-section class="q-pt-none">
            <br>
            <div class="row">

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Instansi</span>
                <select v-model="form.instansi" @change="onChangexUnitKerjaForm()" class="bg-white margin_btn"
                  :disabled="sidapem == 11">
                  <option value="">-- Pilih Instansi --</option>
                  <option v-for="data in $store.state.list_instansi" :key="data.id" :value="data.id">🔹 {{ data.instansi
                    }}</option>
                </select>
              </div>
              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Unit Kerja</span>
                <select v-model="form.unit_kerja" class="bg-white margin_btn" :disabled="sidapem == 11">
                  <option value="">-- Pilih Unit Kerja --</option>
                  <option v-for="data in $store.state.list_unit_kerja" :key="data.id" :value="data.id">🔸 {{
                data.unit_kerja }}</option>
                </select>
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Kode RUP/Kontrak</span>
                <q-input v-model="form.kode_rup_kontrak" outlined square :dense="true" class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Nama Paket</span>
                <q-input v-model="form.nama_paket" outlined square :dense="true" class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Tahun</span>
                <select v-model="form.yy" class="bg-white margin_btn">
                  <option value="">-- Pilih Tahun --</option>
                  <option v-for="th in tahunList" :key="th" :value="th">{{ th }}</option>
                </select>
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Lokasi Kegiatan</span>
                <q-input v-model="form.lokasi_kegiatan" outlined square :dense="true" class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Metode Pemilihan</span>
                <select v-model="form.metode_pemilihan" class="bg-white margin_btn">
                  <option value="">-- Pilih Metode --</option>
                  <option value="Tender">Tender</option>
                  <option value="Pengadaan Langsung">Pengadaan Langsung</option>
                  <option value="Penunjukkan Langsung">Penunjukkan Langsung</option>
                  <option value="E-Purchasing">E-Purchasing</option>
                </select>
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Jenis Pengadaan</span>
                <select v-model="form.jenis_pengadaan" class="bg-white margin_btn">
                  <option value="">-- Pilih Jenis --</option>
                  <option value="Pekerjaan Konstruksi">Pekerjaan Konstruksi</option>
                  <option value="Pengadaan Barang/Jasa">Pengadaan Barang/Jasa</option>
                </select>
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Nilai Pagu (Rp)</span>
                <q-input v-model="form.nilai_pagu" outlined square :dense="true" type="number"
                  class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Nilai Kontrak (Rp)</span>
                <q-input v-model="form.nilai_kontrak" outlined square :dense="true" type="number"
                  class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Sumber Dana</span>
                <select v-model="form.sumber_dana" class="bg-white margin_btn">
                  <option value="">-- Pilih Sumber Dana --</option>
                  <option value="APBD">APBD</option>
                  <option value="APBN">APBN</option>
                </select>
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Nomor Kontrak</span>
                <q-input v-model="form.nomor_kontrak" outlined square :dense="true" class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Tanggal Mulai</span>
                <q-input v-model="form.tgl_mulai" type="date" outlined square :dense="true" class="bg-white margin_btn"
                  @change="onTglMulaiChange" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Tanggal Selesai</span>
                <q-input v-model="form.tgl_selesai" type="date" outlined square :dense="true"
                  class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-12 frame_cari">
                <span class="h_lable ">Pemenang Tender</span>
                <q-input v-model="form.pemenang_tender" outlined square :dense="true" class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-12 frame_cari">
                <span class="h_lable ">Keterangan</span>
                <q-input v-model="form.keterangan" outlined square :dense="true" class="bg-white margin_btn"
                  type="textarea" />
              </div>

            </div>
          </q-card-section>

          <q-card-actions class="bg-grey-4 mdl-footer" align="right">
            <q-btn :loading="btn_add" color="primary" @click="addData()" label="Simpan" />
            <q-btn label="Batal" color="negative" v-close-popup />
          </q-card-actions>
        </form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="mdl_edit" persistent>
      <q-card class="mdl-md">
        <q-card-section class="bg-orange">
          <div class="text-h6 h_modalhead">Edit Data</div>
        </q-card-section>

        <form @submit.prevent="editData()">
          <q-card-section class="q-pt-none">
            <br>
            <div class="row">

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Instansi</span>
                <select v-model="form.instansi" @change="onChangexUnitKerjaForm()" class="bg-white margin_btn">
                  <option value="">-- Pilih Instansi --</option>
                  <option v-for="data in $store.state.list_instansi" :key="data.id" :value="data.id">🔹 {{ data.instansi
                    }}</option>
                </select>
              </div>
              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Unit Kerja</span>
                <select v-model="form.unit_kerja" class="bg-white margin_btn">
                  <option value="">-- Pilih Unit Kerja --</option>
                  <option v-for="data in $store.state.list_unit_kerja" :key="data.id" :value="data.id">🔸 {{
                data.unit_kerja }}</option>
                </select>
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Kode RUP/Kontrak</span>
                <q-input v-model="form.kode_rup_kontrak" outlined square :dense="true" class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Nama Paket</span>
                <q-input v-model="form.nama_paket" outlined square :dense="true" class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Tahun</span>
                <select v-model="form.yy" class="bg-white margin_btn">
                  <option value="">-- Pilih Tahun --</option>
                  <option v-for="th in tahunList" :key="th" :value="th">{{ th }}</option>
                </select>
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Lokasi Kegiatan</span>
                <q-input v-model="form.lokasi_kegiatan" outlined square :dense="true" class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Metode Pemilihan</span>
                <select v-model="form.metode_pemilihan" class="bg-white margin_btn">
                  <option value="">-- Pilih Metode --</option>
                  <option value="Tender">Tender</option>
                  <option value="Pengadaan Langsung">Pengadaan Langsung</option>
                  <option value="Penunjukkan Langsung">Penunjukkan Langsung</option>
                  <option value="E-Purchasing">E-Purchasing</option>
                </select>
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Jenis Pengadaan</span>
                <select v-model="form.jenis_pengadaan" class="bg-white margin_btn">
                  <option value="">-- Pilih Jenis --</option>
                  <option value="Pekerjaan Konstruksi">Pekerjaan Konstruksi</option>
                  <option value="Pengadaan Barang/Jasa">Pengadaan Barang/Jasa</option>
                </select>
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Nilai Pagu (Rp)</span>
                <q-input v-model="form.nilai_pagu" outlined square :dense="true" type="number"
                  class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Nilai Kontrak (Rp)</span>
                <q-input v-model="form.nilai_kontrak" outlined square :dense="true" type="number"
                  class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Sumber Dana</span>
                <select v-model="form.sumber_dana" class="bg-white margin_btn">
                  <option value="">-- Pilih Sumber Dana --</option>
                  <option value="APBD">APBD</option>
                  <option value="APBN">APBN</option>
                </select>
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Nomor Kontrak</span>
                <q-input v-model="form.nomor_kontrak" outlined square :dense="true" class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Tanggal Mulai</span>
                <q-input v-model="form.tgl_mulai" type="date" outlined square :dense="true" class="bg-white margin_btn"
                  @change="onTglMulaiChange" />
              </div>

              <div class="col-12 col-md-6 frame_cari">
                <span class="h_lable ">Tanggal Selesai</span>
                <q-input v-model="form.tgl_selesai" type="date" outlined square :dense="true"
                  class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-12 frame_cari">
                <span class="h_lable ">Pemenang Tender</span>
                <q-input v-model="form.pemenang_tender" outlined square :dense="true" class="bg-white margin_btn" />
              </div>

              <div class="col-12 col-md-12 frame_cari">
                <span class="h_lable ">Keterangan</span>
                <q-input v-model="form.keterangan" outlined square :dense="true" class="bg-white margin_btn"
                  type="textarea" />
              </div>

            </div>
          </q-card-section>

          <q-card-actions class="bg-grey-4 mdl-footer" align="right">
            <q-btn :loading="btn_add" color="primary" @click="editData()" label="Simpan" />
            <q-btn label="Batal" color="negative" v-close-popup />
          </q-card-actions>
        </form>
      </q-card>
    </q-dialog>

    <!-- MODAL HAPUS -->
    <q-dialog v-model="mdl_hapus" persistent>
      <q-card class="mdl-sm ">
        <q-card-section class="q-pt-none text-center orageGrad">
          <form @submit.prevent="removeData">
            <br>
            <img src="img/alert.png" alt="" width="75"> <br>
            <span class="h_notifikasi">APAKAH ANDA YAKIN INGIN MENGHAPUS DATA INI??</span>
            <input type="submit" style="position: absolute; left: -9999px" />
            <br>
            <br>
            <q-btn label="Batal" size="sm" color="negative" v-close-popup />
            &nbsp;
            <q-btn type="submit" label="Hapus" size="sm" color="primary" v-close-popup />
          </form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- DETAIL -->
    <q-dialog v-model="mdl_view" persistent>
      <q-card class="mdl-md">
        <q-card-section class="main1">
          <div class="flexModal">
            <div class="text-h6 h_modalhead">Detail Data</div>
            <div class="flexModalRight">
              <q-btn @click="mdl_view = false" round push size="sm" color="deep-purple-5" text-color="white"
                label="X" />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <br>
          <div class="row">

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Instansi</span>
              <div class="bg-white margin_btn q-pa-sm">
                {{ ($store.state.list_instansi.find(x => x.id === data.instansi) || {}).instansi || '-' }}
              </div>
            </div>

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Unit Kerja</span>
              <div class="bg-white margin_btn q-pa-sm">
                {{ ($store.state.list_unit_kerja.find(x => x.id === data.unit_kerja) || {}).unit_kerja || '-' }}
              </div>
            </div>

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Kode RUP/Kontrak</span>
              <div class="bg-white margin_btn q-pa-sm">{{ data.kode_rup_kontrak || '-' }}</div>
            </div>

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Nama Paket</span>
              <div class="bg-white margin_btn q-pa-sm">{{ data.nama_paket || '-' }}</div>
            </div>

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Tahun</span>
              <div class="bg-white margin_btn q-pa-sm">{{ data.yy || '-' }}</div>
            </div>

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Lokasi Kegiatan</span>
              <div class="bg-white margin_btn q-pa-sm">{{ data.lokasi_kegiatan || '-' }}</div>
            </div>

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Metode Pemilihan</span>
              <div class="bg-white margin_btn q-pa-sm">{{ data.metode_pemilihan || '-' }}</div>
            </div>

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Jenis Pengadaan</span>
              <div class="bg-white margin_btn q-pa-sm">{{ data.jenis_pengadaan || '-' }}</div>
            </div>

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Nilai Pagu (Rp)</span>
              <div class="bg-white margin_btn q-pa-sm">Rp. {{ UMUM.Rupiah(data.nilai_pagu || 0) }}</div>
            </div>

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Nilai Kontrak (Rp)</span>
              <div class="bg-white margin_btn q-pa-sm">Rp. {{ UMUM.Rupiah(data.nilai_kontrak || 0) }}</div>
            </div>

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Sumber Dana</span>
              <div class="bg-white margin_btn q-pa-sm">{{ data.sumber_dana || '-' }}</div>
            </div>

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Nomor Kontrak</span>
              <div class="bg-white margin_btn q-pa-sm">{{ data.nomor_kontrak || '-' }}</div>
            </div>

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Tanggal Mulai</span>
              <div class="bg-white margin_btn q-pa-sm">
                {{ data.tgl_mulai ? UMUM.tglConvert(data.tgl_mulai) : '-' }}
              </div>
            </div>

            <div class="col-12 col-md-6 frame_cari">
              <span class="h_lable">Tanggal Selesai</span>
              <div class="bg-white margin_btn q-pa-sm">
                {{ data.tgl_selesai ? UMUM.tglConvert(data.tgl_selesai) : '-' }}
              </div>
            </div>

            <div class="col-12 col-md-12 frame_cari">
              <span class="h_lable">Pemenang Tender</span>
              <div class="bg-white margin_btn q-pa-sm">{{ data.pemenang_tender || '-' }}</div>
            </div>

            <div class="col-12 col-md-12 frame_cari">
              <span class="h_lable">Keterangan</span>
              <div class="bg-white margin_btn q-pa-sm">{{ data.keterangan || '-' }}</div>
            </div>


          </div>
        </q-card-section>

        <q-card-actions class="bg-grey-4 mdl-footer" align="right">
          <q-btn label="Tutup" color="negative" v-close-popup @click="mdl_view = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>


  </div>
</template>

<script>
import FETCHING from '../../library/fetching'
import UMUM from '../../library/umum'
import DATAMASTER from '../../library/dataMaster'

export default {
  data() {
    return {
      sidapem: null,
      tahunList: Array.from({ length: 2030 - 2012 + 1 }, (_, i) => 2012 + i),
      form: {
        id: '',
        kode_rup_kontrak: '',
        nama_paket: '',
        lokasi_kegiatan: '',
        metode_pemilihan: '',
        jenis_pengadaan: '',
        nilai_pagu: 0,
        nilai_kontrak: 0,
        nomor_kontrak: '',
        tgl_mulai: '',
        tgl_selesai: '',
        yy: '',
        sumber_dana: '',
        instansi: '',
        unit_kerja: '',
        pemenang_tender: '',
        keterangan: '',
      },
      filterku: { program_kode: '', tahun: '', unit_kerja: '', instansi: '' },
      list_data: [],
      page_first: 1, page_last: 0, page_limit: 8, cari_value: "", cek_load_data: true,
      mdl_add: false, mdl_edit: false, mdl_hapus: false, btn_add: false, mdl_view: false,
      selectedDetail: null,
      FETCHING, UMUM, DATAMASTER
    }
  },

  computed: {
    data() { return this.selectedDetail || {}; }
  },


  methods: {
    async getView() {
      this.$store.commit("shoWLoading");
      try {
        const res = await fetch(this.$store.state.url.CT_DATA_PEMBANGUNAN + "view", {
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
        });
        const res_data = await res.json();
        const rows = res_data.data || [];
        this.page_last = res_data.jml_data || 1;

        // --- new: build unit map per instansi yang ada di rows ---
        const instansiIds = [...new Set(rows.map(r => r.instansi).filter(Boolean))];
        const unitMap = {}; // unitId -> unitName

        // panggil getUnitKerjaAsync untuk tiap instansi unik
        // DATAMASTER.getUnitKerjaAsync(instansiId) diasumsikan mengembalikan list unit untuk instansi itu
        await Promise.all(instansiIds.map(async instId => {
          try {
            const list = await DATAMASTER.getUnitKerjaAsync(instId || '');
            if (Array.isArray(list)) {
              list.forEach(u => {
                if (u && u.id) unitMap[u.id] = u.unit_kerja || u.name || '';
              });
            }
          } catch (e) {
            console.error('err loading unit for instansi', instId, e);
          }
        }));

        // tambahkan _unit_kerja_name ke tiap row (supaya render tabel mudah)
        this.list_data = rows.map(r => {
          return {
            ...r,
            _unit_kerja_name: unitMap[r.unit_kerja] || ((this.$store.state.list_unit_kerja.find(x => x.id === r.unit_kerja) || {}).unit_kerja) || '-'
          };
        });

        this.$store.commit("hideLoading");
      } catch (err) {
        console.error('getView error', err);
        this.$store.commit("hideLoading");
      }
    },


    // onTglMulaiChange() {
    //   if (this.form.tgl_mulai && (!this.form.dd || !this.form.mm || !this.form.yy)) {
    //     const d = new Date(this.form.tgl_mulai);
    //     this.form.dd = d.getDate();
    //     this.form.mm = d.getMonth() + 1;
    //     this.form.yy = d.getFullYear();
    //   }
    // },

    onTglMulaiChange() {
      if (this.form.tgl_mulai) {
        const d = new Date(this.form.tgl_mulai);
        if (!isNaN(d.getTime())) { // Pastikan tanggal valid (mencegah Invalid Date)
          // Set dd dan mm jika belum ada
          if (!this.form.dd) this.form.dd = d.getDate();
          if (!this.form.mm) this.form.mm = d.getMonth() + 1;
          // HANYA set yy jika belum di-set (jangan overwrite dari dropdown)
          if (!this.form.yy) this.form.yy = d.getFullYear();
        }
      }
    },

    async openAdd() {
      try {
        // load master instansi dulu (jika belum)
        if (typeof DATAMASTER.getInstansiAsync === 'function') {
          await DATAMASTER.getInstansiAsync('');
        }

        // ambil profile
        const profilex = JSON.parse(localStorage.profile || '{}');
        const profile = profilex.profile || {};

        // reset form (jika ingin fresh)
        this.form = {
          id: '',
          kode_rup_kontrak: '',
          nama_paket: '',
          lokasi_kegiatan: '',
          metode_pemilihan: '',
          jenis_pengadaan: '',
          nilai_pagu: 0,
          nilai_kontrak: 0,
          nomor_kontrak: '',
          tgl_mulai: '',
          tgl_selesai: '',
          yy: '',
          sumber_dana: '',
          instansi: '',
          unit_kerja: '',
          pemenang_tender: '',
          keterangan: '',
          dd: '', mm: ''
        };

        // set instansi dari profile (kalau ada)
        if (profile.instansi_id) {
          this.form.instansi = profile.instansi_id;
        } else {
          this.form.instansi = '';
        }

        // load unit kerja untuk instansi yang dipilih dan set default unit_kerja
        if (typeof DATAMASTER.getUnitKerjaAsync === 'function') {
          const list = await DATAMASTER.getUnitKerjaAsync(this.form.instansi || '');
          // jika profile punya unit_kerja gunakan itu, kalau tidak pakai first option bila tersedia
          if (profile.unit_kerja) {
            const match = (list || []).find(u => u.id === profile.unit_kerja);
            if (match) {
              this.form.unit_kerja = profile.unit_kerja;
            } else if (list && list.length) {
              this.form.unit_kerja = list[0].id;
            } else {
              this.form.unit_kerja = '';
            }
          } else if (list && list.length) {
            this.form.unit_kerja = list[0].id;
          }
        }

        // set tahun default sesuai filter (opsional)
        this.form.yy = this.filterku.tahun || '';

        // buka modal
        this.mdl_add = true;
      } catch (e) {
        console.error('openAdd error', e);
        // fallback: buka modal tanpa auto-fill
        this.mdl_add = true;
      }
    },


    addData() {
      this.btn_add = true;
      console.log('form.yy sebelum payload:', this.form.yy, typeof this.form.yy);
      console.log('form.tgl_mulai:', this.form.tgl_mulai);
      console.log('tahunList:', this.tahunList);
      const payload = {
        kode_rup_kontrak: this.form.kode_rup_kontrak,
        nama_paket: this.form.nama_paket,
        lokasi_kegiatan: this.form.lokasi_kegiatan,
        metode_pemilihan: this.form.metode_pemilihan,
        jenis_pengadaan: this.form.jenis_pengadaan,
        nilai_pagu: Number(this.form.nilai_pagu) || 0,
        nilai_kontrak: Number(this.form.nilai_kontrak) || 0,
        nomor_kontrak: this.form.nomor_kontrak,
        tgl_mulai: this.fmtDateToYMD(this.form.tgl_mulai),
        tgl_selesai: this.fmtDateToYMD(this.form.tgl_selesai),
        yy: this.form.yy,
        sumber_dana: this.form.sumber_dana,
        instansi: this.form.instansi,
        unit_kerja: this.form.unit_kerja,
        pemenang_tender: this.form.pemenang_tender,
        keterangan: this.form.keterangan,
        dd: this.form.dd, mm: this.form.mm
        // note: we DO NOT send realisasi_* here
      };

      console.log('payload yy:', payload.yy);

      fetch(this.$store.state.url.CT_DATA_PEMBANGUNAN + "addData", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: 'kikensbatara ' + localStorage.token
        },
        body: JSON.stringify(payload)
      }).then(res => res.json()).then(res_json => {
        this.btn_add = false;
        this.Notify('Sukses Menambah Data', 'primary', 'check_circle_outline');
        this.mdl_add = false;
        this.getView();
      }).catch(err => {
        this.btn_add = false;
        console.error('addData error', err);
        this.Notify('Gagal menambah data', 'negative', 'warning');
      });
    },

    // openEdit: load master data dulu, lalu set form dan buka modal
    async openEdit(item) {
      try {
        // pastikan master instansi ter-load
        if (typeof DATAMASTER.getInstansiAsync === 'function') {
          await DATAMASTER.getInstansiAsync('');
        }

        // pastikan unit kerja untuk instansi item ter-load
        if (typeof DATAMASTER.getUnitKerjaAsync === 'function') {
          await DATAMASTER.getUnitKerjaAsync(item.instansi || '');
        }

        // sekarang set data ke form (pastikan opsi sudah tersedia)
        this.selectData(item);

        // kalau unit_kerja belum ada di opsi (mis: id baru), coba cek dan jika opsi ada set ulang
        const unitExists = (this.$store.state.list_unit_kerja || []).some(u => u.id === this.form.unit_kerja);
        if (!unitExists && (this.$store.state.list_unit_kerja || []).length) {
          // set ke first option supaya user tidak lihat kosong
          this.form.unit_kerja = this.$store.state.list_unit_kerja[0].id;
        }

        this.mdl_edit = true;
      } catch (e) {
        console.error('openEdit error', e);
        // fallback: tetap isi data & buka modal
        this.selectData(item);
        this.mdl_edit = true;
      }
    },

    // selectData: hanya set values ke form (tidak mengubah list)
    selectData(data) {
      this.form.id = data.id;
      this.form.kode_rup_kontrak = data.kode_rup_kontrak || '';
      this.form.nama_paket = data.nama_paket || '';
      this.form.lokasi_kegiatan = data.lokasi_kegiatan || '';
      this.form.metode_pemilihan = data.metode_pemilihan || '';
      this.form.jenis_pengadaan = data.jenis_pengadaan || '';
      this.form.nilai_pagu = data.nilai_pagu || 0;
      this.form.nilai_kontrak = data.nilai_kontrak || 0;
      this.form.nomor_kontrak = data.nomor_kontrak || '';
      this.form.tgl_mulai = this.fmtDateToYMD(data.tgl_mulai) || '';
      this.form.tgl_selesai = this.fmtDateToYMD(data.tgl_selesai) || '';
      this.form.yy = data.yy || '';
      this.form.sumber_dana = data.sumber_dana || '';
      this.form.instansi = data.instansi || '';
      this.form.unit_kerja = data.unit_kerja || '';
      this.form.pemenang_tender = data.pemenang_tender || '';
      this.form.keterangan = data.keterangan || '';
      this.form.dd = data.dd || '';
      this.form.mm = data.mm || '';
    },

    // onChangexUnitKerjaForm: kembalikan promise agar caller bisa await
    onChangexUnitKerjaForm() {
      // return promise so callers can await if needed
      return DATAMASTER.getUnitKerjaAsync(this.form.instansi).then(list => {
        // kalau dipanggil dari form tambah/edit dan list ada, set unit_kerja default
        if (list && list.length) {
          // jangan overwrite kalau user sudah pilih unit_kerja
          if (!this.form.unit_kerja) {
            this.form.unit_kerja = list[0].id;
          }
        }
        return list;
      }).catch(err => {
        console.error('getUnitKerjaAsync error', err);
        return [];
      });
    },


    editData() {
      this.btn_add = true;
      const payload = {
        id: this.form.id,
        kode_rup_kontrak: this.form.kode_rup_kontrak,
        nama_paket: this.form.nama_paket,
        lokasi_kegiatan: this.form.lokasi_kegiatan,
        metode_pemilihan: this.form.metode_pemilihan,
        jenis_pengadaan: this.form.jenis_pengadaan,
        nilai_pagu: Number(this.form.nilai_pagu) || 0,
        nilai_kontrak: Number(this.form.nilai_kontrak) || 0,
        nomor_kontrak: this.form.nomor_kontrak,
        tgl_mulai: this.fmtDateToYMD(this.form.tgl_mulai),
        tgl_selesai: this.fmtDateToYMD(this.form.tgl_selesai),
        yy: this.form.yy,
        sumber_dana: this.form.sumber_dana,
        instansi: this.form.instansi,
        unit_kerja: this.form.unit_kerja,
        pemenang_tender: this.form.pemenang_tender,
        keterangan: this.form.keterangan,
        dd: this.form.dd, mm: this.form.mm
        // again: do NOT update realisasi_* here
      };
      fetch(this.$store.state.url.CT_DATA_PEMBANGUNAN + "editData", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: 'kikensbatara ' + localStorage.token
        },
        body: JSON.stringify(payload)
      }).then(res => res.json()).then(res_json => {
        this.btn_add = false;
        this.Notify('Sukses Mengubah Data', 'primary', 'check_circle_outline');
        this.mdl_edit = false;
        this.getView();
      }).catch(err => {
        this.btn_add = false;
        console.error('editData error', err);
        this.Notify('Gagal mengubah data', 'negative', 'warning');
      });
    },

    openDelete(item) {
      // isi form.id dan buka modal hapus
      this.form.id = item.id || '';
      this.mdl_hapus = true;
    },

    removeData() {
      fetch(this.$store.state.url.CT_DATA_PEMBANGUNAN + "removeData", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "kikensbatara " + localStorage.token
        },
        body: JSON.stringify({ id: this.form.id })
      }).then(res => res.json()).then(res_json => {
        this.Notify('Sukses Menghapus Data', 'negative', 'check_circle_outline');
        this.mdl_hapus = false;
        this.getView();
      }).catch(err => {
        console.error('removeData error', err);
        this.Notify('Gagal menghapus data', 'negative', 'warning');
      });
    },

    // ganti method openDetail Anda dengan ini
    async openDetail(item) {
      try {
        // pastikan list_instansi ter-load
        if (typeof DATAMASTER.getInstansiAsync === 'function') {
          await DATAMASTER.getInstansiAsync('');
        }

        // load unit kerja sesuai instansi (agar $store.state.list_unit_kerja terisi)
        if (typeof DATAMASTER.getUnitKerjaAsync === 'function') {
          await DATAMASTER.getUnitKerjaAsync(item.instansi || '');
        }

        // debug logs (hapus kalau sudah oke)
        console.log('openDetail -> item.instansi, item.unit_kerja', item.instansi, item.unit_kerja);
        console.log('store list_instansi length, list_unit_kerja length ->',
          (this.$store.state.list_instansi || []).length,
          (this.$store.state.list_unit_kerja || []).length);

        // set detail dan buka modal
        this.selectedDetail = item;
        this.mdl_view = true;
      } catch (e) {
        console.error('openDetail error', e);
        // fallback: tetap buka modal supaya user tetap bisa lihat data raw
        this.selectedDetail = item;
        this.mdl_view = true;
      }
    },

    // helpers
    Notify(message, positive, icon) {
      this.$q.notify({ message, color: positive, icon, position: 'top', timeout: 500 });
    },
    cari_data() { this.page_first = 1; this.getView(); },
    indexing(index) { return ((this.page_first - 1) * this.page_limit) + index; },

    async onChangexInstansi() {
      await DATAMASTER.getInstansiAsync("");
      await this.onChangexUnitKerja();
    },
    async onChangexUnitKerja() {
      var unitkerjax = await DATAMASTER.getUnitKerjaAsync(this.filterku.instansi)
      this.getView();
    },

    // onChangexUnitKerjaForm() {
    //   DATAMASTER.getUnitKerjaAsync(this.form.instansi).then(list => {
    //     if (list && list.length) this.form.unit_kerja = list[0].id;
    //   });
    // },

    // pastikan ada di methods (atau di luar dan import)
    fmtDateToYMD(dateValue) {
      if (!dateValue && dateValue !== 0) return null; // kosong
      // jika sudah bentuk "YYYY-MM-DD"
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
      // jika string ISO seperti "2025-04-09T16:00:00.000Z" atau Date object
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return null;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    },


    mountedSetup() {
      const d = new Date();
      this.filterku.tahun = d.getFullYear();
      FETCHING.getContohAtocomplete('');
      DATAMASTER.getMasterPermintaan();
      DATAMASTER.getTahun();
      this.onChangexInstansi();
    }
  },

  async mounted() {
    let profilex = JSON.parse(localStorage.profile || '{}');
    let profile = profilex.profile || {};
    this.filterku.instansi = profile.instansi_id || '';
    this.filterku.unit_kerja = profile.unit_kerja || '';

    this.sidapem = Number(profile.sidapem);


    const d = new Date();
    this.filterku.tahun = d.getFullYear();

    await DATAMASTER.getInstansiAsync('');
    DATAMASTER.getMasterPermintaan(); // jika async, tambahkan await
    DATAMASTER.getTahun();            // jika async, tambahkan await
    // sekarang load unit sesuai instansi (yang sudah terisi dari profile)
    await this.onChangexUnitKerja(); // ini akan set filterku.unit_kerja = '' dan memanggil getView()
  }
}
</script>

<style scoped>
/* tambahkan style bila perlu */
</style>
