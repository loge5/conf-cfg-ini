# conf-cfg-ini
## Encode and decode conf/cfg/ini-Files with Node.js

There are allready a lot ini-parser on the npm. But none of these are fits my needs.
So here is a attempt to create a very flexible but easy to use parser.

** Features **
- Linebreak detection (windows, unix, mac)
- Set identifiers for section, comments and assignment
- line trim is optional
- set default value
- tested with mocha+chai

### Installation ###
```
npm install conf-cfg-ini
```

### Usage Example ###
```
//read a ini/conf/cfg-String from file
var fs = require('fs');
var raw = fs.readFileSync('./tbmformat.conf');

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
//set options as object at construction
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
here are the possible Options:

#### lineEnding ####
*default: "\r\n""*

Witch line endigs (breaks) are used in file.
Can be any string.

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

Identifies end of key and beginn of value.

### commentIdentifiers ###
*default: [";"]*

Identifier for comment lines. Here you can set a list of strings.
Have ; # or // for comments? Set it to:
```
config.commentIdentifiers = [";","#","//"];
```

### trimLines ###
*default: true*

Should spaces ignored at beginn and end of line?
