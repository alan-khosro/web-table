
# Web Table
Converts data to a html table. It is
- very tiny (2kb min.js.gzip) with no dependency
- web component and easy to use: import the js file and use `<web-table>` tag 
- sortable
- searchable (filterable)
- filter out unwanted columns or/and rename columns
- flexible data input: csv, json, records, arrays
- configurable by user or by programmer
- Setting ui and battery included

## DEMO: 
- [Documentation](https://alan-khosro.github.io/web-table/)
- [Simple Usage](https://alan-khosro.github.io/web-table/examples/simple-usage.html)
- [Usage with options](https://alan-khosro.github.io/web-table/examples/options-usage-example.html)
- [Advanced Usage](https://alan-khosro.github.io/web-table/examples/advanced-usage.html)



### Simple Usage
Import library and initiate the table with a data url to populate it

- [View source code example](https://raw.githubusercontent.com/alan-khosro/web-table/main/examples/simple-usage.html)


```html
<script src="../dist/web-table.js" type="module"></script>

<web-table 
	url="./cash_flow_components.json" 
	datatype="records"
></web-table>
```

User can use its built-in `Settings` ui to tweak irs colors, data source, etc.

### options
- [View source code for options usage](https://raw.githubusercontent.com/alan-khosro/web-table/main/examples/options-usage-example.html)

you can pass optional attributes:
- datatype:
	- records (default): array of object [{col1: "val1", col2: 2},...]
	- csv: to read csv file
	- arrays: array of array [["col1", "col2"],["row11", "row12"],...]
	- headless: array of array with no column names
- data source:
	- can be a url, feeding data with js, or local file
- columns: 
	- provide a list of columns that you want to show
	- the rest of columns in your data will be discarded
	- for headless array, provide column indices: [0, 3]
	- it will show data in the order of columns you provide
	- use comma to separate columns when using inline attributes (see the below example)
- renames:
	- if you need to rename your column names, provide new names
- accent:
	- to change default accent color, provide rgb numbers like accent="150,200,250"
- color:
	- to change default color, provide rgb numbers like color="100,100,100"
- delim:
	- if providing datatype="csv" and delimeter is not comma, provide the seperator

```html
<script src="../dist/web-table.min.js" type="module"></script>

<web-table 
	url="./owid-covid-latest.csv" 
	datatype="csv"
	delim=","
	accent="255, 100, 100",
	columns="location,total_cases_per_million,new_cases_smoothed,total_deaths_per_million,new_deaths_smoothed"
	renames="loc,case_rate,new_cases,deaths_rate,new_deaths"
></web-table>
```

## Advanced Usage
- [View source code for advanced usage](https://raw.githubusercontent.com/alan-khosro/web-table/main/examples/advanced-usage.js)

You can initiate it with no data url and then call its `populate` method in your js file.
It is useful for advanced use case when you need to prepare your data before populating the table.
> Please notice that the webcomponent has **no url** when you are populating data through js
> Please notice the second variable is an object that defines the options

```html
<simple-table></simple-table>
```


## TODO features: YAGNI
- [ ] user settings to save table data as csv, json, arrays
- [ ] user settings to upload local file (file access api)
- [ ] user settings to change columns, renames
- [ ] user settings to update from url
- [ ] pagination
- [ ] refactor to same method updating by user or programmer
- [ ] look for hidden class (UPDATE and PAGINATION) and complete it

Technical Debt:
- [ ] when sorting, it ignores filter values (YAGNI)
- [ ] rewrite updateData method: refactor to take into account updating by user and programmer

## ENDgit