/**
 * Creates a new string builder with a specified value
 * @param {string} value The initial value of the string builder
 */
function StringBuilder(value) {
    this.strings = new Array();
    this.append(value);
}

/**
 * Appends a string to the string builder
 * @param {string} value The string to append 
 */
StringBuilder.prototype.append = function (value) {
    if (value) {
        this.strings.push(value);
    }
}

/**
 * Clears the value of the string builder
 */
StringBuilder.prototype.clear = function () {
    this.strings.length = 0;
}

/**
 * Converts the string builder to a string
 */
StringBuilder.prototype.toString = function () {
    return this.strings.join("");
}

exports.StringBuilder = StringBuilder;