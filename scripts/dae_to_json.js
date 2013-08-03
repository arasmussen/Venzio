var ejs = require('ejs');
var fs = require('fs');

var template = fs.readFileSync(__dirname + '/mesh_template.ejs', 'utf8');

var input = process.argv[2];
if (!input || !fs.existsSync(input) || input.substr(-4) != '.dae') {
  console.log('bad input file');
  return;
}

var start = input.lastIndexOf('/') == -1 ? 0 : input.lastIndexOf('/') + 1;
var end = input.lastIndexOf('.');
var output = input.substr(start, end - start) + '.json';

if (fs.existsSync(output)) {
  console.log('output file already exists');
  return;
}

var contents = fs.readFileSync(input, 'utf8');

var source_start = 'source="#';
var source_end = '"';

var indicators = {
  v: '<input semantic="POSITION" ',
  n: '<input semantic="NORMAL" ',
  t: '<input semantic="TEXCOORD" ',
};

var labels = {};
for (var key in indicators) {
  var start = contents.indexOf(source_start, contents.indexOf(indicators[key])) + source_start.length;
  var end = contents.indexOf(source_end, start);
  labels[key] = contents.substr(start, end - start);
}

var data_start = '>';
var data_end = '</float_array>';

var data = {};
for (var key in labels) {
  var array = labels[key] + '-array';
  var start = contents.indexOf(data_start, contents.indexOf(array)) + 1;
  var end = contents.indexOf(data_end, start);
  var array = contents.substr(start, end - start);
  data[key] = array.trim().split(' ');
}

var polylist_start = '<polylist';
var indices_start = '<p>';
var indices_end = '</p>';

var start = contents.indexOf(indices_start, contents.indexOf(polylist_start)) + 3;
var end = contents.indexOf(indices_end, start);
var array = contents.substr(start, end - start);
var polylist = array.trim().split(' ');

var index_data = {
  v: [],
  n: [],
  t: [],
};

for (var i = 0; i < polylist.length; i++) {
  if (i % 3 == 0) {
    index_data.v.push(polylist[i]);
  } else if (i % 3 == 1) {
    index_data.n.push(polylist[i]);
  } else if (i % 3 == 2) {
    index_data.t.push(polylist[i]);
  }
}

var buffer = {
  v: [],
  n: [],
  t: []
};

for (var i = 0; i < index_data.v.length; i++) {
  buffer.v.push(data.v[3 * index_data.v[i]]);
  buffer.v.push(data.v[3 * index_data.v[i] + 1]);
  buffer.v.push(data.v[3 * index_data.v[i] + 2]);
  buffer.n.push(data.n[3 * index_data.n[i]]);
  buffer.n.push(data.n[3 * index_data.n[i] + 1]);
  buffer.n.push(data.n[3 * index_data.n[i] + 2]);
  buffer.t.push(data.t[2 * index_data.t[i]]);
  buffer.t.push(data.t[2 * index_data.t[i] + 1]);
}

var data = {
  v: buffer.v,
  n: buffer.n,
  t: buffer.t,
  count: buffer.v.length / 3
};

console.log(ejs.render(template, data));
