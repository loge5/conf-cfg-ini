# conf-cfg-ini
**Encode and decode conf/cfg/ini-Files with Node.js**

There are already a lot of ini-parser on the npm repository. 
But none of these are fits all my needs. 
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
//read a ini/conf/cfg-String from file
var fs = require('fs');
var raw = fs.readFileSync('./test.ini');

var Config = require('conf-cfg-ini');
var config = new Config();
config.options.lineEnding = config.detectLineEnding(raw);

//decode to get a simple js object
var configObject = config.decode(raw);

//encode to get a ini/conf/cfg-String
var configString = config.encode(configObject);
```

Example ini-Data:
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

#### lineEnding ####
*default: "\r\n""*

Witch line endings (breaks) are used in file.
Can be any string. For automatic detection use:

```
config.options.lineEnding = config.detectLineEnding(raw);
```

#### sectionOpenIdentifier ####
*default: "["*

First char at Line that identify a section

#### sectionCloseIdentifier ####
*default: "]"*

Last char at Line that identify a section

### defaultValue ###
*default: true*

This value will be set to any keys without a value - like this:
```
foo=
```
### assignIdentifier ###
*default: "="*

Identifies end of key and begin of value.

### commentIdentifiers ###
*default: [";"]*

Identifier for comment lines. Here you can set a list of strings.
Have ; # or // for comments? Set it to:
```
config.commentIdentifiers = [";","#","//"];
```

### trimLines ###
*default: true*

Should spaces ignored at begin and end of line?
