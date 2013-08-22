// imports

var ejs = require('ejs');
var fs = require('fs');
require('sylvester');
var zlib = require('zlib');


// get input file

var input = __dirname + '/../../art/models/' + process.argv[2] + '.dae';
if (!input || !fs.existsSync(input)) {
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
var inverse_bind_matrices = GetInverseBindMatrices(); // gets inverse bind matrices
var joints_tree = GetHierarchy(raw.joints); // gets hierarchy, bind pose matrices, and world matrices
var joints = FlattenHierarchy(joints_tree); // flattens into [index] = node

var frames = AddAnimationData(joints); // animation matrices for each frame for each bone
RemoveBadBones(joints, bone_data);
AddSkinningMatrices(joints_tree, inverse_bind_matrices, frames); // calculates skinning matrices

var ejs_data = GetEJSData(raw, polylist, bone_data, joints); // puts everything together
var filename = GetOutputFilename(input);
PrintOutput(filename, ejs_data);


// functions

// "../../art/models/gangnam.dae" => "gangnam"
function GetOutputFilename(input) {
  var start = input.lastIndexOf('/') == -1 ? 0 : input.lastIndexOf('/') + 1;
  var end = input.lastIndexOf('.');
  return input.substr(start, end - start);
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
function MatrixMultiply(m2, m1) {
  var matrix1 = $M([
    [m1[0], m1[1], m1[2], m1[3]],
    [m1[4], m1[5], m1[6], m1[7]],
    [m1[8], m1[9], m1[10], m1[11]],
    [m1[12], m1[13], m1[14], m1[15]]
  ]);
  var matrix2 = $M([
    [m2[0], m2[1], m2[2], m2[3]],
    [m2[4], m2[5], m2[6], m2[7]],
    [m2[8], m2[9], m2[10], m2[11]],
    [m2[12], m2[13], m2[14], m2[15]]
  ]);
  var result = matrix1.multiply(matrix2);
  return [
    result.e(1, 1), result.e(1, 2), result.e(1, 3), result.e(1, 4),
    result.e(2, 1), result.e(2, 2), result.e(2, 3), result.e(2, 4),
    result.e(3, 1), result.e(3, 2), result.e(3, 3), result.e(3, 4),
    result.e(4, 1), result.e(4, 2), result.e(4, 3), result.e(4, 4)
  ];
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

function MatrixTranspose(array) {
  var matrix = $M([
    [array[0], array[1], array[2], array[3]],
    [array[4], array[5], array[6], array[7]],
    [array[8], array[9], array[10], array[11]],
    [array[12], array[13], array[14], array[15]]
  ]).transpose();
  return [
    matrix.e(1, 1), matrix.e(1, 2), matrix.e(1, 3), matrix.e(1, 4),
    matrix.e(2, 1), matrix.e(2, 2), matrix.e(2, 3), matrix.e(2, 4),
    matrix.e(3, 1), matrix.e(3, 2), matrix.e(3, 3), matrix.e(3, 4),
    matrix.e(4, 1), matrix.e(4, 2), matrix.e(4, 3), matrix.e(4, 4)
  ];
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

function AddAnimationData(joints) {
  var start = '>';
  var end = '<';
  var frames = 0;
  for (var i = 0; i < joints.length; i++) {
    var section_starts = [
      '<source id="' + joints[i].id + '-Matrix-animation-output-transform">',
      '<source id="' + joints[i].id + '-transform_' + joints[i].id + '_transform-output">'
    ];
    for (var j = 0; j < section_starts.length; j++) {
      if (contents.indexOf(section_starts[j]) !== -1) {
        joints[i].animation_data = ArrayToFloat(Parse(section_starts[j], start, end).trim().split(/[\s\n]+/));
        for (var k = 0; k < joints[i].animation_data.length / 16; k++) {
          var transposed = MatrixTranspose(joints[i].animation_data.slice(k * 16, (k + 1) * 16));
          for (var m = 0; m < 16; m++) {
            joints[i].animation_data[k * 16 + m] = transposed[m];
          }
        }
        frames = joints[i].animation_data.length / 16;
      }
    }
  }
  return frames;
}

function AddSkinningMatrices(joints_tree, inverse_bind_matrices, frames) {
  var queue = [joints_tree]; // root node
  while (queue.length > 0) {
    var node = queue.pop();
    queue = queue.concat(node.children);

    for (var i = 0; i < frames; i++) {
      node.anim_pose_matrices[i] = node.animation_data ? node.animation_data.slice(i * 16, i * 16 + 16) : node.bind_pose_matrix;
      if (node.parent) {
        node.anim_pose_matrices[i] = MatrixMultiply(node.parent.anim_pose_matrices[i], node.anim_pose_matrices[i]);
      }
      node.skinning_matrices[i] = MatrixMultiply(node.anim_pose_matrices[i], inverse_bind_matrices[node.index]);
    }
  }
}

function RemoveBadBones(joints, bone_data) {
  // make a list of all indices
  var all_indices = [];
  for (var i = 0; i < 5; i++) {
    all_indices = all_indices.concat(bone_data.indices[i]);
  }

  // mark whether each joint influences at least one vertex
  for (var i = 0; i < joints.length; i++) {
    joints[i].directlyAffectsVertices = (all_indices.indexOf(i) !== -1);
  }

  // mark whether each joint or its children influence at least one vertex
  for (var i = 0; i < joints.length; i++) {
    if (joints[i].directlyAffectsVertices) {
      joints[i].affectsVertices = true;
    } else {
      var queue = [].concat(joints[i].children);
      while (queue.length > 0) {
        var child = queue.pop();
        queue = queue.concat(child.children);

        if (child.directlyAffectsVertices) {
          joints[i].affectsVertices = true;
          continue;
        }
      }
      joints[i].affectsVertices = false;
    }
  }

  // create a map from old indices to new indices
  var bone_index_map = [];
  var new_index = 0;
  for (var i = 0; i < joints.length; i++) {
    if (joints[i].affectsVertices) {
      bone_index_map[i] = new_index++;
    }
  }

  // update data with new indices
  for (var i = 0; i < joints.length; i++) {
    if (joints[i].affectsVertices) {
      joints[i].realIndex = bone_index_map[joints[i].index];
    }
  }

  for (var i = 0; i < 5; i++) {
    for (var j = 0; j < bone_data.indices[i].length; j++) {
      bone_data.indices[i][j] = bone_index_map[bone_data.indices[i][j]];
    }
  }
}

function GetInverseBindMatrices() {
  var original_matrices = ArrayToFloat(GetRawData('INV_BIND_MATRIX'));
  var matrices = [];
  for (var i = 0; i < original_matrices.length / 16; i++) {
    matrices[i] = original_matrices.slice(i * 16, i * 16 + 16);
    matrices[i] = MatrixTranspose(matrices[i]);
  }
  return matrices;
}

function GetHierarchy(joints) {
  var read_from = contents.indexOf('</skeleton>');

  var node_start = '<node';
  var node_end = '</node>';
  var id_start = 'id="';
  var id_end = '"';
  var name_start = 'sid="';
  var name_end = '"';
  var matrix_start = '<matrix';
  var matrix_end = '</matrix>';

  function GetNodeID() {
    var start = contents.indexOf(id_start, contents.indexOf(node_start, read_from)) + id_start.length;
    var end = contents.indexOf(id_end, start);
    return contents.substr(start, end - start);
  }

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
    return MatrixTranspose(ArrayToFloat(contents.substr(start, end - start).trim().split(' ')));
  }

  var id_name = GetNodeID();
  var root_name = GetNodeName();
  var matrix = GetMatrix();

  var hierarchy = {
    children: [],
    id: id_name,
    name: root_name,
    parent: null,
    index: joints.indexOf(root_name),
    world_matrix: matrix,
    bind_pose_matrix: matrix,
    inverse_bind_pose_matrix: MatrixInverse(matrix),
    anim_pose_matrices: [],
    skinning_matrices: []
  };
  var current_node = hierarchy;

  while (contents.indexOf(node_start, read_from) != -1) {
    if (contents.indexOf(node_start, read_from) < contents.indexOf(node_end, read_from)) {
      var id_name = GetNodeID();
      var node_name = GetNodeName();
      var matrix = GetMatrix();
      var node = {
        children: [],
        id: id_name,
        name: node_name,
        parent: current_node,
        index: joints.indexOf(node_name),
        world_matrix: MatrixMultiply(current_node.world_matrix, matrix),
        bind_pose_matrix: matrix,
        inverse_bind_pose_matrix: MatrixInverse(MatrixMultiply(current_node.world_matrix, matrix)),
        anim_pose_matrices: [],
        skinning_matrices: []
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

function GetEJSData(raw, polylist, bone_data, joints) {
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
    bone_matrices: [],
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
    if (joints[i].affectsVertices) {
      data.bone_matrices.push(joints[i].skinning_matrices);
    }
  }

  data.num_vertices = data.vertices.length / 3;
  data.num_bones = data.bone_matrices.length;
  data.num_frames = data.bone_matrices[0].length;

  return data;
}

function PrintOutput(filename, ejs_data) {
  var raw_template = fs.readFileSync(__dirname + '/raw_template.ejs', 'utf8');
  var raw_path = __dirname + '/../../art/raw/' + filename + '.json';
  var raw_data = ejs.render(raw_template, ejs_data);
  fs.writeFileSync(raw_path, raw_data);

  var binary_template = fs.readFileSync(__dirname + '/binary_template.ejs', 'utf8');
  var binary_path = __dirname + '/../../art/binary/' + filename + '.data';
  var binary_data = ejs.render(binary_template, ejs_data);
  fs.writeFileSync(binary_path, binary_data);

  var compressed_path = __dirname + '/../../art/compressed/' + filename + '.data.tar.gz';
  var gzip = zlib.createGzip();
  var in_stream = fs.createReadStream(binary_path);
  var out_stream = fs.createWriteStream(compressed_path);
  in_stream.pipe(gzip).pipe(out_stream);
}

