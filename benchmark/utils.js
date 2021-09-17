'use strict';

const fs = require('fs');
const path = require('path');

function Table(header) {
  this.header = header || [];
  this.results = [];
}

Table.prototype.setHeader = function (header) {
  this.header = header;
};

Table.prototype.addResult = function (result) {
  this.results.push(result);
};

Table.prototype.toMarkdown = function () {
  const colLen = this.header.length;
  const maxLenPerCol = Array(colLen)
    .fill('')
    .map((_, i) => {
      const targetCol = [
        this.header[i],
        ...this.results.map((x) => String(x[i])),
      ];
      const maxLen = Math.max(...targetCol.map((x) => x.length));
      return maxLen;
    });
  const getLine = (items, padChar = ' ') =>
    items.reduce((h, c, i) => {
      return h + ' ' + c.padEnd(maxLenPerCol[i], padChar) + ' |';
    }, '|');
  const markdown = [
    getLine(this.header),
    getLine(
      this.header.map(() => '-'),
      '-'
    ),
    ...this.results.map((x) => getLine(x)),
  ].join('\n');
  return markdown;
};

const writeReadme = (content) => {
  const readmeFile = path.join(__dirname, '../README.md');
  const raw = fs.readFileSync(readmeFile, 'utf-8');
  fs.writeFileSync(
    readmeFile,
    raw.replace(
      /<!-- BENCHMARK RESULT START -->[\s\S]*<!-- BENCHMARK RESULT END -->/gim,
      `<!-- BENCHMARK RESULT START -->\n${content}<!-- BENCHMARK RESULT END -->`
    ),
    'utf-8'
  );
};

module.exports = {
  Table,
  writeReadme,
};
