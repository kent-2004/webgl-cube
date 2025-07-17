const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl2");

let mat4 = () => {
	return new Float32Array([
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);
	
}

function multiplyMat4(a, b) {
	const out = new Float32Array(16);
	for (let i = 0; i < 4; ++i) {       
		for (let j = 0; j < 4; ++j) {    
			out[i * 4 + j] =
			
			a[0 * 4 + j] * b[i * 4 + 0] +
			a[1 * 4 + j] * b[i * 4 + 1] +
			a[2 * 4 + j] * b[i * 4 + 2] +
			a[3 * 4 + j] * b[i * 4 + 3];
		}
	}
	return out;
}

function rotateXMat4(out, a, angle) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);
	
	let a10 = a[4];
	let a11 = a[5];
	let a12 = a[6];
	let a13 = a[7];
	let a20 = a[8];
	let a21 = a[9];
	let a22 = a[10];
	let a23 = a[11];
	
	if (a !== out) {
		out[0] = a[0];
		out[1] = a[1];
		out[2] = a[2];
		out[3] = a[3];
		out[12] = a[12];
		out[13] = a[13];
		out[14] = a[14];
		out[15] = a[15];
		
	}
	
	out[4] = a10 * c + a20 * s;
	out[5] = a11 * c + a21 * s;
	out[6] = a12 * c + a22 * s;
	out[7] = a13 * c + a23 * s;
	out[8] = a20 * c - a10 * s;
	out[9] = a21 * c - a11 * s;
	out[10] = a22 * c - a12 * s;
	out[11] = a23 * c - a13 * s;
	
}

function rotateYMat4(out, a, angle) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);
	
	let a00 = a[0];
	let a01 = a[1];
	let a02 = a[2];
	let a03 = a[3];
	let a20 = a[8];
	let a21 = a[9];
	let a22 = a[10];
	let a23 = a[11];
	
	if (a !== out) {
		out[4] = a[4];
		out[5] = a[5];
		out[6] = a[6];
		out[7] = a[7];
		out[12] = a[12];
		out[13] = a[13];
		out[14] = a[14];
		out[15] = a[15];
		
	}
	
	
	
	out[0] = a00 * c - a20 * s;
	out[1] = a01 * c - a21 * s;
	out[2] = a02 * c - a22 * s;
	out[3] = a03 * c - a23 * s;
	out[8] = a00 * s + a20 * c;
	out[9] = a01 * s + a21 * c;
	out[10] = a02 * s + a22 * c;
	out[11] = a03 * s + a23 * c;
	
}



function normalizeVec3(v) {
	const len = Math.hypot(...v);
	return v.map(n => n / len);
}

function crossVec3(a, b) {
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	];
}

