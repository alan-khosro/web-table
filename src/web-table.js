
const html = `
<header>
	<p>
		SORT by <select id="sort-col"></select> column in <input type="checkbox" id="is-descending" checked> Descending order 
	</p>

	<p>
		FILTER by <select id="filter-col"></select> column that includes <input type="search" id="filter-input" size=10> with <input type="checkbox" id="case-sensitive" checked> case sensitive
	</p>
</header>
<details>
	<summary>Settings</summary>

	<p>
		CHANGE color for accent <input type="color" id="accent"> or text <input type="color" id="color">
	</p>

	<p class="hidden">
		UPDATE source data type <select id="data-type"></select> from <input type="url" id="url" size=10> or <button>select file</button> with columns and renames <submit>
	</p>



	<p class="hidden">
		Pagination <input type="checkbox" id="is-pagination"> with page size <input id="page-size" type="range" min="5" max="100" value="20"> go to page <input id="page-number" type="number" min="0" value="0">
	</p>

</details>

<div id="table"></div>
`

const css = `
<style>
	:host{
		--color: 0, 0, 0;
		--accent: 150, 200, 255;

		display: block;	
		overflow: auto;	
		font-family: "sans-serif";
		line-height: 1.5;
		color: rgb(var(--color));
	}
	.hidden {
		display: none;
	}

	details{
		margin: 0.5rem auto;
	}

	table { 
		background-color: rgba(var(--accent), .1);
		border-collapse: collapse; 
	}

	tr { 
		border: 2px solid rgb(var(--accent)); 
	}

	th, td {
		padding: .5rem 1rem;
	}

	thead {
		background-color: rgba(var(--accent), 0.5);
		text-transform: uppercase;
	}
</style>
`

export class WebTable extends HTMLElement {
	constructor() {
		super();

		this.attachShadow({ mode: 'open' }).innerHTML = html + css

		this.extractElements()
		var { url, datatype, columns, renames, delim, accent, color } = this.extractAttributes()

		this.updateData({ url, datatype, columns, renames, delim, accent, color })
	}

	settings() {
		this.datatypeEl
	}

	extractAttributes() {
		return Object.fromEntries(
			this.getAttributeNames()
				.map(key => [key, this.getAttribute(key)])
		)
	}

	shapeData(data, datatype, columns) {

		datatype = datatype || 'records'

		if (columns) {
			this.colNames = columns

			if (datatype == "arrays") {
				const cols = data.shift()
				const indices = this.colNames.map(col => cols.indexOf(col))
				this.rows = data.map(row => indices.map(i => row[i]))

			} else if (datatype == "headless") {
				this.rows = data.map(row => this.colNames.map(i => row[i]))

			} else if (datatype == "records") {
				this.rows = data.map(row => this.colNames.map(col => row[col]))
			}

		} else {
			if (datatype == "arrays") {
				this.colNames = data.shift()

				this.rows = data
			} else if (datatype == "headless") {
				this.colNames = Object.keys(data[0])

				this.rows = data
			} else if (datatype == "records") {
				this.colNames = Object.keys(data[0])

				this.rows = data.map(Object.values)
			}
		}

	}

