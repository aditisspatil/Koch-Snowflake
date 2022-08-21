// Koch Snowflake 2D
// Aditi Patil (asp270)


"use strict";

var gl;
var depth = 4;
var vertices = [];
var bufferId;

const x = 0.6;
const base_vertices = [
    vec2(-x,  -x),
    vec2(x,  -x),
    vec2(0,  x),
];

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    vertices = base_vertices;
    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program );

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(positionLoc);

    document.getElementById("slider").onchange = function(event) {
      depth = event.target.value;
      reload();
      render();
    };

    reload();
    render();

};


function reload(){
  vertices = base_vertices;

  console.log(depth);  

  if (depth > 0) {
    divide_with_depth(depth);
  }
  console.log(vertices);  
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
}

function render() {
  gl.clear( gl.COLOR_BUFFER_BIT );
  gl.drawArrays(gl.LINE_LOOP, 0, vertices.length);
}


function divide_with_depth(depth) {
  if (depth > 0) {
    let old_vertices = vertices.slice();
    vertices = [];
    for (let i = 0; i < old_vertices.length; i++) {
      var A = old_vertices[i];
      var B;
      if (i+1 == old_vertices.length) {
        B = old_vertices[0];
      }
      else {
        B = old_vertices[i+1];
      }
      divide_side(A, B, depth);
    }
    depth = depth - 1;
    divide_with_depth(depth);
  }
}


function divide_side(A, B, depth){

  if (depth < 0){
      return null;
  }

  var C = divide(add(multiply(A, 2), B), 3);
  var D = divide(add(multiply(B, 2), A), 3);
  var F = divide(add(A, B), 2);
  
  var V1 = divide(minus(F, A), length(F, A));
  var V2 = [V1[1], -V1[0]];

  var E = add(multiply(V2, Math.sqrt(3)/6 * length(B, A)), F);

  vertices.pop();
  vertices.push(A);
  vertices.push(C);
  vertices.push(E);
  vertices.push(D);
  vertices.push(B);
};


function multiply(v, num){
  return vec2(v[0]*num, v[1]*num);
};

function divide(v, num){
  return vec2(v[0]/num, v[1]/num);
};

function add(a, b){
  return vec2(a[0]+b[0], a[1]+b[1]);
};

function minus(a, b){
  return [a[0]-b[0], a[1]-b[1]];
};

function length(a, b){
  return Math.sqrt(Math.pow(a[0] - b[0],2) + 
                   Math.pow(a[1] - b[1],2));
};
