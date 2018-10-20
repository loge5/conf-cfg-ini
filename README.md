# conf-cfg-ini

[![npm version](https://badge.fury.io/js/conf-cfg-ini.svg)](http://badge.fury.io/js/conf-cfg-ini)
[![Build Status](https://travis-ci.org/loge5/conf-cfg-ini.svg?branch=master)](https://travis-ci.org/loge5/conf-cfg-ini)
[![Dependencies](https://david-dm.org/loge5/conf-cfg-ini.svg)](https://david-dm.org/loge5/conf-cfg-ini) 
[![devDependency Status](https://david-dm.org/loge5/conf-cfg-ini/dev-status.svg)](https://david-dm.org/loge5/conf-cfg-ini#info=devDependencies)

**Encode and decode conf/cfg/ini-Files with Node.js**

loge5/conf-cfg-ini

There are already a lot of ini-parser on the npm repository. 
But none of these fits all my needs. 
So here is an attempt to create a very flexible but easy to use parser.

**Features**
- Linebreak detection (windows, unix, mac)
- Set custom identifiers for sections, comments and assignments
- line trim is optional
- set default value
- tested with mocha+chai

### Installation ###
```Shell
npm install conf-cfg-ini
```

### Usage ###
```JavaScript
//read config-String from file
var fs = require('fs');
var raw = fs.readFileSync('./test.ini');

var Config = require('conf-cfg-ini');
var config = new Config();
config.options.lineEnding = config.detectLineEnding(raw);

//decode to get a simple js object
var configObject = config.decode(raw);

//encode to get a config-String
var configString = config.encode(configObject);
```

Example Config:
```INI
[SectionA]
a=1
b=2

[SectionB]
bar=foo
```
will be decoded to:
```JSON
{
  "SectionA": {
    "a": "1",
    "b": "2"
  },
  "SectionB": {
    "bar": "foo"
  }
}
```

### Options ###
There are two ways to set options:
```JavaScript
//set options at construction
var config = new Config({
  lineEnding: "\r\n",
  sectionOpenIdentifier: '[',
  sectionCloseIdentifier: ']',
  defaultValue: true,
  assignIdentifier: "=",
  commentIdentifiers: [";"],
  trimLines: true
});

//or after construction
config.options.lineEnding = "\n";
```

| Option                   | Default       | Description                              |
| ------------------------ | ------------- | ---------------------------------------- |
| lineEnding               | "\r\n"        | Line ending (break)                      |
| sectionOpenIdentifier    | "["           | First char of section line               |
| sectionCloseIdentifier   | "]"           | Last char of section line                |
| defaultValue             | true          | Default value for keys without value     |
| assignIdentifier         | "="           | String after key and before value        |
| commentIdentifiers       | [";"]         | List of commentIdentifiers (strings)     |
| trimLines                | true          | Ignore space                             |
| valueIdentifier          | undefined     | surroundings of values (key="value1")    |
