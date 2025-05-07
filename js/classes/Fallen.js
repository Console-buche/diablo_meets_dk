import Minion from './Minion.js';
export default class Fallen extends Minion {

	constructor(x, y, z, scl, master, name, equipment) {
		//console.log("Fallen has spawned.");
		super();
		this.name = name;
		this.x = x;
		this.y = y;
		this.z = z;
		this.scl = scl;
		this.master = master;
		this.velocity = new THREE.Vector3(0, 0, 0);
		this.acceleration = new THREE.Vector3(0, 0, 0);
		this.geometry = new THREE.PlaneBufferGeometry(this.scl * 1.25, this.scl, 1);
		this.animColCounter = 0;
		this.oldState = null;
		this.currentState = {
			name: "idle",
			limit: 20
		};
		this.forces = {
			attracted: new THREE.Vector3(0, 0, 0),
			repelled: new THREE.Vector3(0, 0, 0),
			assault: new THREE.Vector3(0, 0, 0),
			isStuck: false
		};
		this.moveTarget = new THREE.Vector3(0, 0, 0);
		this.animName = "topLeft";
		this.animState = {
			idle: {
				isCurrent: true,
				colLimit: 20
			},
			walk: {
				isCurrent: false,
				colLimit: 10
			},
			attack: {
				isCurrent: false,
				colLimit: 10
			},
			resurect: {
				isCurrent: false,
				colLimit: 24
			},
			dead: {
				isCurrent: false,
				colLimit: 1
			}
		}
		this.autoMove = [];
		this.shouldAutoMove = true;
		this.herd = [];
		this.shadow = null;
		this.autoMoveCounter = {
			current: 0,
			changeAt: 50 + Math.random() * 30,
			chancesToIdle: 0.5,
			lastIdleRoll: 1
		}
		this.animTable = {
			def: 1,
			top: 7 / 8,
			topRight: 6 / 8,
			right: 5 / 8,
			botRight: 4 / 8,
			bot: 3 / 8,
			botLeft: 2 / 8,
			left: 1 / 8,
			topLeft: 0
		};

		//INVENTORY, HP and STATS
		this.inventory = {
			weapon: equipment.weapon,
			shield: equipment.shield
		};
		this.combat = {
			target: null,
			targetList: []
		};
		this.isAlive = true;
		this.stats = {
			hp: {
				max: 100,
				current: 100
			},
			attackSpeed: null,
			attack: null,
			aggro: {
				detectRadius: 10,
				tenacity: 0.3
			}
		};


		//SOUND
		this.sound = {
			idle: {
				path: ["./sound/monsters/fallen/"],
				count: [5],
				proba: [0.3],
				player: [new Audio()]
			},
			walk: {
				path: ["./sound/monsters/fallen/"],
				count: [5],
				proba: [0.05],
				player: [new Audio()]
			}
		};

		//MATERIAL
		this.textures = {
			t1: new THREE.TextureLoader().load("sprites/fallen/fallen_sprites_idle.png", (_t1) => {
				_t1.wrapS = THREE.RepeatWrapping;
				_t1.wrapT = THREE.RepeatWrapping;
				_t1.repeat.set(1 / 19, 1 / 8);
			}),
			t2: new THREE.TextureLoader().load("sprites/fallen/fallen_sprites_walk_pot.png", (_t2) => {
				_t2.wrapS = THREE.RepeatWrapping;
				_t2.wrapT = THREE.RepeatWrapping;
				_t2.repeat.set(1 / 9, 1 / 8);
			}),
			t3: new THREE.TextureLoader().load("sprites/fallen/fallen_sprites_" + this.inventory.weapon + "_walk.png", (_t3) => {
				_t3.wrapS = THREE.RepeatWrapping;
				_t3.wrapT = THREE.RepeatWrapping;
				_t3.repeat.set(1 / 9, 1 / 8);
			}),
			t4: new THREE.TextureLoader().load("sprites/fallen/fallen_sprites_" + this.inventory.weapon + "_idle.png", (_t4) => {
				_t4.wrapS = THREE.RepeatWrapping;
				_t4.wrapT = THREE.RepeatWrapping;
				_t4.repeat.set(1 / 19, 1 / 8);
			}),
			t5: new THREE.TextureLoader().load("sprites/fallen/fallen_sprites_" + this.inventory.shield + "_walk.png", (_t5) => {
				_t5.wrapS = THREE.RepeatWrapping;
				_t5.wrapT = THREE.RepeatWrapping;
				_t5.repeat.set(1 / 9, 1 / 8);
			}),
			t6: new THREE.TextureLoader().load("sprites/fallen/fallen_sprites_" + this.inventory.shield + "_idle.png", (_t6) => {
				_t6.wrapS = THREE.RepeatWrapping;
				_t6.wrapT = THREE.RepeatWrapping;
				_t6.repeat.set(1 / 19, 1 / 8);
			}),
			t7: new THREE.TextureLoader().load("sprites/fallen/fallen_sprites_attack.png", (_t7) => {
				_t7.wrapS = THREE.RepeatWrapping;
				_t7.wrapT = THREE.RepeatWrapping;
				_t7.repeat.set(1 / 9, 1 / 8);
			}),
			t8: new THREE.TextureLoader().load("sprites/fallen/fallen_sprites_" + this.inventory.weapon + "_attack.png", (_t8) => {
				_t8.wrapS = THREE.RepeatWrapping;
				_t8.wrapT = THREE.RepeatWrapping;
				_t8.repeat.set(1 / 9, 1 / 8);
			}),
			t9: new THREE.TextureLoader().load("sprites/fallen/fallen_sprites_" + this.inventory.shield + "_attack.png", (_t9) => {
				_t9.wrapS = THREE.RepeatWrapping;
				_t9.wrapT = THREE.RepeatWrapping;
				_t9.repeat.set(1 / 19, 1 / 8);
			}),
			t10: new THREE.TextureLoader().load("sprites/fallen/fallen_sprites_resurect.png", (_t9) => {
				_t9.wrapS = THREE.RepeatWrapping;
				_t9.wrapT = THREE.RepeatWrapping;
				_t9.repeat.set(1 / 24, 1 / 8);
			}),
			t11: new THREE.TextureLoader().load("sprites/fallen/fallen_sprites_dead.png", (_t9) => {
				_t9.wrapS = THREE.RepeatWrapping;
				_t9.wrapT = THREE.RepeatWrapping;
				_t9.repeat.set(1 / 19, 1 / 8);
			})
			//todo : shield attack + weapon attack

		};

		/*
		this.material = new THREE.MeshBasicMaterial({
			alphaTest: 0.5,
			vertexColors: THREE.FaceColors
		});
		*/
		this.uniforms = { // custom uniforms (your textures)

			tMain: {
				type: "t",
				value: this.textures.t2
			},
			tWeapon: {
				type: "t",
				value: this.textures.t3
			},
			tShield: {
				type: "t",
				value: this.textures.t5
			},
			offsetX: {
				type: "float",
				value: 0.0
			},
			offsetY: {
				type: "float",
				value: 0.0
			},
			cols: {
				type: "float",
				value: 10.0
			},
			rows: {
				type: "float",
				value: 8.0
			},
			facingRight: {
				type: "bool",
				value: false
			},
			masterPos: {
				value: new THREE.Vector3(0, 0, 0)
			},
			isSelected: {
				value: false
			}


		};
		this.vShader = `
		varying vec2 vUv;
		varying vec3 n;
		varying vec3 thisP;
		uniform vec3 masterPos;


		void main()
		{
			n = normal;
			vUv = uv;
			
			vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
			
			gl_Position = projectionMatrix * mvPosition;

			thisP = vec3(mvPosition.x, mvPosition.y, mvPosition.z + 150.0) + masterPos;	//add double lightradius to fallens z pos
		}`;
		this.fShader = `#ifdef GL_ES
		precision highp float;
		#endif
		#define SHAMANTORCHRADIUS 100.0;	
		
		uniform sampler2D tMain;
		uniform sampler2D tWeapon;
		uniform sampler2D tShield;
		uniform float offsetX;
		uniform float offsetY;
		uniform float cols;
		uniform float rows;
		uniform bool facingRight;
		uniform vec3 masterPos;
		uniform bool isSelected;
		varying vec3 n;
		varying vec3 thisP;
		
				varying vec2 vUv;
		
		void main(void)
		{
			vec2 tu = vec2((vUv.x + offsetX) / cols, (vUv.y / rows) + offsetY);
			vec3 cLeft;
			vec3 cRight;
			vec3 cLeftSwordAndShield;
			vec3 cRightSwordAndShield;
			vec4 cBody = texture2D(tMain, tu);
			vec4 cWeap = texture2D(tWeapon, tu);
			vec4 cShield = texture2D(tShield, tu);
			
			//cLeft = Ca.rgb * Ca.a + cWeap.rgb * cWeap.a * (1.0 - Ca.a);  // blending equation
			//cRight =  cWeap.rgb * cWeap.a + Ca.rgb * Ca.a * (1.0 - cWeap.a);  // blending equation
			
		//	cLeft = cBody.rgb * cBody.a + Cb.rgb * Cb.a * (1.0 - cBody.a);  // blending equation
		//	cRight =  Cb.rgb * Cb.a + cBody.rgb * cBody.a * (1.0 - Cb.a);  // blending equation
			
			cLeftSwordAndShield = cWeap.rgb * cWeap.a * (1.0 - cShield.a - cBody.a) + cBody.rgb * cBody.a * (1.0 - cShield.a)  + cShield.rgb * cShield.a;
			cRightSwordAndShield = cShield.rgb * cShield.a + cBody.rgb * cBody.a * (1.0 - cWeap.a) + cWeap.rgb * cWeap.a;

			float distanceFromMaster = distance(masterPos, thisP);
			float d = 1.0 - distanceFromMaster / SHAMANTORCHRADIUS;

			vec3 brightOnSelect = (isSelected) ? vec3(0.15) : vec3(0.0);

			//gl_FragColor= vec4(c, 1.0);
			if (n.y > 0.9 && cBody.a > 0.1 || n.y > 0.9 && cWeap.a > 0.1 || n.y > 0.9 && cShield.a > 0.1) {
				gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5);
			} else if (facingRight) {
				gl_FragColor = vec4(clamp(vec3(0.0, 0.0, 0.0), cLeftSwordAndShield, cLeftSwordAndShield + vec3(d,d,d)) + brightOnSelect, cBody.a + cWeap.a + cShield.a);
			} else if (!facingRight){
				gl_FragColor = vec4(clamp(vec3(0.0, 0.0, 0.0), cRightSwordAndShield, cRightSwordAndShield + vec3(d,d,d)) + brightOnSelect, cBody.a + cWeap.a + cShield.a);
			}


			
		}`;
		this.material = new THREE.ShaderMaterial({

			uniforms: this.uniforms,
			vertexShader: this.vShader,
			fragmentShader: this.fShader,
			transparent: true, //,
			depthWrite: false
		});
		this.lastPos = null;
	}

