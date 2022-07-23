
import { WebTable } from "https://cdn.jsdelivr.net/gh/alan-khosro/web-table/dist/web-table.min.js"
const tableEl = document.querySelector("web-table")

const url = "https://cdn.jsdelivr.net/gh/alan-khosro/web-table/examples/cash_flow_components.json"
const discount_factor = 0.1

fetch(url)
	.then(r => r.json())
	.then(data => {
		data.forEach(row => transform(row, discount_factor))
		data = data.map(formats)

		const renames = ["symbol", "ev", "static value", "growth value", "total value"]

		tableEl.populate(data, { datatype: "headless", renames })
	})

function transform(row, discount_factor) {
	row["static value"] = row["current fcf"] / discount_factor / row["ev"]
	row["growth value"] = row["delta fcf"] / (discount_factor * discount_factor) / row["ev"]
	row["total value"] = row["static value"] + row["growth value"]
	return row
}

const format = (number, precision) => Math.round(number * precision) / precision

const formats = row => [
	row["symbol"],
	Math.round(row["ev"] / 10e9),
	format(row["static value"], 10),
	format(row["growth value"], 10),
	format(row["total value"], 10)
]
