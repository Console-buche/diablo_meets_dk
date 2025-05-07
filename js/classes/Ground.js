export default class Ground extends THREE.Mesh {

	constructor(w, h, vs, fs) {
		super();
		this.wdth = w;
		this.hght = h;
		this.geometry = new THREE.PlaneGeometry(this.wdth, this.hght);

		this.texture1 = new THREE.TextureLoader().load("sprites/floor/act2_ground_oneTile.png", (_t1) => {
			//_t1.wrapT = THREE.RepeatWrapping;
			//_t1.wrapS = THREE.RepeatWrapping;
			//_t1.magFilter = THREE.NearestFilter;
			//_t1.minFilter = THREE.NearestFilter;
			_t1.minFilter = THREE.LinearFilter;

			_t1.magFilter = THREE.LinearFilter;
			//_t1.anisotropy = 16;
			_t1.premultiplyAlpha = true;

		});
		this.texture2 = new THREE.TextureLoader().load("sprites/floor/act2_ground2_oneTile.png", (_t2) => {
			//_t2.wrapS = THREE.RepeatWrapping;
			//_t2.wrapT = THREE.RepeatWrapping;
			//_t2.wrapS = THREE.RepeatWrapping;
			//_t2.magFilter = THREE.NearestFilter;
			//_t2.minFilter = THREE.NearestFilter;
			_t2.minFilter = THREE.LinearFilter;
			_t2.magFilter = THREE.LinearFilter;
			//_t2.anisotropy = 16;
			_t2.premultiplyAlpha = true;

		});
		this.texture3 = new THREE.TextureLoader().load("sprites/floor/act2_ground3_oneTile.png", (_t2) => {
			//_t2.wrapS = THREE.RepeatWrapping;
			//_t2.wrapT = THREE.RepeatWrapping;
			//_t2.wrapS = THREE.RepeatWrapping;
			//_t2.magFilter = THREE.NearestFilter;
			//_t2.minFilter = THREE.NearestFilter;
			_t2.minFilter = THREE.LinearFilter;
			_t2.magFilter = THREE.LinearFilter;
			//_t2.anisotropy = 16;
			_t2.premultiplyAlpha = true;

		});
		this.texture4 = new THREE.TextureLoader().load("sprites/floor/act2_ground4_oneTile.png", (_t3) => {
			//_t3.wrapS = THREE.RepeatWrapping;
			//_t3.wrapT = THREE.RepeatWrapping;
			//_t3.wrapS = THREE.RepeatWrapping;
			//_t3.magFilter = THREE.NearestFilter;
			//_t3.minFilter = THREE.NearestFilter;
			_t3.minFilter = THREE.LinearFilter;
			_t3.magFilter = THREE.LinearFilter;
			//_t3.anisotropy = 16;
			_t3.premultiplyAlpha = true;

		});
		this.texture5 = new THREE.TextureLoader().load("sprites/floor/act2_ground5_oneTile.png", (_t3) => {
			//_t3.wrapS = THREE.RepeatWrapping;
			//_t3.wrapT = THREE.RepeatWrapping;
			//_t3.wrapS = THREE.RepeatWrapping;
			//_t3.magFilter = THREE.NearestFilter;
			//_t3.minFilter = THREE.NearestFilter;
			_t3.minFilter = THREE.LinearFilter;
			_t3.magFilter = THREE.LinearFilter;
			//_t3.anisotropy = 16;
			_t3.premultiplyAlpha = true;

		});
		this.texture6 = new THREE.TextureLoader().load("sprites/floor/act2_oneTile_tp_bot.png", (_t) => {
			_t.minFilter = THREE.LinearFilter;
			_t.magFilter = THREE.LinearFilter;
			_t.premultiplyAlpha = true;

		});
		this.texture7 = new THREE.TextureLoader().load("sprites/floor/act2_oneTile_tp_top.png", (_t) => {
			_t.minFilter = THREE.LinearFilter;
			_t.magFilter = THREE.LinearFilter;
			_t.premultiplyAlpha = true;

		});
		this.texture8 = new THREE.TextureLoader().load("sprites/floor/act2_oneTile_tp_right.png", (_t) => {
			_t.minFilter = THREE.LinearFilter;
			_t.magFilter = THREE.LinearFilter;
			_t.premultiplyAlpha = true;

		});
		this.texture9 = new THREE.TextureLoader().load("sprites/floor/act2_oneTile_tp_left.png", (_t) => {
			_t.minFilter = THREE.LinearFilter;
			_t.magFilter = THREE.LinearFilter;
			_t.premultiplyAlpha = true;

		});
		this.uniforms = {
			mainGround: {
				value: this.texture1
			},
			mainGround_rock: {
				value: this.texture2
			},
			mainGround_road: {
				value: this.texture3
			},
			mainGround_sand1: {
				value: this.texture4
			},
			mainGround_rock2: {
				value: this.texture5
			},
			mainGround_tpBot: {
				value: this.texture6
			},
			mainGround_tpTop: {
				value: this.texture7
			},
			mainGround_tpRight: {
				value: this.texture8
			},
			mainGround_tpLeft: {
				value: this.texture9
			},
			minionPos: {
				value: new THREE.Vector3(0, 0, 0)
			},
			nbOfFallens: {
				value: 0
			},
			fallensPos: {
				type: "v3v",
				value: [new THREE.Vector3(0, 0, 0), //Length 15 : declared by default to size the length in the ground shader. 
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 0, 0)
				]
			}
		};
		this.vertShader = vs;
		this.fragShader = fs;
		this.material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: this.vertShader,
			fragmentShader: this.fragShader
		});

		this.setUVs = function (w, h, s) {
			var width = w;
			var height = h;
			var size = s;

			var w = width / 256;
			var h = (height / 128); //set to 256 for full size
			var uvs = this.geometry.faceVertexUvs[0];
			uvs[0][0].set(0, h);
			uvs[0][1].set(0, 0);
			uvs[0][2].set(w, h);
			uvs[1][0].set(0, 0);
			uvs[1][1].set(w, 0);
			uvs[1][2].set(w, h);
		}

		this.updateGroundMap = function (pos) {
			// console.log(pos.z);
			if (pos.z < -140) {

				this.material.uniforms.mainGround_road.value = this.texture4;
			} else {
				this.material.uniforms.mainGround_road.value = this.texture3;
			}
		}
	}
}