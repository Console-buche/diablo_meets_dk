export default class Enemy extends THREE.Mesh {

    constructor(scl, s) {
        super();
        this.geometry = new THREE.BoxGeometry(scl, scl * (2 + Math.random()), scl, 4, 4, 4);
        //this.translateY(scl/2);
        this.texture = new THREE.TextureLoader().load("textures/Sand_Albedo_256.png", (_t1) => {
            _t1.repeat.set(1, 1);
			_t1.wrapS = THREE.RepeatWrapping;
			_t1.wrapT = THREE.RepeatWrapping;
            _t1.anisotropy = 16;
        });
        this.material = new THREE.MeshPhongMaterial({
            color: 0xA9A9A9,
            shininess: 0,
            transparent: true,
            map: this.texture,
            bumpMap: new THREE.TextureLoader().load("textures/Sand_AO_256.png"),
            bumpScale: 1
        });
        this.parentScene = s;
        //this.material.shading = THREE.FlatShading;
        this.stats = {
            isDead: false,
            isStructure: true,
            hp: {
                max: 300,
                current: 300
            },
            decay: {
                states: [0.8, 0.66, 0.33, 0]
            },
            attackSpeed: null,
            attack: null,
            isUnderAttack: false,
            wasSelected: false
        };
        this.particles = [];
        this.core = [];
        this.castShadow = true;
    }

    addParticles() {
        //var particle = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,0.3), new THREE.MeshBasicMaterial({color:0xFAFAFA}));
        var pGroup = new THREE.Object3D();
        for (var i = 0; i < Math.floor(Math.random() * 4) + 3; i++) {

            var gold = new THREE.MeshLambertMaterial({
                map: this.material.map,
                transparent: true
            });

            var dirt = new THREE.MeshLambertMaterial({
                transparent: true,
                color: 0x000000
            });

            var materials = [gold, dirt]
            let r = Math.floor(Math.random() * 2);

            var partic = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(0.35), materials[r]);
            partic.material.flatShading = true;
            partic.castShadow = true;
            partic.name = (r < 1) ? "dirt" : "gold";

            partic.position.y = (Math.random() * 15) + 15;
            partic.position.z = 15
            partic.rotation.set(Math.random(), Math.random(), Math.random());
            partic.position.x = (Math.random() * 15) - 7.5;
            partic.scale.set((Math.random() * 5) + 2.5, (Math.random() * 5) + 2.5, (Math.random() * 5) + 2.5);
            partic.bounciness = Math.floor(Math.random() * 2) + 2;

            partic.velocity = new THREE.Vector3(0, 0.6, Math.random() * 0.5);
            partic.acceleration = new THREE.Vector3((Math.random() * 1) - 1, -1, 0);
            partic.rot = new THREE.Vector3(Math.random() * 0.001, Math.random() * 0.001, Math.random() * 0.001);
            partic.bounces = 1;

            partic.lifespan = (r > 0) ? 40 : 80;
            pGroup.add(partic);
        }


        pGroup.position.set(this.position.x, this.position.y, this.position.z);
        let orientation = (Math.random() < 0.5) ? -4 : 4;
        pGroup.rotateY(Math.PI / orientation);
        this.particles.push(pGroup);
        this.parentScene.add(pGroup);
    }

    addCore() {
        var pGroup = new THREE.Object3D();
        //var particle = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,0.3), new THREE.MeshBasicMaterial({color:0xFAFAFA}));
        for (var i = 0; i < 17; i++) {
            var partic = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(1), new THREE.MeshLambertMaterial({
                map: this.material.map,
                transparent: true,
                color: 0xC9C9C9,
                side: THREE.FrontSide
            }));
            partic.material.flatShading = true;
            partic.castShadow = false;

            partic.position.set((Math.random() * 30) - 15, (Math.random() * 20) + i, (Math.random() * 30) - 15);
            partic.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
            partic.scale.set((Math.random() * 3) + 5, (Math.random() * 3) + 5, (Math.random() * 3) + 5);
            partic.bounciness = Math.floor(Math.random() * 2) + 2;
            partic.name == "core";
            partic.lifespan = 5;


            partic.velocity = new THREE.Vector3((Math.random() * 0.15) - 0.075, 0.6, (Math.random() * 0.5) - 0.075);
            partic.acceleration = new THREE.Vector3((Math.random() * 0.3) + 0.15, -1, (Math.random() * 0.3) + 0.15);
            partic.rot = new THREE.Vector3(Math.random() * 0.001, Math.random() * 0.001, Math.random() * 0.001);
            partic.bounces = 1;
            pGroup.add(partic);
        }


        pGroup.position.set(this.position.x, this.position.y, this.position.z);
        let orientation = (Math.random() < 0.5) ? -4 : 4;
        pGroup.rotateY(Math.PI / orientation);
        this.core.push(pGroup);
        this.parentScene.add(pGroup);
    }

    animateParticles(pGroup) {
        pGroup.forEach((group) => {
            group.children.forEach((p) => {
                let a = p.acceleration.normalize();
                a.multiplyScalar(0.1);
                p.velocity.add(p.acceleration);
                let v = new THREE.Vector3().copy(p.velocity).normalize().multiplyScalar(0.01);

                if (p.position.y > 0) {
                    p.acceleration.y -= 1;
                }

                if (p.position.y < 0 && p.bounces < 3) {
                    p.velocity.y = 3 / Math.exp(p.bounces);
                    p.material.opacity = 1.25 - (p.bounces / 3)
                    p.bounces += 0.25;
                    p.acceleration.y = 10;
                    p.acceleration.z += (Math.random() * 20) - 10;
                    p.acceleration.x += (Math.random() * 60) - 30;
                    p.rot = new THREE.Vector3(Math.random() * 0.4, Math.random() * 0.2, Math.random() * 0.2);
                }


                if (p.bounces < p.bounciness) {
                    p.position.add(p.velocity);
                    p.rotation.x += p.rot.x * 0.15;
                    p.rotation.y += p.rot.y * 0.15;
                    p.rotation.z += p.rot.z * 0.15;
                }

                p.lifespan -= 0.075; //TODO : stop updating this on dead/removed/something
                p.material.opacity = p.lifespan;
                if (p.material.opacity < 0) {
                    p.visible = false;
                }
            });
        });
    }

    updateStats(dmg) {
        this.stats.hp.current -= dmg;
        if (this.stats.hp.current <= 0) {

            this.addCore();
            this.visible = false;
            this.stats.isDead = true;
            this.stats.isUnderAttack = false;
        }

        if (this.stats.hp.current / this.stats.hp.max < this.stats.decay.states[0]) {
            this.stats.decay.states.shift();
            this.fallAppart();
            this.addParticles();
        }
    }

    fallAppart() {
        this.geometry.faces.forEach((face) => {
            let n = face.normal;
            let r = (Math.random() * 2) - 1;

            if (n.z == 1) {
                this.geometry.vertices[face.a].z += r * 2;
            }

            if (n.y == 1) {
                this.geometry.vertices[face.a].y -= r;
            }

            if (Math.abs(n.x) == 1) {
                this.geometry.vertices[face.a].x += r * 2;
            }
			
			this.material.map.offset.y += 0.001;
            this.geometry.verticesNeedUpdate = true;
        });
    }

    queueDestruction() {
        this.stats.wasSelected = !this.stats.wasSelected;
        if (this.stats.wasSelected == true) {
            console.log(this.material.color);
            this.material.color = new THREE.Color(0xA9A9A9 * 3);
        } else {
            this.material.color = new THREE.Color(0xA9A9A9);
        }
    }

    blockPath(critters) {
        critters.forEach((critter) => {
            let d = this.position.distanceTo(critter.position);
            if (d <= 30 && this.stats.isDead == false && this.stats.isUnderAttack == false) { //TODO : 30 mustn't be hardcoded. 30 here is diameter of structure (sandstone)
                critter.forces.isStuck = true;
                let away = new THREE.Vector3().subVectors(critter.position, this.position);
                away.normalize().multiplyScalar(1.25);
                critter.velocity.add(away).normalize();
                critter.forces.repelled = away;
                critter.updateSpriteWalk();
            } else if (d > 30) {
                critter.forces.isStuck = false;
            }
        })
    }


}