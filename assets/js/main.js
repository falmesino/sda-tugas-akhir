/**
 * ./js/main.js
 * Created by @falmesino
 */

document.addEventListener('DOMContentLoaded', function() {

  /**
   * Deklarasi variabel
   */
  let items = []
  let latestId = 0
  
  const LOCAL_STORAGE_KEY = 'JAJANAN_TRACKER'
  const jumlahJajanan = document.querySelector('#jumlahJajanan')
  const containerJajanan = document.querySelector('#containerJajanan')
  const formSimpan = document.querySelector('#formSimpan')
  const formPencarian = document.querySelector('#formPencarian')
  const formPengurutan = document.querySelector('#formPengurutan')
  const buttonClearLocalStorage = document.querySelector('#buttonClearLocalStorage')

  /**
   * Fungsi untuk melakukan format harga yang sebelumnya
   * hanya angka biasa menjadi format mata uang rupiah
   * yang mudah dibaca oleh manusia
   */
  function formatRupiah(string) {
    return "Rp" + string.toLocaleString("id-ID") + ",-"
  }

  /**
   * Fungsi untuk melakukan format tanggal menjadi
   * format yang mudah dibaca oleh manusia
   * dari '2024-10-30' menjadi 'Senin, 30 Oktober 2023'
   */
  function formatTanggal(date) {
    if (!dateFns || !dateFns.locale.id) {
      console.error("Error loading date-fns or locale")
      return date
    }

    const formattedDate = dateFns.format(date, "EEEE, dd MMMM yyyy", { locale: dateFns.locale.id })
    return formattedDate
  }

  /**
   * Fungsi untuk mendapatkan tanggal hari ini
   * Menggunakan dateFns untuk mengubah formatnya menjadi
   * Tahun-Bulan-Hari
   */
  function tanggalHariIni() {
    const date = new Date()
    const formattedDate = dateFns.format(date, 'yyyy-MM-dd')

    return formattedDate
  }

  function bubbleSort(data, field = 'price', direction = 'asc') {
    let n = data.length
    let swapped

    do {
      swapped = false
      for (let i = 0; i < n - 1; i++) {
        if (direction === 'asc') {
          if (data[i][field] > data[i + 1][field]) {
            [data[i], data[i + 1]] = [data[i + 1], data[i]]
            swapped = true
          }
        } else {
          if (data[i][field] < data[i + 1][field]) {
            [data[i], data[i + 1]] = [data[i + 1], data[i]]
            swapped = true
          }
        }
      }
      n--
    } while (swapped)

    return data
  }

  function linearSearch(data, targetName) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].name.toLowerCase() === targetName.toLowerCase()) {
        return data[i]
      }
    }
    return null
  }

  /**
   * Mengosongkan form simpan dan mengatur isi dari inputan tanggal
   * menjadi tanggal hari ini
   */
  function resetForm() {
    formSimpan.querySelector('#id').value = ''
    formSimpan.querySelector('#nama').value = ''
    formSimpan.querySelector('#harga').value = 1000
    formSimpan.querySelector('#tanggal').value = tanggalHariIni()
    formSimpan.querySelector('button[type="submit"]').innerHTML = 'Simpan'
    formSimpan.querySelector('#id').parentElement.classList.add('d-none')
  }

  /**
   * Mengosonkgan penampung data jajanan
   */
  function clearContainerJajanan() {
    containerJajanan.innerHTML = ''
  }

  /**
   * Menampilkan data jajanan 
   */
  function renderItem(data, key) {
    const tanggalFormat = data?.date ? formatTanggal(data?.date) : '-'
    const hargaFormat = formatRupiah(data?.price || 0)

    const html = `
      <div class="card" data-key="${key}">
        <div class="card-body p-0 d-flex flex-column align-items-stretch justify-content-start gap-3">
          <div class="row p-4 pb-0">
            <div class="col-8 d-flex flex-column align-items-start justify-content-center">
              <p class="m-0 p-0 fw-normal text-secondary lh-1">
                <small>#${data?.id | '-'}</small>
              </p>
              <p class="p-0 m-0 fs-4 fw-bold lh-1">
                ${data?.name || '-'}
              </p>
              <p class="p-0 m-0">
                <small>
                  ${tanggalFormat}
                </small>
              </p>
            </div>
            <div class="col-4 d-flex flex-column align-items-end justify-content-center">
              <p class="p-0 m-0 fs-6 fw-bold lh-1">${hargaFormat}</p>
            </div>
          </div><!--/ .row -->
          <div class="border-top border-dark-subtle py-3 px-4">
            <button type="button" class="btn btn-sm btn-dark" data-action="edit" data-id="${data?.id || 0}">
              Perbarui
            </button>
            <button type="button" class="btn btn-sm btn-dark" data-action="hapus" data-id="${data?.id || 0}">
              Hapus
            </button>
          </div>
        </div><!--/ .card-body -->
      </div><!--/ .card -->
    `

    containerJajanan.innerHTML += html
  }

  /**
   * Fungsi menampilkan data jajanan
   * - Bersihkan dulu data sebelumnya di tampilan
   * - Isi kembali datanya sesuai data dari parameter items 
   */
  function renderItems(items) {
    clearContainerJajanan()

    items.forEach((item, key) => {
      renderItem(item, key)
    })

    jumlahJajanan.innerHTML = items.length
  }

  // Mendapatkan id terakhir supaya tidak ada duplikat
  function getLatestId(items) {
    return items.length > 0 ? Math.max(...items.map(item => item.id)) : 0
  }

  // Menyimpan data ke dalam localStorage
  function saveToLocalStorage(items) {
    if (items) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items))
    }
  }

  // Membaca data dari localStorage
  function loadFromLocalStorage() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    return data ? JSON.parse(data) : null
  }

  // Membersihkan localStorage
  function clearLocalStorage() {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    location.reload()
  }

  async function fetchData() {
    const localStorageData = loadFromLocalStorage()

    if (localStorageData) {
      console.log('Data sudah ada di localStorage')
      items = localStorageData
    } else {
      console.log('Data belum ada di localStorage, isi dari data.json')
      try {
        const response = await fetch('data.json')
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }
        items = await response.json()
        saveToLocalStorage(items)
        // console.log('fetchData', data)
  
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
  
    latestId = getLatestId(items)
    bubbleSort(items, 'id', 'desc')
    renderItems(items)
  }

  /**
   * Tombol 'Bersihkan LocalStorage'
   * Berfungsi untuk mengosongkan data di localStorage
   * lalu memuat ulang data bawaan dari ./data.json
   */
  buttonClearLocalStorage.addEventListener('click', (e) => {
    e.preventDefault()
    const confirm = window.confirm("Kosongkan LocalStorage?")

    if (confirm) {
      clearLocalStorage()
    }
    return false
  })

  /**
   * Formulir Pencarian
   * Mencari data jajanan menggunakan fungsi linearSearch()
   */
  formPencarian.addEventListener('submit', (e) => {
    e.preventDefault()

    const inputKataKunci = formPencarian.querySelector('#search')
    const kataKunci = inputKataKunci.value

    const pencarian = linearSearch(items, kataKunci)

    if (pencarian) {
      itemsPencarian = items.filter(item => item.id === pencarian.id)
      renderItems(itemsPencarian)
    } else {
      window.alert(`Jajanan dengan nama ${kataKunci} tidak ditemukan!`)
    }

    return false
  })

  /**
   * Event ketika formulir pencarian direset
   * - Mengosonkan inputan kata kunci
   * - Menampilkan kembali semua data jajanan
   */
  formPencarian.addEventListener('reset', (e) => {
    const inputKataKunci = formPencarian.querySelector('#search')

    inputKataKunci.value = ''
    renderItems(items)
  })

  /**
   * Event ketika formulir pengurutan disubmit
   * Mengurutkan data jajanan berdasarkna kolom yang dipilih (field)
   * dan arah pengurutan (direction)
   */
  formPengurutan.addEventListener('submit', (e) => {
    e.preventDefault()
    const selectField = formPengurutan.querySelector('#field')
    const selectDirection = formPengurutan.querySelector('#direction')

    const field = selectField.value
    const direction = selectDirection.value

    const itemsTemp = bubbleSort(items, field, direction)
    renderItems(itemsTemp)

    return false
  })

  /**
   * Event ketika formulir pengurutan direset
   */
  formPengurutan.addEventListener('reset', (e) => {
    console.log('reset sort')
    renderItems(items)
  })
  
  /**
   * Event ketika formulir simpan disubmit
   * Jika inputan id ada, berarti sedang edit
   * Jika inputan id tidak ada, berarti sedang tambah baru
   * Setelah berhasil simpan data ke localStorage
   * Urutkan data jajanan berdasarkan id secara descending (turun)
   * Tampilkan data jajanan terbaru
   */
  formSimpan.addEventListener('submit', (e) => {
    e.preventDefault()

    const inputId = formSimpan.querySelector('#id')
    const inputNama = formSimpan.querySelector('#nama')
    const inputHarga = formSimpan.querySelector('#harga')
    const inputTanggal = formSimpan.querySelector('#tanggal')

    const isEdit = !inputId.parentElement.classList.contains('d-none')

    const payload = {
      id: Number(isEdit ? inputId.value : getLatestId(items) + 1),
      name: inputNama.value,
      price: Number(inputHarga.value),
      date: inputTanggal.value
    }

    if (isEdit) {
      items = items.map((item) => {
        if (item.id === payload.id) {
          return {
            ...item,
            ...payload
          }
        } else {
          return item
        }
      })
    } else {
      items.push(payload)
      bubbleSort(items, 'id', 'desc')
    }

    // console.log(`${isEdit ? 'Perbarui' : 'Tambah'}`, payload)

    resetForm()
    saveToLocalStorage(items)
    renderItems(items)

    return false
  })

  /**
   * Event ketika formulir simpan direset
   */
  formSimpan.addEventListener('reset', (e) => {
    resetForm()
  })

  /**
   * Event ketika data jajanan diklik
   * Jika yang diklik adalah tombol hapus, ya hapus data
   * Jika yang diklik adalah tombol edit, isi data di formulir simpan
   * Keluarkan inputan ID untuk mengetahui kalau kita mau edit data
   */
  containerJajanan.addEventListener('click', (e) => {

    // Aksi hapus jajanan
    if (e.target.matches('[data-action="hapus"')) {
      e.preventDefault()
      const id = e.target.getAttribute('data-id')
      const confirm = window.confirm(`Hapus jajanan dengan id ${id}?`)

      if (confirm) {
        // console.log('hapus jajanan', id)
        items = items.filter(item => item.id !== Number(id))
        getLatestId(items)
        saveToLocalStorage(items)
        renderItems(items)
      }
      return false
    }

    // Aksi edit jajanan
    if (e.target.matches('[data-action="edit"]')) {
      e.preventDefault()
      const id = e.target.getAttribute('data-id')
      const item = items.find(item => item.id === Number(id))

      formSimpan.querySelector('#id').value = item?.id || ''
      formSimpan.querySelector('#nama').value = item?.name || ''
      formSimpan.querySelector('#harga').value = item?.price || 0
      formSimpan.querySelector('#tanggal').value = item?.date || ''
      formSimpan.querySelector('button[type="submit"]').innerHTML = 'Perbarui'
      formSimpan.querySelector('#id').parentElement.classList.remove('d-none')

      return false
    }
  })

  /**
   * Event ketika aplikasi baru dijalankan
   * - Bersihkan form
   * - Ambil data dari localStorage atau ./data.json jika 
   *   di localStorage belum ada datanya
   */
  resetForm()
  fetchData()
})