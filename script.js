const qrisOrderKuota = "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214520146378043870303UMI51440014ID.CO.QRIS.WWW0215ID20243618270230303UMI5204541153033605802ID5919STOK RESS OK21423066007CILEGON61054241162070703A016304F736";
const apiSimpelBot = "new2025";
const apikeyorkut = "https://simpelz.fahriofficial.my.id";
const merchantIdOrderKuota = "OK2142306";
const apiOrderKuota = "700336617360840832142306OKCT7A1A4292BE20CEF492B467C5B6EAC103";

let timeout;
let interval;

function toIDR(value) {
  return Number(value).toLocaleString('id-ID');
}

function getRandomFee(min = 100, max = 500) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function buatPembayaran() {
  const nominal = Number(document.getElementById("nominal").value);
  const fee = getRandomFee(); // fee acak 100-500
  const amount = nominal + fee;

  try {
    const res = await fetch(`${apikeyorkut}/api/orkut/createpayment?apikey=${apiSimpelBot}&amount=${amount}&codeqr=${qrisOrderKuota}`);
    const data = await res.json();

    const result = data.result;
    if (!result || !result.transactionId) throw new Error("Gagal membuat QRIS");

    document.getElementById("infoPembayaran").classList.remove("hidden");
    document.getElementById("qrImage").src = result.qrImageUrl;

    document.getElementById("detailPembayaran").textContent =
`乂 INFORMASI PEMBAYARAN

• ID : ${result.transactionId}
• Barang : Panel Pterodactyl
• Expired : 5 menit

• Harga Asli : Rp${toIDR(nominal)}
• Biaya Admin : Rp${toIDR(fee)}
• Total Pembayaran : Rp${toIDR(result.amount)}

Note : QRIS hanya berlaku selama 5 menit.`;

    clearTimeout(timeout);
    clearInterval(interval);

    timeout = setTimeout(() => {
      alert("QRIS Pembayaran telah expired!");
      document.getElementById("infoPembayaran").classList.add("hidden");
    }, 5 * 60 * 1000);

    interval = setInterval(async () => {
      const cek = await fetch(`${apikeyorkut}/api/orkut/cekstatus?apikey=${apiSimpelBot}&merchant=${merchantIdOrderKuota}&keyorkut=${apiOrderKuota}`);
      const json = await cek.json();

      if (json?.amount == result.amount.toString()) {
        clearInterval(interval);
        clearTimeout(timeout);
        alert(`PEMBAYARAN BERHASIL DITERIMA ✅

• ID : ${result.transactionId}
• Total : Rp${toIDR(result.amount)}
• Barang : Panel Pterodactyl`);

        document.getElementById("infoPembayaran").classList.add("hidden");
      }
    }, 8000);

  } catch (error) {
    console.error(error);
    alert("Terjadi kesalahan saat memproses pembayaran.");
  }
}