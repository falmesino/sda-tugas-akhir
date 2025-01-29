/**
 * ./js/main.js
 * Created by @falmesino
 */

document.addEventListener('DOMContentLoaded', function() {

  const containerJajanan = document.querySelector('#containerJajanan')
  const formSimpan = document.querySelector('#formSimpan')
  const formPencarian = document.querySelector('#formPencarian')
  const buttonUrutkan = document.querySelector('#buttonUrutkan')

  function formatRupiah(string) {
    return "Rp" + string.toLocaleString("id-ID") + ",-"
  }

  function formatTanggal(date) {
    if (!dateFns || !dateFns.locale.id) {
      console.error("Error loading date-fns or locale");
      return date;
    }

    const formattedDate = dateFns.format(date, "EEEE, dd MMMM yyyy", { locale: dateFns.locale.id });
    return formattedDate
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
            <button type="button" class="btn btn-sm btn-dark">
              Perbarui
            </button>
            <button type="button" class="btn btn-sm btn-dark">
              Hapus
            </button>
          </div>
        </div><!--/ .card-body -->
      </div><!--/ .card -->
    `;

    containerJajanan.innerHTML += html;
  }

  async function fetchData() {
    try {
      const response = await fetch('data.json');
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // console.log('fetchData', data);

      clearContainerJajanan();

      data.forEach((item, key) => {
        renderItem(item, key)
      })

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  fetchData();

});