	populate(data, { columns, datatype, renames }) {

		this.shapeData(data, datatype, columns)
		if (renames) {
			this.colNames = renames
		}

		// convert to number and strip
		this.rows = this.rows.map(row => row.map(x => (x && isNaN(x)) ? x.replace(/^["' ]+|["' ]+$/g, '') : +x))
		// strip quatation and space from col names
		this.colNames = this.colNames.map(col => col.replace(/^["' ]+|["' ]+$/g, ''))

		this.populateHeaderColNames()
		this.addEventListeners()


		this.table.innerHTML = this.createTable(this.colNames, this.rows)

	}

	extractElements() {
		this.sortCol = this.shadowRoot.querySelector("#sort-col");
		this.isDescending = this.shadowRoot.querySelector('#is-descending')

		this.filterCol = this.shadowRoot.querySelector("#filter-col")
		this.filterInput = this.shadowRoot.querySelector("#filter-input")

		this.caseSensitive = this.shadowRoot.querySelector("#case-sensitive")

		this.table = this.shadowRoot.querySelector("#table")

		this.accent = this.shadowRoot.querySelector("#accent")
		this.color = this.shadowRoot.querySelector("#color")
		this.style = this.shadowRoot.host.style

		this.datatypeEl = this.shadowRoot.querySelector("#data-type")
	}

	addEventListeners() {
		this.sortCol.addEventListener('change', () => this.sortTable())
		this.isDescending.addEventListener('change', () => this.sortTable())

		this.filterInput.addEventListener('input', () => this.filterTable())
		this.caseSensitive.addEventListener('change', () => this.filterTable())
		this.filterCol.addEventListener('change', () => this.filterTable())

		this.accent.addEventListener('change', e => this.changeColor("--accent", e.target.value))
		this.color.addEventListener('change', e => this.changeColor("--color", e.target.value))

		///////////// TODO:
		//??????????????????????????????????????????
		//this.datatypeEl.addEventListener("blur", updateData)
	}

	async updateData({ url, datatype, columns, renames, delim, accent, color }) {
		accent && this.shadowRoot.host.style.setProperty("--accent", accent)
		color && this.shadowRoot.host.style.setProperty("--color", color)

		delim = delim || ','
		renames = renames && renames.split(',')
		columns = columns && columns.split(',')

		if (url && datatype == "csv") {
			fetch(url)
				.then(r => r.text())
				.then(text => text.split(/[\n\r]+/).map(line => line.split(delim)))
				.then(data => {
					// delete last row if it is empty (csv ends with \n)
					const lastRow = data.at(-1)
					if (lastRow.length == 1 && !lastRow[0]) {
						data.pop()
					}

					this.populate(data, { datatype: "arrays", columns, renames })
				})
		} else if (url) {
			fetch(url)
				.then(r => r.json())
				.then(data => this.populate(data, { datatype, columns, renames }))
		}
	}

	hexToRgb(hex) {
		const bigint = parseInt(hex, 16);
		const r = (bigint >> 16) & 255;
		const g = (bigint >> 8) & 255;
		const b = bigint & 255;

		return r + "," + g + "," + b;
	}

	changeColor(varName, hex) {
		this.style.setProperty(varName, this.hexToRgb(hex.slice(1)))
	}

	sortTable() {
		const colIndex = this.sortCol.value
		const isDescending = this.isDescending.checked ? 1 : -1

		this.rows.sort((row1, row2) => row1[colIndex] < row2[colIndex] ? isDescending : -isDescending)

		this.table.innerHTML = this.createTable(this.colNames, this.rows)
	}

	filterTable() {
		const isCaseSensitive = this.caseSensitive.checked
		const colIndex = this.filterCol.value
		const val = isCaseSensitive ? this.filterInput.value : this.filterInput.value.toLowerCase()

		if (isCaseSensitive) {
			var filteredRows = this.rows.filter(row => (row[colIndex] + "").includes(val))
		} else {
			var filteredRows = this.rows.filter(row => (row[colIndex] + "").toLowerCase().includes(val))
		}

		this.table.innerHTML = this.createTable(this.colNames, filteredRows)

	}

	populateHeaderColNames() {
		this.colNames.forEach((colName, i) => {
			this.sortCol.add(new Option(colName, i))
			this.filterCol.add(new Option(colName, i))
		});
	}

	createTable(colNames, rows) {
		return `
			<table>
				<thead>${getCells(colNames, 'th')}</thead>
				<tbody>${rows.map(getRow).join('')}</tbody>
			</table>
		`;

		function getRow(row) {
			return `<tr> ${getCell(row[0], 'th')} ${getCells(row.slice(1))} </tr>`
		}

		function getCell(cell, type = 'td') {
			return `<${type}>${cell.toLocaleString()}</${type}>`
		}
		function getCells(cells, type = 'td') {
			return cells.map(cell => getCell(cell, type)).join('');
		}

	}

}

window.customElements.define("web-table", WebTable)