	adaptSpriteSheet() {

		console.log(this.animName);
		if (this.animName == "top") {
			this.animName = "bot";
		} else if (this.animName == "bot") {
			this.animName = "top";
		} else if (this.animName == "left") {
			this.animName = "right";
		} else if (this.animName == "right") {
			this.animName = "left";
		} else if (this.animName == "topRight") {
			this.animName = "botLeft";
		} else if (this.animName == "botLeft") {
			this.animName = "topRight";
		} else if (this.animName == "botRight") {
			this.animName = "topLeft";
		} else if (this.animName == "topLeft") {
			this.animName = "botRight";
		}


		console.log(this.animName);
	}

	//TODO REFACTOR THIS UPDATE TO MINION CLASS --> take into account the fake persp
	update(camera) {
		let perspectiveAngleMin = -0.9; //prevents sprite from flipping when close to camera for fake perspective
		if (this.rotation.x > -0.9) {
			this.lookAt(new THREE.Vector3(this.position.x, camera.position.y / 5, camera.position.z));
			//if (this.shadow) this.shadow.lookAt((new THREE.Vector3(this.shadow.position.x, camera.position.y / 5, this.shadow.position.z)))
		}
		let angle = new THREE.Vector3(this.master.shadow.rotation.x,
			this.master.shadow.rotation.y,
			this.master.shadow.rotation.z);

		this.shadow.position.set(this.position.x, this.position.y, this.position.z);
		this.shadow.rotation.set(angle.x, angle.y, angle.z);
	}


}