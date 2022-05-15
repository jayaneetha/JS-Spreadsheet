const container = document.getElementById("container");
const n_rows = 100;
const n_columns = 100;
let data = [];
const cellNameRegex = "([A-Z]+)(\\d+)"

/**
 * Object blueprint which holds data about cells and their values
 */
class Cell {
    row;
    column_id;
    column;
    value;
    func;

    constructor(row, column, value, func) {
        this.row = row;
        this.column_id = column;
        this.column = getColumnName(column - 1);
        this.value = value;
        this.func = func;
    }

    setValue = (newValue) => {
        this.value = newValue;
        document.getElementById(this.row + "_" + this.column_id).innerHTML = this.value;
    }

    getValue = () => {
        return this.value;
    }

    setFunc = (newFunc) => {
        this.func = newFunc;
    }

    getFunc = () => {
        return this.func;
    }
}

document.getElementById("refresh").addEventListener("click", () => {
    renderGrid();
});

/**
 * Runs when a div loses the focus
 * @param element
 * @param i row index
 * @param j column index
 */
const divContentBlur = (element, i, j) => {
    data[i][j].setValue(element.target.innerHTML);
    if (element.target.innerHTML.startsWith("=")) {
        data[i][j].setFunc(element.target.innerHTML);
    }
    calc();
}

/**
 * Calculate the spreadsheet
 */
const calc = () => {
    for (let i = 0; i <= n_rows; i++) {
        for (let j = 0; j <= n_columns; j++) {
            if (data[i][j].getFunc()) {
                let val = getFuncValue(data[i][j].getFunc());
                data[i][j].setValue(val);
            }
        }
    }
}


/**
 * Get the value of a cell given a cell Name e.g; AB13
 * @param cellName
 * @returns {*|string|number}
 */
const getCellValue = (cellName) => {
    let result = cellName.match(cellNameRegex)
    if (result) {
        let cellValue = data[result[2]].find((cell) => cell.column === result[1]).getValue();
        if (typeof cellValue == "string" && cellValue.trim().length === 0) {
            return 0;
        }
        return cellValue;
    } else {
        return cellName;
    }
}

/**
 * Get the function value
 * @param func function e.g =A19+B13 or =sum(A1:A30)
 * @returns {number|*}
 */
const getFuncValue = (func) => {
    if (func.startsWith("=")) {
        func = func.replaceAll("=", "");
        if (func.includes("+")) {
            const parts = func.split("+");
            return parseFloat(getCellValue(parts[0])) + parseFloat(getCellValue(parts[1]))
        }
        if (func.includes("-")) {
            const parts = func.split("-");
            return parseFloat(getCellValue(parts[0])) - parseFloat(getCellValue(parts[1]))
        }
        if (func.includes("/")) {
            const parts = func.split("/");
            return parseFloat(getCellValue(parts[0])) / parseFloat(getCellValue(parts[1]))
        }
        if (func.includes("*")) {
            const parts = func.split("*");
            return parseFloat(getCellValue(parts[0])) * parseFloat(getCellValue(parts[1]))
        }
        if (func.toLowerCase().startsWith("sum")) {
            let cellNames = [...func.matchAll(cellNameRegex)];
            const rowStart = parseInt(cellNames[0][2])
            const rowEnd = parseInt(cellNames[1][2])

            let sum = 0;

            for (let i = rowStart; i <= rowEnd; i++) {
                sum += parseFloat(getCellValue(cellNames[0][1] + i))
            }

            return sum;
        }
    } else {
        return func;
    }
}

/**
 * Get the column name given an index. eg 1 gives A and 27 gives AA
 * @param num
 * @returns {string}
 */
const getColumnName = (num) => {
    if (num < 0) {
        return '';
    } else {
        return getColumnName(num / 26 - 1) + String.fromCharCode(num % 26 + 65)
    }
}

/**
 * Render the Grid and bind the listeners
 */
const renderGrid = () => {
    container.innerHTML = "";
    data = [];
    for (let i = 0; i < n_rows + 1; i++) {
        const cols = [];
        for (let j = 0; j < n_columns + 1; j++) {
            cols.push(new Cell(i, j, '', ''))

            const div = document.createElement("div");
            div.setAttribute("id", i + "_" + j);

            let editable = true

            if (i === 0 && j === 0) {
                editable = false
            } else if (i === 0) {
                editable = false
                div.innerHTML = getColumnName(j - 1);
                div.setAttribute("class", "cell headerCell");
            } else if (j === 0) {
                editable = false
                div.innerHTML = i
                div.setAttribute("class", "cell headerCell");

            } else {
                div.innerHTML = "";
                div.setAttribute("class", "cell");
            }

            div.setAttribute("contenteditable", editable);
            div.addEventListener("blur", (event) => divContentBlur(event, i, j));

            container.appendChild(div)
        }
        data.push(cols);
    }
}

renderGrid();


