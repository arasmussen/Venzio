// imports

var ejs = require('ejs');
var fs = require('fs');
require('sylvester');


// get input file

var input = process.argv[2];
if (!input || !fs.existsSync(input) || input.substr(-4) != '.dae') {
  console.log('bad input file');
  return;
}
var contents = fs.readFileSync(input, 'utf8');


// load data

var raw = {
  vertices: ArrayToFloat(GetRawData('POSITION')), // a list of vertex data
  normals: ArrayToFloat(GetRawData('NORMAL')), // a list of normals
  texcoords: ArrayToFloat(GetRawData('TEXCOORD')), // a list of texcoords
  weights: ArrayToFloat(GetRawData('WEIGHT')), // a list of weights
  joints: GetRawData('JOINT') // a list of joints
};
var polylist = GetPolylist(); // matches vertices with normals and texcoords
var bone_data = GetBoneWeightsAndIndices(raw.weights); // matches vertices with bone weights/influences
var animation_data = GetAnimationData(raw.joints); // animation matrices for each frame for each bone
var bone_index_map = GetBoneIndexMap(raw.joints, animation_data); // maps bone id to used bone id
var bone_data = FixBoneData(bone_data, bone_index_map); // removes unused bone indices
var inverse_bind_matrices = GetInverseBindMatrices(bone_index_map);
var hierarchy = GetHierarchy(raw.joints, bone_index_map, animation_data); // gets hierarchy, bind pose matrices, and world matrices
var joints = FlattenHierarchy(hierarchy); // flattens into [index] = node
var joints = CalculateSkinningMatrices(joints, inverse_bind_matrices); // calculates skinning matrices

var gl_data = GetGLData(raw, polylist, bone_data, joints); // puts everything together
var ejs_data = GetEJSData(gl_data); // good format for ejs
var output = GetOutputFilename(input);
PrintOutput(output, ejs_data);


// functions

function GetOutputFilename(input) {
  var start = input.lastIndexOf('/') == -1 ? 0 : input.lastIndexOf('/') + 1;
  var end = input.lastIndexOf('.');
  return input.substr(start, end - start) + '.js';
}

function Parse(section_indicator, start_indicator, end_indicator) {
  var section_start = contents.indexOf(section_indicator) + section_indicator.length;
  var start = contents.indexOf(start_indicator, section_start) + start_indicator.length;
  var end = contents.indexOf(end_indicator, start);
  return contents.substr(start, end - start);
}

function ArrayToFloat(array) {
  for (var i = 0; i < array.length; i++) {
    array[i] = parseFloat(array[i]);
  }
  return array;
}

