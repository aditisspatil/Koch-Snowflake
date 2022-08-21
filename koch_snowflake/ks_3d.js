// Koch Snowflake 3D
// Aditi Patil (asp270)


"use strict";

var gl;
var depth = 3;
var vertices = [];
var cBuffer;
var vBuffer;
var positions = [];
var colors = [];
var fringe = [];
var center;

// var baseColors = [
//   vec3(105.0, 8.0, 161.0),
//   vec3(21.0, 89.0, 121.0),
//   vec3(7.0, 108.0, 17.0),
//   vec3(198.0, 23.0, 23.0)
// ];


var baseColors = [
  vec3(1.0, 0.0, 0.0),
  vec3(0.0, 1.0, 0.0),
  vec3(0.0, 0.0, 1.0),
  vec3(0.0, 0.0, 0.0)
];

const x = 0.6;
const base_vertices = [
  vec3(0.0000,  0.0000, -1.0000),
  vec3(0.0000,  0.9428,  0.3333),
  vec3(-0.8165, -0.4714,  0.3333),
  vec3(0.8165, -0.4714,  0.3333),
];

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    
    vertices = [
      vec3(0.0000,  0.0000, -1.0000),
      vec3(0.0000,  0.9428,  0.3333),
      vec3(-0.8165, -0.4714,  0.3333),
      vec3(0.8165, -0.4714,  0.3333),
    ];
    center = divide( add( add( add (vertices[0], vertices[1]), vertices[2]), vertices[3]), 4);
    tetra(vertices[0], vertices[1], vertices[2], vertices[3]);
    loop();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program );

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    document.getElementById("slider").onchange = function(event) {
      depth = event.target.value;
      colors = [];
      positions = [];
      tetra(vertices[0], vertices[1], vertices[2], vertices[3]);
      loop();
      reload();
      render();
    };

    render();

};


function reload(){
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, positions.length);
}

function triangle( a, b, c, color ) {
    colors.push(baseColors[color]);
    positions.push(a);
    colors.push(baseColors[color]);
    positions.push(b);
    colors.push(baseColors[color]);
    positions.push(c);
}


function tetra( a, b, c, d ) {  
  triangle(a, c, b, 2);
  triangle(a, c, d, 1);
  triangle(a, b, d, 3);
  triangle(b, c, d, 0);

  var s1 = length_two(a,b);
  var s2 = length_two(a,c);
  var s3 = length_two(b,c);
  var s4 = length_two(a,d);
  var s5 = length_two(b,d);
  var s6 = length_two(d,c);

  divide_all_faces(b, a, d, c);
}

function loop(){
  var old_fringe = [...fringe];
  fringe = [];
  if (depth > 0 && old_fringe.length > 0) {
    depth -= 1;
    for(var i=0; i<old_fringe.length; i += 4) {
      var a = old_fringe[i+0];
      var b = old_fringe[i+1];
      var c = old_fringe[i+2];
      var p_center = old_fringe[i+3];

      divide_face(a, b, c, p_center);
    }
  }
  if (fringe.length > 0) {
    loop();
  }
}

function divide_face(a, b, c, p_center) {
    var ab = divide(add(a,b), 2);
    var bc = divide(add(b,c), 2);
    var ac = divide(add(a,c), 2);
    var centroid = vec3( (a[0]+b[0]+c[0])/3, (a[1]+b[1]+c[1])/3, (a[2]+b[2]+c[2])/3 );   
    var side = length_two(ac,ab);
    var s1 = length_two(ac,ab);
    var s2 = length_two(bc,ab);
    var s3 = length_two(ac,bc);
    var acxab = cross(minus(ac,centroid), minus(ab, centroid));
    var normal = divide( acxab, length_one(acxab));
    var total_height = side*Math.sqrt(2/3);
    var abc;

    var abc_1 = add(centroid, multiply(normal, total_height));
    var abc_2 = add(centroid, multiply(multiply(normal, -1), total_height));
    var diff_1 = length_two(abc_1, p_center);
    var diff_2 = length_two(abc_2, p_center);

    if (Math.abs( diff_2-diff_1) < 0.01) {
      console.log("____");
      console.log(diff_1, diff_2);
      diff_1 = length_two(abc_1, center);
      diff_2 = length_two(abc_2, center);
      console.log(diff_1, diff_2);
    }

    if (Math.abs( diff_2-diff_1) < 0.01) {
      console.log("_+++___");
      console.log(diff_1, diff_2);
    }
    if (diff_1 > diff_2) {
      abc = abc_1;
    }
    else {
      abc = abc_2;
      if (diff_1 == diff_2) {
      }
    }
    var s4 = length_two(abc, ab);
    var s5 = length_two(abc, bc);
    // console.log(length_two(ac,ab), length_two(bc,ab), length_two(ac,bc), length_two(abc, ab), length_two(abc, bc));
    tetra(ac,ab,bc, abc);
    fringe.push(a, ab, ac, p_center);
    fringe.push(bc, b, ab, p_center);
    fringe.push(bc, ac, c, p_center);
}

function divide_all_faces(A, B, C, D) {
  fringe.push(A, B, C, D);
  fringe.push(B, C, D, A);
  fringe.push(C, A, D, B);
  fringe.push(D, B, A, C);
}


function cross( u, v )
{
    if ( u.type == 'vec3' && v.type == 'vec3') {
      var result = vec3(
          u[1]*v[2] - u[2]*v[1],
          u[2]*v[0] - u[0]*v[2],
          u[0]*v[1] - u[1]*v[0]
      );
      return result;
    }
}

// function centroid_func_4(a, b, c, d) {
//   return vec3( (a[0]+b[0]+c[0]+d[0])/3, (a[1]+b[1]+c[1]+d[1])/3, (a[2]+b[2]+c[2]+d[2])/3 );   
// }


// function centroid_func_3(a, b, c,) {
//   return vec3( (a[0]+b[0]+c[0])/3, (a[1]+b[1]+c[1])/3, (a[2]+b[2]+c[2])/3 );   
// }

function multiply(v, num){
  return vec3(v[0]*num, v[1]*num, v[2]*num);
};

function divide(v, num){
  return vec3(v[0]/num, v[1]/num, v[2]/num);
};

function add(a, b){
  return vec3(a[0]+b[0], a[1]+b[1], a[2]+b[2]);
};

function minus(a, b){
  return vec3(a[0]-b[0], a[1]-b[1], a[2]-b[2]);
};

function length_two(b, a){
  return Math.sqrt(Math.pow(a[0] - b[0],2) + 
                   Math.pow(a[1] - b[1],2) +
                   Math.pow(a[2] - b[2],2));
};

function length_one(a){
  return Math.sqrt(Math.pow(a[0],2) + 
                   Math.pow(a[1],2) +
                   Math.pow(a[2],2));
};
