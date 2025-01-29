/**
 * ./js/main.js
 * Created by @falmesino
 */

document.addEventListener('DOMContentLoaded', function() {

  let items = []

  const jumlahJajanan = document.querySelector('#jumlahJajanan')
  const containerJajanan = document.querySelector('#containerJajanan')
  const formSimpan = document.querySelector('#formSimpan')
  const formPencarian = document.querySelector('#formPencarian')
  const buttonUrutkan = document.querySelector('#buttonUrutkan')

  function formatRupiah(string) {
    return "Rp" + string.toLocaleString("id-ID") + ",-"
  }

  function formatTanggal(date) {
    if (!dateFns || !dateFns.locale.id) {
      console.error("Error loading date-fns or locale")
      return date
    }

    const formattedDate = dateFns.format(date, "EEEE, dd MMMM yyyy", { locale: dateFns.locale.id })
    return formattedDate
  }

  function tanggalHariIni() {
    const date = new Date()
    const formattedDate = dateFns.format(date, 'yyyy-MM-dd')

    return formattedDate
  }

  function resetForm() {
    formSimpan.querySelector('#id').value = ''
    formSimpan.querySelector('#nama').value = ''
    formSimpan.querySelector('#harga').value = 1000
    formSimpan.querySelector('#tanggal').value = tanggalHariIni()
    formSimpan.querySelector('button[type="submit"]').innerHTML = 'Simpan'
    formSimpan.querySelector('#id').parentElement.classList.add('d-none')
  }

  function clearContainerJajanan() {
    containerJajanan.innerHTML = ''
  }

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

  function renderItems(items) {
    clearContainerJajanan()

    items.forEach((item, key) => {
      renderItem(item, key)
    })

    jumlahJajanan.innerHTML = items.length
  }

  async function fetchData() {
    try {
      const response = await fetch('data.json')
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
      }
      items = await response.json()
      // console.log('fetchData', data)

      renderItems(items)

    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  formPencarian.addEventListener('submit', (e) => {
    e.preventDefault()
    const inputPencarian = formPencarian.querySelector('#search')
    const kataKunci = inputPencarian.value
    console.log('formPencarian', kataKunci)
    return false
  })
  
  formSimpan.addEventListener('submit', (e) => {
    e.preventDefault()

    const inputId = formSimpan.querySelector('#id')
    const inputNama = formSimpan.querySelector('#nama')
    const inputHarga = formSimpan.querySelector('#harga')
    const inputTanggal = formSimpan.querySelector('#tanggal')

    const isEdit = !inputId.parentElement.classList.contains('d-none')

    const payload = {
      id: Number(isEdit ? inputId.value : items.length + 1),
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
    }

    // console.log(`${isEdit ? 'Perbarui' : 'Tambah'}`, payload)

    resetForm()
    renderItems(items)

    return false
  })

  formSimpan.addEventListener('reset', (e) => {
    resetForm()
  })

  containerJajanan.addEventListener('click', (e) => {

    // Aksi hapus jajanan
    if (e.target.matches('[data-action="hapus"')) {
      e.preventDefault()
      const id = e.target.getAttribute('data-id')
      const confirm = window.confirm(`Hapus jajanan dengan id ${id}?`)

      if (confirm) {
        // console.log('hapus jajanan', id)
        items = items.filter(item => item.id !== Number(id))

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

      // console.log('edit jajanan', item)
      return false
    }
  })

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

  buttonUrutkan.addEventListener('click', (e) => {
    e.preventDefault()
    items = bubbleSort(items, 'price', 'desc')
    renderItems(items)
    return false
  })

  resetForm()
  fetchData()

})