// matrices are arrays of size 16
function MatrixMultiply(m1, m2) {
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

function MatrixInverse(array) {
  var matrix = $M([
    [array[0], array[1], array[2], array[3]],
    [array[4], array[5], array[6], array[7]],
    [array[8], array[9], array[10], array[11]],
    [array[12], array[13], array[14], array[15]]
  ]).inverse();
  return [
    matrix.e(1, 1), matrix.e(1, 2), matrix.e(1, 3), matrix.e(1, 4),
    matrix.e(2, 1), matrix.e(2, 2), matrix.e(2, 3), matrix.e(2, 4),
    matrix.e(3, 1), matrix.e(3, 2), matrix.e(3, 3), matrix.e(3, 4),
    matrix.e(4, 1), matrix.e(4, 2), matrix.e(4, 3), matrix.e(4, 4)
  ];
}

function MatrixTranspose(matrix) {
  var transpose = [];
  for (var x = 0; x < 4; x++) {
    for (var y = 0; y < 4; y++) {
      transpose[x * 4 + y] = matrix[y * 4 + x];
    }
  }
  return transpose;
}

// pass in type = "POSITION", "NORMAL", "TEXCOORD", "WEIGHT", "JOINT", or "INV_BIND_MATRIX"
function GetRawData(type) {
  var label_section = '<input semantic="' + type + '" ';
  var label_start = 'source="#';
  var label_end = '"';
  var label = Parse(label_section, label_start, label_end);

  var array_section = '"' + label + '-array"';
  var array_start = '>';
  var array_end = '<';
  var array = Parse(array_section, array_start, array_end);

  return array.trim().split(/[\s\n]+/);
}

function GetPolylist() {
  var polylist_section = '<polylist';
  var array_start = '<p>';
  var array_end = '</p>';
  var polylist = Parse(polylist_section, array_start, array_end);
  return polylist.trim().split(' ');
}

function GetBoneWeightsAndIndices(weights) {
  var section_start = '<vertex_weights';

  var counts_start = '<vcount>';
  var counts_end = '</vcount>';
  var counts = Parse(section_start, counts_start, counts_end).trim().split(' ');

  var indices_start = '<v>';
  var indices_end = '</v>';
  var indices = Parse(section_start, indices_start, indices_end).trim().split(' ');

  var boneIndices = [[],[],[],[],[]];
  var boneWeights = [[],[],[],[],[]];
  var indices_index = 0;
  for (var i = 0; i < counts.length; i++) {
    var weightSum = 0;
    for (var j = 0; j < 5; j++) {
      if (j < counts[i]) {
        var index = parseInt(indices[indices_index++]);
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

  return {
    weights: boneWeights,
    indices: boneIndices
  };
}

function GetAnimationData(joints) {
  var animation = {};
  var start = '>';
  var end = '<';
  for (var i = 0; i < joints.length; i++) {
    var section_start = '<source id="' + joints[i] + '-Matrix-animation-output-transform">';
    if (contents.indexOf(section_start) == -1) {
      continue;
    }
    animation[joints[i]] = ArrayToFloat(Parse(section_start, start, end).trim().split(/[\s\n]+/));
  }
  return animation;
}

function GetBoneIndexMap(joints, animation) {
  var index = 0;
  var bone_index_map = [];
  for (var i = 0; i < joints.length; i++) {
    if (animation[joints[i]]) {
      bone_index_map[i] = index++;
    }
  }
  return bone_index_map;
}

function FixBoneData(bone_data, bone_index_map) {
  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < bone_data.indices[i].length; j++) {
      bone_data.indices[i][j] = bone_index_map[bone_data.indices[i][j]];
    }
  }
  return bone_data;
}

function GetInverseBindMatrices(bone_index_map) {
  var original_matrices = ArrayToFloat(GetRawData('INV_BIND_MATRIX'));
  var matrices = [];
  for (var i = 0; i < original_matrices.length / 16; i++) {
    var index = bone_index_map.indexOf(i);
    if (index == -1) {
      break;
    }
    matrices[i] = original_matrices.slice(index * 16, index * 16 + 16);
  }
  return matrices;
}

function GetHierarchy(joints, bone_index_map, animation) {
  var read_from = contents.indexOf('</skeleton>');

  var node_start = '<node';
  var node_end = '</node>';
  var name_start = 'id="';
  var name_end = '"';
  var matrix_start = '<matrix';
  var matrix_end = '</matrix>';

  function GetNodeName() {
    var start = contents.indexOf(name_start, contents.indexOf(node_start, read_from)) + name_start.length;
    var end = contents.indexOf(name_end, start);
    read_from = end;
    return contents.substr(start, end - start);
  }

  function GetMatrix() {
    var start = contents.indexOf('>', contents.indexOf(matrix_start, read_from)) + 1;
    var end = contents.indexOf(matrix_end, start);
    read_from = end;
    return ArrayToFloat(contents.substr(start, end - start).trim().split(' '));
  }

  var root_name = GetNodeName();
  var matrix = GetMatrix();

  var hierarchy = {
    children: [],
    name: root_name,
    parent: null,
    index: bone_index_map[joints.indexOf(root_name)],
    world_matrix: matrix,
    bind_pose_matrix: matrix,
    inverse_bind_pose_matrix: MatrixInverse(matrix),
    anim_matrix: animation[root_name].slice(1040, 1056)
  };
  var current_node = hierarchy;

  while (contents.indexOf(node_start, read_from) != -1) {
    if (contents.indexOf(node_start, read_from) < contents.indexOf(node_end, read_from)) {
      var node_name = GetNodeName();
      var matrix = GetMatrix();
      var node = {
        children: [],
        name: node_name,
        parent: current_node,
        index: bone_index_map[joints.indexOf(node_name)],
        world_matrix: MatrixMultiply(current_node.world_matrix, matrix),
        bind_pose_matrix: matrix,
        inverse_bind_pose_matrix: MatrixInverse(MatrixMultiply(current_node.world_matrix, matrix)),
        anim_matrix: animation[node_name] ? MatrixMultiply(current_node.anim_matrix, animation[node_name].slice(1040, 1056)) : null
      };
      current_node.children.push(node);
      current_node = node;
    } else {
      read_from = contents.indexOf(node_end, read_from) + node_end.length;
      current_node = current_node.parent;
    }
  }

  return hierarchy;
}

function FlattenHierarchy(hierarchy) {
  var flatten = [];

  // recursively call for each child
  function Helper(node) {
    for (var i = 0; i < node.children.length; i++) {
      Helper(node.children[i]);
    }
    if (typeof node.index !== 'undefined') {
      flatten[node.index] = node;
    }
  }
  Helper(hierarchy);

  return flatten;
}

function CalculateSkinningMatrices(joints, inverse_bind_matrices) {
  for (var i = 0; i < joints.length; i++) {
    joints[i].skinning_matrix = MatrixMultiply(inverse_bind_matrices[i], joints[i].anim_matrix);
    joints[i].skinning_matrix = MatrixMultiply(joints[i].anim_matrix, inverse_bind_matrices[i]);
  }
  return joints;
}

function GetGLData(raw, polylist, bone_data, joints) {
  var index_data = {
    vertices: [],
    normals: [],
    texcoords: []
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

  var data = {
    vertices: [],
    normals: [],
    texcoords: [],
    bone_indices: [[],[],[],[],[]],
    bone_weights: [[],[],[],[],[]],
    bone_matrices: []
  };

  for (var i = 0; i < polylist.length / 3; i++) {
    data.vertices.push(raw.vertices[3 * index_data.vertices[i]]);
    data.vertices.push(raw.vertices[3 * index_data.vertices[i] + 1]);
    data.vertices.push(raw.vertices[3 * index_data.vertices[i] + 2]);

    data.normals.push(raw.normals[3 * index_data.normals[i]]);
    data.normals.push(raw.normals[3 * index_data.normals[i] + 1]);
    data.normals.push(raw.normals[3 * index_data.normals[i] + 2]);

    data.texcoords.push(raw.texcoords[2 * index_data.texcoords[i]]);
    data.texcoords.push(raw.texcoords[2 * index_data.texcoords[i] + 1]);

    for (var j = 0; j < 5; j++) {
      data.bone_indices[j].push(bone_data.indices[j][index_data.vertices[i]]);
      data.bone_weights[j].push(bone_data.weights[j][index_data.vertices[i]]);
    }
  }

  for (var i = 0; i < joints.length; i++) {
    for (var j = 0; j < 16; j++) {
      data.bone_matrices.push(joints[i].skinning_matrix[j]);
    }
  }

  return data;
}

function GetEJSData(gl_data) {
  var bone_indices = [];
  var bone_weights = [];
  for (var i = 0; i < 5; i++) {
    bone_indices[i] = JSON.stringify(gl_data.bone_indices[i]);
    bone_weights[i] = JSON.stringify(gl_data.bone_weights[i]);
  }

  return {
    vertices: JSON.stringify(gl_data.vertices),
    normals: JSON.stringify(gl_data.normals),
    texcoords: JSON.stringify(gl_data.texcoords),
    bone_indices: bone_indices,
    bone_weights: bone_weights,
    bone_matrices: JSON.stringify(gl_data.bone_matrices),
    count: gl_data.vertices.length / 3
  };
}

function PrintOutput(output, ejs_data) {
  var template = fs.readFileSync(__dirname + '/mesh_template.ejs', 'utf8');
  fs.writeFileSync(output, ejs.render(template, ejs_data));
}
