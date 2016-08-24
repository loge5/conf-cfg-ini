# conf-cfg-ini
**Encode and decode conf/cfg/ini-Files with Node.js**

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
```
npm install conf-cfg-ini
```

### Usage ###
```
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
```
[SectionA]
a=1
b=2

[SectionB]
bar=foo
```
will be decoded to:
```
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
```
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
config.options.lineEndig = "\n";
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