function dotVec3(a, b) {
	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function perspective(fov, aspect, near, far) {
	const f = 1.0 / Math.tan(fov / 2.0);
	const nf = 1.0 / (near - far);
	
	return new Float32Array([
		f / aspect, 0, 0, 0,
		0, f, 0, 0,
		0, 0, (far + near) * nf, -1,
		0, 0, 2.0 * far * near * nf, 0
	
	]);
}

function lookAt(eye, center, up) {
	const z = normalizeVec3([
		eye[0] - center[0],
		eye[1] - center[1],
		eye[2] - center[2]
	]);
	const x = normalizeVec3(crossVec3(up, z));
	const y = crossVec3(z, x);
	
	return new Float32Array([
		x[0], y[0], z[0], 0,
		x[1], y[1], z[1], 0,
		x[2], y[2], z[2], 0,
		-dotVec3(x, eye), -dotVec3(y, eye), -dotVec3(z, eye), 1
	]);
}

function randomVec3() {
	return [Math.random(), Math.random(), Math.random()];
}

const vs = ` #version 300 es
	in vec3 aPosition;
	in vec3 aColor;
	
	uniform mat4 uMVP;
	
	out vec3 vColor;
	
	void main() {
		gl_Position = uMVP * vec4(aPosition, 1.0);
		vColor = aColor;
	}

`

const fs = ` #version 300 es
	precision highp float;
	
	in vec3 vColor;
	
	out vec4 fragColor;
	
	void main() {
		fragColor = vec4(vColor, 1.0);
	}
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vs);
gl.compileShader(vertexShader);

if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
	console.error(gl.getShaderInfoLog(vertexShader));
}

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fs);
gl.compileShader(fragmentShader);

if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
	console.error(gl.getShaderInfoLog(fragmentShader));
}


const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

gl.useProgram(program);

const vertices = new Float32Array([
	// LEFT
	-1, -1, -1,
	-1, -1,  1,
	-1,  1,  1,
	-1,  1, -1,
	 
	 // RIGHT
	 1,  1, -1,
	 1,  1,  1,
	 1, -1,  1,
	 1, -1, -1,
	 
	 // TOP
	 -1,  1, -1,
	 -1,  1,  1,
	  1,  1,  1,
	  1,  1, -1,
	 
	 // BOTTOM
	-1, -1,  1,
	-1, -1, -1,
	 1, -1, -1,
	 1, -1,  1,
	 
	 
	
	// FRONT
	-1,  1, -1,
	 1,  1, -1,
	 1, -1, -1,
	-1, -1, -1,
	 
	 // BACK
	-1, -1,  1,
	 1, -1,  1,
	 1,  1,  1,
	-1,  1,  1
	 
	 
]);

const L = randomVec3();
const R = randomVec3();
const U = randomVec3();
const D = randomVec3();
const F = randomVec3();
const B = randomVec3();


const colors = new Float32Array([
	L[0], L[1], L[2],
	L[0], L[1], L[2],
	L[0], L[1], L[2],
	L[0], L[1], L[2],
	
	
	R[0], R[1], R[2],
	R[0], R[1], R[2],
	R[0], R[1], R[2],
	R[0], R[1], R[2],
	
	 
	U[0], U[1], U[2],
	U[0], U[1], U[2],
	U[0], U[1], U[2],
	U[0], U[1], U[2],
	
	 
	D[0], D[1], D[2],
	D[0], D[1], D[2],
	D[0], D[1], D[2],
	D[0], D[1], D[2],
	
	F[0], F[1], [2],
	F[0], F[1], [2],
	F[0], F[1], [2],
	F[0], F[1], [2],
	
	 
	B[0], B[1], B[2],
	B[0], B[1], B[2],
	B[0], B[1], B[2],
	B[0], B[1], B[2]
	
]);

const indices = new Uint16Array([
	// LEFT
	0, 1, 2,
	0, 2, 3,
	
	4, 5, 6,
	4, 6, 7,
	
	8, 9, 10,
	8, 10, 11,
	
	12, 13, 14,
	12, 14, 15,
	
	16, 17, 18,
	16, 18, 19,
	
	20, 21, 22,
	20, 22, 23
]);


const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 3, gl.FLOAT, gl.FALSE, 0, 0);



const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

console.log(window.innerWidth)
const projection = perspective(75 * (Math.PI / 180.0), 720 / 1280, 0.1, 500.0);
const view = lookAt([3, 3, -3], [0, 0, 0], [0, 1, 0]);
const model = mat4();

let lastTime = 0.0;
let t = 0.0;

function animate() {
	const currTime = performance.now();
	const delta = (currTime - lastTime) / 1000.0;
	lastTime = currTime;
	rotateXMat4(model, mat4(), t);
	rotateYMat4(model, model, t);
	
	const viewProj = multiplyMat4(projection, view);
	const mvp = multiplyMat4(viewProj, model)
	const mvpLoc = gl.getUniformLocation(program, "uMVP");
	gl.uniformMatrix4fv(mvpLoc, gl.FALSE, mvp);
	
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
	t += delta;
	requestAnimationFrame(animate);
}

animate();
