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
var output = input.substr(start, end - start) + '.js';

// read input file

var contents = fs.readFileSync(input, 'utf8');

// grab vertex/normal/texcoord data

var source_start = 'source="#';
var source_end = '"';

var indicators = {
  vertices: '<input semantic="POSITION" ',
  normals: '<input semantic="NORMAL" ',
  texcoords: '<input semantic="TEXCOORD" ',
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

  for (var i = 0; i < data[key].length; i++) {
    data[key][i] = parseFloat(data[key][i]);
  }
}

var polylist_start = '<polylist';
var indices_start = '<p>';
var indices_end = '</p>';

var start = contents.indexOf(indices_start, contents.indexOf(polylist_start)) + 3;
var end = contents.indexOf(indices_end, start);
var array = contents.substr(start, end - start);
var polylist = array.trim().split(' ');

var index_data = {
  vertices: [],
  normals: [],
  texcoords: [],
};

for (var i = 0; i < polylist.length; i++) {
  if (i % 3 == 0) {
    index_data.vertices.push(polylist[i]);
  } else if (i % 3 == 1) {
    index_data.normals.push(polylist[i]);
  } else if (i % 3 == 2) {
    index_data.texcoords.push(polylist[i]);
  }
}

var buffer = {
  vertices: [],
  normals: [],
  texcoords: [],
  boneIndices: [[],[],[],[],[]],
  boneWeights: [[],[],[],[],[]]
};

