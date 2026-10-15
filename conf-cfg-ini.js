/**
 * @typedef {Object} ConfigOptions
 * @property {string} [lineEnding]
 * @property {string} [sectionOpenIdentifier]
 * @property {string} [sectionCloseIdentifier]
 * @property {*} [defaultValue]
 * @property {string} [assignIdentifier]
 * @property {string} [valueIdentifier]
 * @property {string[]} [commentIdentifiers]
 * @property {boolean} [trimLines]
 * @property {boolean} [ignoreMultipleAssignIdentifier]
 * @property {boolean} [sectionsAsArrays]
 */

/**
 * Encode and decode ini/conf/cfg files
 * @author Rolf Loges
 * @licence MIT
 * @param {ConfigOptions} options
 */
function Config(options){
    this.options = {
        lineEnding: "\r\n",
        sectionOpenIdentifier: '[',
        sectionCloseIdentifier: ']',
        defaultValue: true,
        assignIdentifier: "=",
        valueIdentifier: undefined,
        commentIdentifiers: [";"],
        trimLines: true,
        ignoreMultipleAssignIdentifier: false,
        sectionsAsArrays: false
    };
    if(typeof options === 'object'){
        this.setOptions(options);
    }
}

/**
 * Decode a config-string
 * 
 * @param {string} data
 * @return {{}}
 */
Config.prototype.decode = function(data){
    if(typeof data != 'string'){
        if(typeof data.toString === 'function'){
            data = data.toString();
        } else {
            throw new Error('expecting string but got '+typeof data);
        }
    }
    var result = {};
    var currentTarget = result;
    var lines = data.split(this.options.lineEnding);
    var sectionRegExp = new RegExp("^"+escapeRegExp(this.options.sectionOpenIdentifier)+"(.*?)"+escapeRegExp(this.options.sectionCloseIdentifier)+"$");
    for(var i = 0; i < lines.length; i++){
        var line = lines[i];
        if(this.options.trimLines === true){
            line = line.trim();
        }
        if(line.length == 0 || stringBeginsWithOnOfTheseStrings(line,this.options.commentIdentifiers)){
            continue;
        }
        
        var newSection = line.match(sectionRegExp);
        if(newSection !== null){
            currentTarget = openSection(result, newSection[1], this.options.sectionsAsArrays === true);
            continue;
        }

        var assignPosition = line.indexOf(this.options.assignIdentifier);
        var key = undefined;
        var value = undefined;
        if(assignPosition === -1){
            key = line;
            value = this.options.defaultValue;
        } else {
            var assignIdentifierLength = this.options.assignIdentifier.length
            if (this.options.ignoreMultipleAssignIdentifier) {
                var regExp = new RegExp(escapeRegExp(this.options.assignIdentifier) + '+')
                var matchResult = line.match(regExp)
                if (matchResult !== null) {
                    assignIdentifierLength = matchResult[0].length
                }
            }
            key = line.substr(0,assignPosition);
            value = line.substr(assignPosition+assignIdentifierLength);
        }
        if (typeof this.options.valueIdentifier === 'string') {
            value = this.valueTrim(value, this.options.valueIdentifier);
        }
        if (protectedKeys.indexOf(key) !== -1) {
            continue;
        }
        currentTarget[key] = value;
    }
    return result;
}

/**
 * Encode a object
 * no nesting section supported!
 * 
 * @param {{}} object
 * @return {string}
 */
Config.prototype.encode = function(object){
    var strayLines = "";
    var sections = [];
    var keys = Object.keys(object);
    for(var i = 0; i < keys.length; i++){
        var value = object[keys[i]];
        if(typeof value !== 'object'){
            strayLines += keys[i] + this.options.assignIdentifier + value + this.options.lineEnding;
            continue;
        }
        var entries = this.options.sectionsAsArrays === true && isListOfSections(value) ? value : [value];
        for(var k = 0; k < entries.length; k++){
            sections.push(encodeSection(this.options, keys[i], entries[k]));
        }
    }
    return strayLines + sections.join(this.options.lineEnding);
}

/**
 * Set Options
 * @param {ConfigOptions} options
 */
