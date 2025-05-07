import Minion from './Minion.js';
export default class Shaman extends Minion {

    constructor(x, y, z, scl, name) {
        console.log("Shaman has spawned.");
        super();
        this.x = x;
        this.y = y;
        this.z = z;
        this.scl = scl;
        this.name = name;
        this.geometry = new THREE.PlaneGeometry(this.scl, this.scl, 1);
        this.shadow = null;
        this.animColCounter = 0;
        this.oldState = null;
        this.currentState = {
            name: "idle",
            limit: 12
        };
        this.shouldAutoMove = false;
        this.moveTarget = new THREE.Vector3(0, 0, 0);
        this.animName = "topLeft";
        this.animState = {
            idle: {
                isCurrent: true,
                colLimit: 12
            },
            walk: {
                isCurrent: false,
                colLimit: 14
            },
            attack: {
                isCurrent: false,
                colLimit: 17
            }
        };
        this.forces = {
            isStuck: false
        }
        this.autoMove = [];
        this.animTable = {
            def: 1,
            bot: 7 / 8,
            botLeft: 6 / 8,
            left: 5 / 8,
            topLeft: 4 / 8,
            top: 3 / 8,
            topRight: 2 / 8,
            right: 1 / 8,
            botRight: 0
        };

        //INVENTORY, HP and STATS
        this.stats = {
            hp: 100,
            attackSpeed: null,
            attack: null,
            aggro: null
        };

        this.combat = {
            target: null
        };
        this.isAlive = true;

        this.textures = {
            t1: new THREE.TextureLoader().load("sprites/fallen_shaman/fallen_shaman_sprites_idle.png", (_t1) => {
                _t1.wrapS = THREE.RepeatWrapping;
                _t1.wrapT = THREE.RepeatWrapping;
                _t1.anisotropy = 16;
                _t1.repeat.set(1 / 12, 1 / 8);
            }),
            t2: new THREE.TextureLoader().load("sprites/fallen_shaman/fallen_shaman_sprites_walk.png", (_t2) => {
                _t2.wrapS = THREE.RepeatWrapping;
                _t2.wrapT = THREE.RepeatWrapping;
                _t2.anisotropy = 16;
                _t2.repeat.set(1 / 14, 1 / 8);
            }),
            t7: new THREE.TextureLoader().load("sprites/fallen_shaman/fallen_shaman_sprites_attack.png", (_t7) => {
                _t7.wrapS = THREE.RepeatWrapping;
                _t7.wrapT = THREE.RepeatWrapping;
                _t7.anisotropy = 16;
                _t7.repeat.set(1 / 17, 1 / 8);
            })
        };
        /*this.material = new THREE.MeshBasicMaterial({
            alphaTest: 0.5,
            vertexColors: THREE.FaceColors
        });*/
        this.uniforms = { // custom uniforms (your textures)
            tMain: {
                type: "t",
                value: this.textures.t2
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
                value: 14.0
            },
            rows: {
                type: "float",
                value: 8.0
            }
        };
        this.vShader = `
		varying vec2 vUv;
		varying vec3 n;

		void main()
		{
			n = normal;
			vUv = uv;
			vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
			gl_Position = projectionMatrix * mvPosition;
		}`;
        this.fShader = `#ifdef GL_ES
		precision highp float;
		#endif
		
		uniform sampler2D tMain;
		uniform float offsetX;
		uniform float offsetY;
		uniform float cols;
		uniform float rows;
		varying vec3 n;
		
		varying vec2 vUv;
		
		void main(void)
		{
			vec2 tu = vec2((vUv.x + offsetX) / cols, (vUv.y / rows) + offsetY);
			vec3 c;
			vec4 Ca = texture2D(tMain, tu);
			//gl_FragColor= vec4(c, 1.0);
			if (n.y > 0.9 && Ca.w > 0.01) {
				gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5);
			} else {
				gl_FragColor = vec4(Ca.rgba);
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
        //SOUND
        this.sound = {
            walk: {
                path: ["./sound/monsters/fallenshaman/", "./sound/monsters/fallenshaman/footsteps/"],
                count: [4, 4],
                proba: [0.3, 1.1],
                player: [new Audio(), new Audio()]
            },
            attack: {
                path: ["./sound/monsters/fallenshaman/", "./sound/monsters/fallenshaman/weapon/"],
                count: [5, 6],
                proba: [0.5, 1.0],
                player: [new Audio(), new Audio()]
            }
        };
    }

    stopFootsteps() {
        this.sound.walk.player[1].pause();
        this.sound.walk.player[1].currentTime = 0;
        this.sound.walk.player[1].loop = false;
    }

}