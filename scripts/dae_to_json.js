// imports

var ejs = require('ejs');
var fs = require('fs');

// our template file

var template = fs.readFileSync(__dirname + '/mesh_template.ejs', 'utf8');

// make sure input file exists

var input = process.argv[2];
if (!input || !fs.existsSync(input) || input.substr(-4) != '.dae') {
  console.log('bad input file');
  return;
}

// compute output file name

var start = input.lastIndexOf('/') == -1 ? 0 : input.lastIndexOf('/') + 1;
var end = input.lastIndexOf('.');
var output = input.substr(start, end - start) + '.json';

// make sure output file doesn't already exist

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

// get weights/joints data

var weight_section_start = '<vertex_weights';

var source_start = 'source="#';
var source_end = '"';

var joint_source = '<input semantic="JOINT"';
var joints = [];
var start = contents.indexOf(source_start, contents.indexOf(joint_source, contents.indexOf(weight_section_start))) + source_start.length;
var end = contents.indexOf(source_end, start);
var joints_label = contents.substr(start, end - start);
var start = contents.indexOf('>', contents.indexOf(joints_label + '-array')) + 1;
var end = contents.indexOf('<', start);
vleBaseMesh_LeftArmar joints = contents.substr(start, end - start).trim().split(/[\s\n]+/);

var weight_source = '<input semantic="WEIGHT"';
var weights = [];
var start = contents.indexOf(source_start, contents.indexOf(weight_source, contents.indexOf(weight_section_start))) + source_start.length;
var end = contents.indexOf(source_end, start);
var weights_label = contents.substr(start, end - start);
var start = contents.indexOf('>', contents.indexOf(weights_label + '-array')) + 1;
var end = contents.indexOf('<', start);
var weights = contents.substr(start, end - start).trim().split(/[\s\n]+/);

var weight_counts_start = '<vcount>';
var start = contents.indexOf(weight_counts_start, contents.indexOf(weight_section_start)) + weight_counts_start.length;
var end = contents.indexOf('<', start);
var counts = contents.substr(start, end - start).trim().split(' ');

var weight_indices_start = '<v>';
var start = contents.indexOf(weight_indices_start, contents.indexOf(weight_section_start)) + weight_indices_start.length;
var end = contents.indexOf('<', start);
var indices = contents.substr(start, end - start).trim().split(' ');

var vertices = [];
var indices_index = 0;
for (var i = 0; i < counts.length; i++) {
  vertices[i] = {
    influences: []
  };
  for (var j = 0; j < counts[i]; j++) {
    vertices[i].influences.push({
      joint: joints[indices[indices_index++]],
      weight: weights[indices[indices_index++]]
    });
  }
  console.log(vertices[i]);
}

var transforms = {};
for (var i = 0; i < joints.length; i++) {
}

var data = {
  v: buffer.v,
  n: buffer.n,
  t: buffer.t,
  count: buffer.v.length / 3
};