Config.prototype.setOptions = function(options){
    if(typeof options !== 'object'){
        throw new Error('expecting object but got '+typeof options);
    }
    var option = Object.keys(options);
    for(var i = 0; i < option.length; i++){
        if(typeof options[option[i]] !== 'undefined'){
            this.options[option[i]] = options[option[i]];
        }
    }
}

/**
 * Try to detect the used line ending
 * (windows, unix, mac)
 * @param {string} data
 * @return {string}
 */
Config.prototype.detectLineEnding = function(data){
    var hasCaridgeReturn = data.indexOf("\r") !== -1;
    var hasLineFeed = data.indexOf("\n") !== -1
    if(hasCaridgeReturn && hasLineFeed){
        if(data.indexOf("\r\n") !== -1){
            return "\r\n";
        } else if(data.indexOf("\n\r") !== -1){
            return "\n\r";
        } else {
            throw new Error('found multiple line endings');
        }
    } else if(hasLineFeed){
        return "\n";
    } else if(hasCaridgeReturn){
        return "\r";
    } else {
        return "\n";
    }
}

/**
 * @param string value
 * @param string chars
 */
Config.prototype.valueTrim = function(value, chars){
    var charsEscaped = escapeRegExp(chars);
    var regEx = new RegExp("^["+charsEscaped+"]?");
    value = value.replace(regEx, '');
    regEx = new RegExp("["+charsEscaped+"]?$");
    value = value.replace(regEx, '');
    return value;
}

var protectedKeys = ['__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', '__proto__'];

/**
 * Return the object the keys of section `name` are written to.
 * Keys of protected sections, or of sections whose name is already used by a
 * stray key, go to a detached object and are dropped.
 * Only own properties count, so names like `constructor` or `toString`
 * never resolve to inherited members of Object.prototype.
 * With `asArray` every occurrence of a section gets its own object, appended
 * to an array; otherwise repeated sections share (and merge into) one object.
 * @param {{}} result
 * @param {string} name
 * @param {boolean} asArray
 * @return {{}}
 */
function openSection(result, name, asArray){
    if(protectedKeys.indexOf(name) !== -1){
        return {};
    }
    if(!Object.prototype.hasOwnProperty.call(result, name)){
        result[name] = asArray ? [] : {};
    }
    var existing = result[name];
    if(!asArray){
        return isSectionObject(existing) ? existing : {};
    }
    if(!Array.isArray(existing)){
        return {};
    }
    var section = {};
    existing.push(section);
    return section;
}

/**
 * True for values that hold the keys of a section: objects, but not null or arrays.
 * @param {*} value
 * @return {boolean}
 */
function isSectionObject(value){
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * True for a non-empty array of section objects, which is encoded as repeated
 * sections. Other arrays (e.g. of strings) are encoded as a single section
 * with index keys, as without `sectionsAsArrays`.
 * @param {*} value
 * @return {boolean}
 */
function isListOfSections(value){
    return Array.isArray(value) && value.length > 0 && value.every(isSectionObject);
}

/**
 * Encode one section: header line followed by one line per key,
 * terminated by a line ending.
 *
 * @param {ConfigOptions} options
 * @param {string} name
 * @param {{}} section
 * @return {string}
 */
function encodeSection(options, name, section){
    var valueIdentifier = typeof options.valueIdentifier === 'string' ? options.valueIdentifier : "";
    var result = options.sectionOpenIdentifier + name + options.sectionCloseIdentifier + options.lineEnding;
    var keys = Object.keys(section);
    for(var i = 0; i < keys.length; i++){
        result += keys[i] + options.assignIdentifier + valueIdentifier + section[keys[i]] + valueIdentifier + options.lineEnding;
    }
    return result;
}

/**
 * @param {string} string
 * @param {string[]} stringList
 * @return {boolean}
 */
function stringBeginsWithOnOfTheseStrings(string, stringList){
    for(var i = 0; i < stringList.length; i++){
        if(string.indexOf(stringList[i]) === 0){
            return true;
        }
    }
    return false;
}

/**
 * @param {string} string
 * @returns {string}
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = Config;
