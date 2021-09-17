'use strict';

const assertDeepStrictEqual = require('assert').deepStrictEqual;
const Benchmark = require('benchmark');

const { Table, writeReadme } = require('./utils');
const tests = require('../spec/tests');

const benchResultTable = new Table(['Name', 'ops/sec', '±', 'runs sampled']);
const suite = new Benchmark.Suite;

const equalPackages = {
  'fast-deep-equal': require('..'),
  'fast-deep-equal/es6': require('../es6'),
  'fast-equals': require('fast-equals').deepEqual,
  'nano-equal': true,
  'shallow-equal-fuzzy': true,
  'underscore.isEqual': require('underscore').isEqual,
  'lodash.isEqual': require('lodash').isEqual,
  'deep-equal': true,
  'deep-eql': true,
  'ramda.equals': require('ramda').equals,
  'util.isDeepStrictEqual': require('util').isDeepStrictEqual,
  'assert.deepStrictEqual': (a, b) => {
    try { assertDeepStrictEqual(a, b); return true; }
    catch(e) { return false; }
  }
};


for (const equalName in equalPackages) {
  let equalFunc = equalPackages[equalName];
  if (equalFunc === true) equalFunc = require(equalName);

  for (const testSuite of tests) {
    for (const test of testSuite.tests) {
      try {
        if (equalFunc(test.value1, test.value2) !== test.equal)
          console.error('different result', equalName, testSuite.description, test.description);
      } catch(e) {
        console.error(equalName, testSuite.description, test.description, e);
      }
    }
  }

  suite.add(equalName, function() {
    for (const testSuite of tests) {
      for (const test of testSuite.tests) {
        if (test.description != 'pseudo array and equivalent array are not equal')
          equalFunc(test.value1, test.value2);
      }
    }
  });
}

console.log();

suite
  .on('cycle', (event) => {
    const perfResult = String(event.target);
    console.log(perfResult);

    // eslint-disable-next-line no-unused-vars
    const [_, name, opssec, offset, runs] = perfResult.match(
      /(.*)\sx\s(.*)\sops\/sec\s(.*)\s\((.*)\sruns/
    );
    const mdRow = [name, opssec, offset, runs];
    benchResultTable.addResult(mdRow);
  })
  .on('complete', function () {
    const fastestItem = 'The fastest is ' + this.filter('fastest').map('name');
    console.log();
    console.log(fastestItem);

    let newContent = `Node.js: ${process.version}:\n\n`;
    newContent += `${benchResultTable.toMarkdown()}\n\n`;
    newContent += `${fastestItem}\n`;
    writeReadme(newContent);
  })
  .run({async: true});
