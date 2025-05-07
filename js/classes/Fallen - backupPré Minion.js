import Minion from './Minion.js';
export default class Fallen extends THREE.Mesh {

	constructor(x, y, z, scl, master, name) {
		console.log("Fallen has spawned.");
		super();
		this.name = name;
		this.x = x;
		this.y = y;
		this.z = z;
		this.scl = scl;
		this.master = master;
		this.velocity = new THREE.Vector3(Math.random(), 0, Math.random());
		this.acceleration = new THREE.Vector3(0, 0, 0);
		this.geometry = new THREE.PlaneGeometry(this.scl, this.scl, 1);
		this.animColCounter = 0;
		this.colLimit = 19;
		this.isMoving = false;
		this.moveTarget = new THREE.Vector3(0, 0, 0);
		this.animName = "topLeft";
		this.animState = {
			idle: {
				isCurrent: true,
				colLimit: 19
			},
			walk: {
				isCurrent: true,
				colLimit: 9
			}
		}
		this.autoMove = [];
		this.shouldAutoMove = true;
		this.herd = [];
		this.shadow = null;
		this.autoMoveCounter = {
			current: 0,
			changeAt: 50 + Math.random() * 30,
			chancesToIdle: Math.random() * 0.3
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
		this.textures = {
			t1: new THREE.TextureLoader().load("sprites/fallen_sprites_idle.png", (_t1) => {
				_t1.wrapS = THREE.RepeatWrapping;
				_t1.wrapT = THREE.RepeatWrapping;
				_t1.anisotropy = 16;
				_t1.repeat.set(1 / 19, 1 / 8);
			}),
			t2: new THREE.TextureLoader().load("sprites/fallen_sprites_walk.png", (_t2) => {
				//	_t2.wrapS = THREE.RepeatWrapping;
				//	_t2.wrapT = THREE.RepeatWrapping;
				_t2.anisotropy = 16;
				_t2.repeat.set(1 / 9, 1 / 8);
			}),
			t3: new THREE.TextureLoader().load("sprites/fallen_sprites_walk.png", (_t3) => {
				//	_t3.wrapS = THREE.RepeatWrapping;
				//	_t3.wrapT = THREE.RepeatWrapping;
				_t3.anisotropy = 16;
				_t3.repeat.set(1 / 9, 1 / 8);
			})
		};
		this.material = new THREE.MeshBasicMaterial({
			alphaTest: 0.5,
			vertexColors: THREE.FaceColors
		});
		this.lastPos = null;
	}

	fleshOut() {

		this.material.map = this.textures.t1;
		this.material.map.offset.x = (this.animColCounter) / (this.colLimit);
		this.material.map.offset.y = this.animTable[this.animName];
		this.material.needsUpdate = true;
	}

	animae() {
		this.animColCounter = (this.animColCounter < this.colLimit) ? this.animColCounter + 1 : 0;

		this.material.map.offset.x = (this.animColCounter) / (this.colLimit + 1);
		this.material.map.offset.y = this.animTable[this.animName];
	}

	run() {
		if (this.shouldAutoMove) {
			this.makeItAutoMove();
		} else {
			let d = this.position.distanceTo(this.moveTarget);
			this.lastPos = new THREE.Vector3().copy(this.position);
			if (d > 0.5) {
				let seek = new THREE.Vector3().subVectors(this.moveTarget, this.position);
				seek.normalize();
				this.position.add(seek);
			} else {
				this.isMoving = false;
				this.material.map = this.textures.t1;
				this.colLimit = 19;
				this.material.map.offset.x = (this.animColCounter) / (this.colLimit + 1);
				this.material.map.offset.y = this.animTable[this.animName];
			}
		}
	}

	makeItAutoMove() {

		//new random velocity every X frames
		this.autoMoveCounter.current += 1;
		if (this.autoMoveCounter.current > this.autoMoveCounter.changeAt) {
			this.autoMoveCounter.current = 0;
			this.autoMoveCounter.changeAt = 50 + Math.random() * 30;
			//calculate distance between Fallen and Master position
			//master position set as 0,0,0 for the sake of test
			//console.log(this.master);
			var masterPos = this.master.position;

			//see whether in yoke distance of master
			let d = this.position.distanceTo(masterPos);
			//console.log(d);

			//give a chance to want to be idle
			let r = Math.random();
			if (d < 30 && r > this.autoMoveCounter.chancesToIdle) {

				this.velocity = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5);
				this.updateSpriteWalk();
			} else if (d < 30 && r <= this.autoMoveCounter.chancesToIdle) {

				this.velocity = new THREE.Vector3(0, 0, 0);
				this.material.map = this.textures.t1;
				this.colLimit = 19;
				this.material.map.offset.x = (this.animColCounter) / (this.colLimit + 1);
				this.material.map.offset.y = this.animTable[this.animName];

			} else if (d > 30 && r > this.autoMoveCounter.chancesToIdle) {

				let nbOfFallens = 10; //shouldn't be hardcoded
				let angle = ((360 / 10) * Math.floor(Math.random() * nbOfFallens)) * (Math.PI / 180);
				let r = 30;
				let x = this.master.position.x + Math.cos(angle) * r;
				let z = this.master.position.z + Math.sin(angle) * r;

				let circleAroundMaster = new THREE.Vector3(x, this.master.position.y, z);
				let desired = new THREE.Vector3().subVectors(circleAroundMaster, this.position);
				desired.normalize().multiplyScalar(0.5);
				this.velocity = desired;

				this.updateSpriteWalk();
			}

		} else {

			this.position.add(this.velocity);

		}
	}



	updateSpriteWalk() {
		//this.animColCounter = 0;
		if (this.shouldAutoMove) {
			let futurePos = new THREE.Vector3().copy(this.position).add(this.velocity);
			var seeka = new THREE.Vector3().subVectors(futurePos, this.position);
		} else {
			var seeka = new THREE.Vector3().subVectors(this.moveTarget, this.position);
		}
		seeka.normalize();
		seeka.z *= -1; //set positive z to the far distance instead of towards camera
		if (seeka.x > -0.35 && seeka.x < 0.35 && seeka.z > 0) {
			//console.log("au fond");
			this.animName = "top";
		} else if (seeka.x > 0.35 && seeka.z > 0.35) {
			//console.log("au fond à droite");
			this.animName = "topRight";
		} else if (seeka.x > 0.35 && seeka.z > -0.35 && seeka.z < 0.35) {
			//console.log("à droite");
			this.animName = "right";
		} else if (seeka.x > 0.35 && seeka.z < 0) {
			//console.log("en bas à droite");
			this.animName = "botRight";
		} else if (seeka.x > -0.35 && seeka.x < 0.35 && seeka.z < 0) {
			//console.log("en bas");
			this.animName = "bot";
		} else if (seeka.x < -0.35 && seeka.z < 0) {
			//console.log("en bas à gauche");
			this.animName = "botLeft";
		} else if (seeka.x < 0.35 && seeka.z > -0.35 && seeka.z < 0.35) {
			//console.log("à gauche");
			this.animName = "left";
		} else if (seeka.x < 0.35 && seeka.z > 0) {
			//console.log("au fond à gauche");
			this.animName = "topLeft";
		}

		let mustReset = (this.colLimit !== 9) ? true : false;
		this.colLimit = 9;
		this.material.map = this.textures.t2;
		this.animColCounter = (mustReset) ? 0 : this.animColCounter;

		this.material.needsUpdate = true;
		//	console.log(seeka.z);
	}

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