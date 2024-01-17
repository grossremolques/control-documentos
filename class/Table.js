let currentPage = 0;
let itemsPerPage = 14;
let isFiltered = false;
let dataFilter;
let cantPag;
const FilterValues = {}
const PartesInteresadas = []
class Table {
    static async load(header, title) {
        await loadPage('./html/table.html')
        prevButton = document.getElementById('prevPage');
        nextButton = document.getElementById('nextPage');
        footPage = document.getElementById('footPage');
        tableBody = document.getElementById('tableBody')
    
        const titleTable = document.getElementById('titleTable');
        titleTable.innerText = title
        const rowHeader = document.getElementById('rowHeader');
        header.map(item => {
            let th = document.createElement('th');
            let textCell = document.createTextNode(item);
            th.appendChild(textCell);
            let parentNode = rowHeader.parentNode;
            parentNode.insertBefore(th, rowHeader)
        })
        await loadStatus('status_filter');
        await loadTypesOfDocuments('tipo_filter');
        await loadProcesos('proceso_filter');
        await loadResponsables('responsable_filter')
    }
    static loadBodyTable(page, data) {
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        tableBody.innerHTML = '';
        for (let i = start; i < end && i < data.length; i++) {
            const url = {}
            if((data[i].status == 'Aprobado' || data[i].status == 'En revisión') && data[i].url){
                url.visibility = '',
                url.text = 'Link',
                url.link = data[i].url
            }
            else {
                url.visibility = 'disabled',
                url.text = 'No link',
                url.link = '#'
            }
            tableBody.innerHTML += `
            <tr>
                <td>${data[i].codigo}</td>
                <td>${data[i].tipo}</td>
                <td>${data[i].nombre}</td>
                <td>${data[i].rev}</td>
                <td>${data[i].status}</td>
                <td>
                    <a class="btn btn-success w-100 btn-sm ${url.visibility}"
                    href="${url.link}"
                    target="_blank"
                    role="button">
                    ${url.text}
                    </a>
                </td>
                
                <td data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
                    <i id="${data[i].codigo}" class="bi bi-eye table-btn-icon" onclick="handleOpenCard(event)"></i>
                </td>
            </tr>
            `
        }
        if (page !== 0) {
            prevButton.removeAttribute('disabled', '')
        }
        else {
            prevButton.setAttribute('disabled', '')
        }
        cantPag = Math.ceil(data.length / itemsPerPage)
        footPage.innerText = `Pág ${currentPage + 1} de ${cantPag}`;
    }
    static nextPage() {
        let newData = isFiltered ? dataFilter : dataTable
        if (currentPage < Math.ceil(newData.length / itemsPerPage) - 1) {
          currentPage++;
          this.loadBodyTable(currentPage, newData);
        }
    }
    static prevPage() {
        let newData = isFiltered ? dataFilter : dataTable
        if (currentPage > 0) {
            currentPage--;
            this.loadBodyTable(currentPage, newData);
        }
    }
    static simpleFilter(event) {
        let word = normalizeString(event.target.value);
        dataFilter = dataTable.filter(item => {
            if (item.nombre) {
                let normalizedItemName = normalizeString(item.nombre);
                return normalizedItemName.includes(word);
            }
        });
        this.loadBodyTable(currentPage, dataFilter);
        isFiltered = true;
    }
    static async filter(event) {
        event.preventDefault();
        const formFilter = document.getElementById('formFilter');
        const inputsFilter = formFilter.querySelectorAll('.filter-value');
        inputsFilter.forEach(item => {FilterValues[item.name] = item.value});
        dataFilter = this.getDataFiltered(dataTable, FilterValues);
        /* let from = document.getElementById('fromDate').value;
        let to = document.getElementById('toDate').value;
        dataFilter = datesFiltered(from, to, dataFilter) */
        this.loadBodyTable(currentPage,dataFilter);
        isFiltered = true;
    }
    static getDataFiltered(data, filtro) {
        return data.filter(item => {
            for (let key in filtro) {
                if (filtro[key] !== '' && String(item[key]) !== filtro[key]) {
                    return false;
                }
            }
            return true;
        });
    }
    static addPI() {
        const PI_value = document.getElementById('filter_partes_interesadas').value
        PartesInteresadas.push(PI_value)
        const badgeItems = document.getElementById('badgeItems')
        let span = document.createElement('span');
        let closeBtn = `${PI_value} <button onclick="deletePI(event)"><i id="${PI_value}" class="bi bi-x"></i></button>`
        span.setAttribute('class','badge')
        span.innerHTML = closeBtn
        badgeItems.appendChild(span)
        document.getElementById('filter_partes_interesadas').value =''
    }
    static deletePI(event) {
        const nodoSpan = event.target.closest('span');
        if(event.target.id) {
            let name = event.target.id;
            const indexDelete = PartesInteresadas.indexOf(name);
            PartesInteresadas.splice(indexDelete,1);
            nodoSpan.remove()
        }
    }
}