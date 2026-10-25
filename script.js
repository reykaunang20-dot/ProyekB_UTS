const KUNCI_DATA = "catatanKeuanganHarian";
let daftarCatatan = JSON.parse(localStorage.getItem(KUNCI_DATA)) || [];

const form = document.getElementById("formCatatan");
const keterangan = document.getElementById("inputKeterangan");
const jumlah = document.getElementById("inputJumlah");
const jenis = document.getElementById("inputJenis");
const filter = document.getElementById("filterJenis");
const tabel = document.getElementById("isiTabel");

// Mengubah angka menjadi format rupiah.
function rupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

// Menyimpan data ke localStorage.
function simpanData() {
  localStorage.setItem(KUNCI_DATA, JSON.stringify(daftarCatatan));
}

// Memeriksa input sebelum disimpan.
function validasi() {
  let valid = true;

  [keterangan, jumlah].forEach((input) => {
    const pesan = document.getElementById(
      input.id === "inputKeterangan" ? "pesanKeterangan" : "pesanJumlah"
    );

    pesan.textContent = "";
    input.classList.remove("is-invalid");

    if (!input.value.trim() || Number(input.value) <= 0) {
      pesan.textContent = input === keterangan
        ? "Keterangan tidak boleh kosong."
        : "Jumlah harus lebih dari 0.";
      input.classList.add("is-invalid");
      valid = false;
    }
  });

  return valid;
}

// Menambahkan catatan baru.
function tambahCatatan() {
  daftarCatatan.push({
    id: Date.now(),
    tanggal: new Date().toLocaleDateString("id-ID"),
    keterangan: keterangan.value.trim(),
    jumlah: Number(jumlah.value),
    jenis: jenis.value
  });

  simpanData();
  form.reset();
  tampilkanSemua();
}

// Menghapus catatan berdasarkan ID.
function hapusCatatan(id) {
  daftarCatatan = daftarCatatan.filter((data) => data.id !== id);
  simpanData();
  tampilkanSemua();
}

// Membuat elemen tabel.
function buatSel(teks) {
  const sel = document.createElement("td");
  sel.textContent = teks;
  return sel;
}

// Menampilkan riwayat sesuai filter.
function tampilkanTabel() {
  tabel.innerHTML = "";
  const data = daftarCatatan.filter(
    (item) => filter.value === "semua" || item.jenis === filter.value
  );

  data.forEach((item) => {
    const baris = document.createElement("tr");
    const tanggal = buatSel(item.tanggal);
    const ket = buatSel(item.keterangan);
    const tipe = buatSel(item.jenis === "masuk" ? "Pemasukan" : "Pengeluaran");
    const nominal = buatSel(rupiah(item.jumlah));
    nominal.className = "text-end";

    const aksi = buatSel("");
    const tombol = document.createElement("button");
    tombol.textContent = "Hapus";
    tombol.className = "btn btn-sm btn-danger";
    tombol.dataset.id = item.id;
    aksi.appendChild(tombol);

    [tanggal, ket, tipe, nominal, aksi].forEach((sel) => baris.appendChild(sel));
    tabel.appendChild(baris);
  });

  if (data.length === 0) {
    const baris = document.createElement("tr");
    const sel = buatSel("Belum ada catatan.");
    sel.colSpan = 5;
    sel.className = "text-center text-muted";
    baris.appendChild(sel);
    tabel.appendChild(baris);
  }
}

// Menghitung pemasukan, pengeluaran, dan saldo.
function tampilkanRingkasan() {
  let masuk = 0;
  let keluar = 0;

  daftarCatatan.forEach((item) => {
    if (item.jenis === "masuk") masuk += item.jumlah;
    else keluar += item.jumlah;
  });

  document.getElementById("totalMasuk").textContent = rupiah(masuk);
  document.getElementById("totalKeluar").textContent = rupiah(keluar);
  document.getElementById("saldo").textContent = rupiah(masuk - keluar);

  const alert = document.getElementById("alertSaldo");
  alert.className = "alert " +
    (daftarCatatan.length === 0 ? "alert-secondary" :
    masuk - keluar < 0 ? "alert-danger" : "alert-success");

  alert.textContent = daftarCatatan.length === 0
    ? "Belum ada catatan."
    : masuk - keluar < 0
    ? "Saldo minus. Pengeluaran lebih besar dari pemasukan."
    : "Keuangan aman. Saldo masih positif.";
}

// Memperbarui tabel dan ringkasan.
function tampilkanSemua() {
  tampilkanTabel();
  tampilkanRingkasan();
}

// Menampilkan tanggal hari ini.
document.getElementById("teksTanggal").textContent =
  new Date().toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });

// Menangani pengiriman form.
form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (validasi()) tambahCatatan();
});

// Menangani tombol hapus.
tabel.addEventListener("click", function (e) {
  if (e.target.dataset.id) hapusCatatan(Number(e.target.dataset.id));
});

// Menangani filter transaksi.
filter.addEventListener("change", tampilkanTabel);

tampilkanSemua();