for (var i = 0; i < index_data.vertices.length; i++) {
  buffer.vertices.push(data.vertices[3 * index_data.vertices[i]]);
  buffer.vertices.push(data.vertices[3 * index_data.vertices[i] + 1]);
  buffer.vertices.push(data.vertices[3 * index_data.vertices[i] + 2]);
  buffer.normals.push(data.normals[3 * index_data.normals[i]]);
  buffer.normals.push(data.normals[3 * index_data.normals[i] + 1]);
  buffer.normals.push(data.normals[3 * index_data.normals[i] + 2]);
  buffer.texcoords.push(data.texcoords[2 * index_data.texcoords[i]]);
  buffer.texcoords.push(data.texcoords[2 * index_data.texcoords[i] + 1]);
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
var joints = contents.substr(start, end - start).trim().split(/[\s\n]+/);

var weight_source = '<input semantic="WEIGHT"';
var weights = [];
var start = contents.indexOf(source_start, contents.indexOf(weight_source, contents.indexOf(weight_section_start))) + source_start.length;
var end = contents.indexOf(source_end, start);
var weights_label = contents.substr(start, end - start);
var start = contents.indexOf('>', contents.indexOf(weights_label + '-array')) + 1;
var end = contents.indexOf('<', start);
var weights = contents.substr(start, end - start).trim().split(/[\s\n]+/);

var inv_bind_matrix_section_start = '<joints>';

var inv_bind_matrices_source = '<input semantic="INV_BIND_MATRIX"';
var inv_bind_matrices = [];
var start = contents.indexOf(source_start, contents.indexOf(inv_bind_matrices_source, contents.indexOf(inv_bind_matrix_section_start))) + source_start.length;
var end = contents.indexOf(source_end, start);
var inv_bind_matrices_label = contents.substr(start, end - start);
var start = contents.indexOf('>', contents.indexOf(inv_bind_matrices_label + '-array')) + 1;
var end = contents.indexOf('<', start);
var inv_bind_matrices = contents.substr(start, end - start).trim().split('\n');
for (var i = 0; i < inv_bind_matrices.length; i++) {
  inv_bind_matrices[i] = inv_bind_matrices[i].trim().split(' ');
  for (var j = 0; j < inv_bind_matrices[i].length; j++) {
    inv_bind_matrices[i][j] = parseFloat(inv_bind_matrices[i][j]);
  }
}

var weight_counts_start = '<vcount>';
var start = contents.indexOf(weight_counts_start, contents.indexOf(weight_section_start)) + weight_counts_start.length;
var end = contents.indexOf('<', start);
var counts = contents.substr(start, end - start).trim().split(' ');

var weight_indices_start = '<v>';
var start = contents.indexOf(weight_indices_start, contents.indexOf(weight_section_start)) + weight_indices_start.length;
var end = contents.indexOf('<', start);
var indices = contents.substr(start, end - start).trim().split(' ');

var animation = {};
for (var i = 0; i < joints.length; i++) {
  var animation_start = '<source id="' + joints[i] + '-Matrix-animation-output-transform">';
  if (contents.indexOf(animation_start) == -1) {
    continue;
  }
  var start = contents.indexOf('>', contents.indexOf(animation_start) + animation_start.length) + 1;
  var end = contents.indexOf('<', start)
  animation[joints[i]] = contents.substr(start, end - start).trim().split('\n');

  for (var j = 0; j < animation[joints[i]].length; j++) {
    animation[joints[i]][j] = animation[joints[i]][j].trim().split(' ');
    for (var k = 0; k < 16; k++) {
      animation[joints[i]][j][k] = parseFloat(animation[joints[i]][j][k]);
    }
  }
}

// get hierarchy

var name_start = 'id="';
var name_end = '"';
var node_start = '<node';
var node_end = '</node>';
var matrix_start = '<matrix';
var matrix_end = '</matrix>';

var start = contents.indexOf(name_start, contents.indexOf(node_start, contents.indexOf(node_start) + node_start.length)) + name_start.length;
var end = contents.indexOf(name_end, start);
var root_name = contents.substr(start, end - start);

var start = contents.indexOf('>', contents.indexOf(matrix_start, start)) + 1;
var end = contents.indexOf(matrix_end, start);
var matrix = contents.substr(start, end - start).trim().split(' ');
for (var i = 0; i < 16; i++) {
  matrix[i] = parseFloat(matrix[i]);
}

var hierarchy = {
  children: [],
  name: root_name,
  parent: null,
  index: joints.indexOf(root_name),
  absMatrix: matrix,
  relMatrix: matrix
};

var absMatrices = [];
absMatrices[hierarchy.index] = hierarchy.absMatrix;

var current_node = hierarchy;

function multiply(m1, m2) {
  var result = [];
  for (var y = 0; y < 4; y++) {
    for (var x = 0; x < 4; x++) {
      var sum = 0;
      for (var n = 0; n < 4; n++) {
        sum += m1[4 * y + n] * m2[4 * n + x];
      }
      result.push(sum);
    }
  }
  return result;
}

while (contents.indexOf(node_start, start) != -1) {
  if (contents.indexOf(node_start, start) < contents.indexOf(node_end, start)) {
    start = contents.indexOf(name_start, contents.indexOf(node_start, start)) + name_start.length;
    end = contents.indexOf(name_end, start);
    var name = contents.substr(start, end - start);

    start = contents.indexOf('>', contents.indexOf(matrix_start, start)) + 1;
    end = contents.indexOf(matrix_end, start);
    var matrix = contents.substr(start, end - start).trim().split(' ');
    for (var i = 0; i < 16; i++) {
      matrix[i] = parseFloat(matrix[i]);
    }

    var node = {
      children: [],
      name: name,
      parent: current_node,
      index: joints.indexOf(name),
      absMatrix: multiply(current_node.absMatrix, matrix),
      relMatrix: matrix
    };
    absMatrices[node.index] = node.absMatrix;
    current_node.children.push(node);
    current_node = node;
  } else {
    start = contents.indexOf(node_end, start) + node_end.length;
    current_node = current_node.parent;
  }
}

var boneMatrices = [];
var boneIndexMapper = [];
for (var i = 0; i < joints.length; i++) {
  if (animation[joints[i]]) {
    boneIndexMapper[i] = boneMatrices.length / 16;
    for (var j = 0; j < 16; j++) {
      boneMatrices.push(absMatrices[i]);
      // boneMatrices.push(absMatrices[i][j]);
    }
    // for (var j = 0; j < 16; j++) {
    //   boneMatrices.push(animation[joints[i]][5][j]);
    // }
  }
}

// get bone indices and weights

var boneIndices = [[],[],[],[],[]];
var boneWeights = [[],[],[],[],[]];
var indices_index = 0;
for (var i = 0; i < counts.length; i++) {
  var weightSum = 0;
  for (var j = 0; j < 5; j++) {
    if (j < counts[i]) {
      var index = boneIndexMapper[parseInt(indices[indices_index++])];
      var weight = parseFloat(weights[indices[indices_index++]]);
      weightSum += weight;

      boneIndices[j].push(index);
      boneWeights[j].push(weight);
    } else {
      boneIndices[j].push(0);
      boneWeights[j].push(0.0);
    }
  }
  for (var j = 0; j < 5; j++) {
    boneWeights[j][boneWeights[j].length - 1] /= weightSum;
  }
}

for (var i = 0; i < index_data.vertices.length; i++) {
  buffer.boneIndices[0].push(boneIndices[0][index_data.vertices[i]]);
  buffer.boneIndices[1].push(boneIndices[1][index_data.vertices[i]]);
  buffer.boneIndices[2].push(boneIndices[2][index_data.vertices[i]]);
  buffer.boneIndices[3].push(boneIndices[3][index_data.vertices[i]]);
  buffer.boneIndices[4].push(boneIndices[4][index_data.vertices[i]]);
  buffer.boneWeights[0].push(boneWeights[0][index_data.vertices[i]]);
  buffer.boneWeights[1].push(boneWeights[1][index_data.vertices[i]]);
  buffer.boneWeights[2].push(boneWeights[2][index_data.vertices[i]]);
  buffer.boneWeights[3].push(boneWeights[3][index_data.vertices[i]]);
  buffer.boneWeights[4].push(boneWeights[4][index_data.vertices[i]]);
}

for (var i = 0; i < 5; i++) {
  buffer.boneIndices[i] = JSON.stringify(buffer.boneIndices[i]);
  buffer.boneWeights[i] = JSON.stringify(buffer.boneWeights[i]);
}

var data = {
  vertices: JSON.stringify(buffer.vertices),
  normals: JSON.stringify(buffer.normals),
  texcoords: JSON.stringify(buffer.texcoords),
  boneMatrices: JSON.stringify(boneMatrices),
  boneIndices: buffer.boneIndices,
  boneWeights: buffer.boneWeights,
  count: buffer.vertices.length / 3,
};

fs.writeFileSync(output, ejs.render(template, data));
