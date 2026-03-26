var Config = require('./conf-cfg-ini');

var testData = [
    ";comment\n[SectionA]\na=1\nb=2\n",
    ";comment\r\n[SectionA]\r\na=1\r\nb=2\r\n",
    "stray=true;comment\r\n[SectionA]\r\na=1\r\nb=2\r\n"
];

describe('Config', function() {
    it('should be defined', function () {
        expect(Config).toBeDefined();
    });

    it('setOptions should overwrite options', function () {
        var config = new Config();
        config.options.lineEnding = "\n";
        config.options.trimLines = true;
        config.setOptions({lineEnding: "\r\n", trimLines: undefined});
        expect(config.options.lineEnding).toBe("\r\n");
        expect(config.options.trimLines).toBe(true);
    });

    it('detectLineEndings should detect windows style (\\r\\n)', function () {
        var config = new Config();
        expect(config.detectLineEnding("line1\r\nline2\r\n")).toBe("\r\n");
    });

    it('detectLineEndings should detect unix style (\\n)', function () {
        var config = new Config();
        expect(config.detectLineEnding("line1\nline2\n")).toBe("\n");
    });

    it('detectLineEndings should detect mac style (\\r)', function () {
        var config = new Config();
        expect(config.detectLineEnding("line1\rline2\r")).toBe("\r");
    });

    it('detectLineEndings should detect wtf style (\\n\\r)', function () {
        var config = new Config();
        expect(config.detectLineEnding("line1\n\rline2\n\r")).toBe("\n\r");
    });

    it('decode should return a object', function () {
        var config = new Config();
        for(var i = 0; i < testData.length; i++){
            expect(typeof config.decode(testData[i])).toBe('object');
        }
    });

    it('encode return should a string', function () {
        var config = new Config();
        expect(typeof config.encode({'Section':{'a': 1}})).toBe('string');
        expect(typeof config.encode({'a':1})).toBe('string');
        expect(typeof config.encode({})).toBe('string');
    });

    it('decode should handle attributes without section', function () {
        var config = new Config();
        config.options.lineEnding = "\n";
        var result = config.decode("stray=foo\n[Section1]\na=b\n");
        expect(result.stray).toBe("foo");
    });

    it('encode should handle attributes without section', function () {
        var config = new Config();
        config.options.lineEnding = "\n";
        var encoded = config.encode({stray:'foo','SectionA':{'a': 1}});
        var decoded = config.decode(encoded);
        expect(decoded.stray).toBe("foo");
    });

    it('decode should return object with same attributes', function () {
        var data = ";comment\n[SectionA]\nkey=value\n";
        var config = new Config();
        config.options.lineEnding = config.detectLineEnding(data);
        var result = config.decode(data);
        expect(typeof result).toBe('object');
        expect(result.SectionA).toBeDefined();
        expect(result.SectionA.key).toBe("value");
    });

    it('decode>encode>decode>encode return should produce consistent results', function () {
        for(var i = 0; i < testData.length; i++){
            var data = testData[i];
            var config = new Config();
            config.options.lineEnding = config.detectLineEnding(data);
            var decoded1 = config.decode(data);
            var encoded1 = config.encode(decoded1);
            var decoded2 = config.decode(encoded1);
            var encoded2 = config.encode(decoded2);
            expect(encoded1).toBe(encoded2);
            expect(decoded1).toEqual(decoded2);
        }
    });

    it('decode should be able to handle multiple comment identifier', function () {
        var config = new Config();
        config.options.lineEnding = "\n";
        config.options.commentIdentifiers = [';','//','#'];
        var result = config.decode(";comment1\n//comment2\n#comment3\n");
        expect(result).toEqual({});
    });

    it('decode should be able to handle custom assign identifier', function () {
        var config = new Config();
        config.options.lineEnding = "\n";
        config.options.assignIdentifier = ":";
        var result = config.decode("[Section]\nfoo:bar\n");
        expect(result.Section).toBeDefined();
        expect(result.Section.foo).toBe("bar");
    });

    it('decode should prevent prototype pollution attacks', function () {
        var config = new Config();
        config.options.lineEnding = "\n";
        config.options.assignIdentifier = ":";
        var result = config.decode("[__proto__]\nfoo:bar\n");
        expect(result.__proto__.foo).toBeUndefined();
        result = config.decode("[Section]\n__proto__:bar\n");
        expect(result.Section.__proto__).not.toBe("bar");
    });

    it('valueTrim should trim custom chars', function () {
        var config = new Config();
        expect(config.valueTrim('"Te"s"t"', '"')).toBe('Te"s"t');
        expect(config.valueTrim('"Te"s"t"', '')).toBe('"Te"s"t"');
        expect(config.valueTrim('"Te"s"t"', '#')).toBe('"Te"s"t"');
        expect(config.valueTrim('""Te"s"t""', '""')).toBe('"Te"s"t"');
        expect(config.valueTrim('[Te"s"t]', '[]')).toBe('Te"s"t');
    })

    it('valueIdentifiers should trimed or added', function () {
        var data = "[SectionA]\nkey1='val1'\nkey2='val2'\n";
        var config = new Config();
        config.options.lineEnding = "\n";
        config.options.valueIdentifier = "'"
        var result = config.decode(data);
        expect(result.SectionA.key1).toBe("val1");
        expect(result.SectionA.key2).toBe("val2");
        var data2 = config.encode(result);
        expect(data2).toBe(data);
    })

    it('ignoreMultipleAssignIdentifier should ignore multiple assing identifiers', function () {
        var data = "a\t1\nb\t\t2\nc\t3\t\n";
        var config = new Config();
        config.options.assignIdentifier = '\t'
        config.options.lineEnding = "\n";
        config.options.ignoreMultipleAssignIdentifier = true;
        config.options.trimLines = false;
        var result = config.decode(data);
        expect(result.a).toBe("1");
        expect(result.b).toBe("2");
        expect(result.c).toBe("3\t");
    })
});
