export default class Minion extends THREE.Mesh {

    constructor() {
        //console.log("A minion has spawned.");
        super();
        this.hitbox = {
            material: new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                opacity: 0,
                alphaTest: 1
            }),
            meshObject: () => {
                let mesh = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(20, 20, 1, 1),
                    this.hitbox.material
                );
                mesh.translateY(10);
                mesh.name = "hitbox";
                return mesh;
            }
        }
    }

    fleshOut() {
        this.updateAnimState("walk");
        this.material.uniforms.offsetX.value = this.animColCounter;
        this.material.uniforms.offsetY.value = this.animTable[this.animName];
    }

    updateAnimState(newState) {
        // console.log(this);
        //destruct
        const {
            tWeapon: weapon,
            tShield: shield,
            tMain: body,
            cols: keyframe
        } = this.material.uniforms;
        //

        this.oldState = this.currentState.name;
        let vals = Object.entries(this.animState);
        vals.forEach((val) => {
            this.animState[val[0]].isCurrent = false;
        });
        this.animState[newState].isCurrent = true;
        this.currentState.name = newState;
        this.currentState.limit = this.animState[newState].colLimit;

        if (newState == "walk") {
            body.value = this.textures.t2;
            if (this.name == "fallen") {
                weapon.value = this.textures.t3;
                shield.value = this.textures.t5;
            } else if (this.name == "shaman") {
                this.emitSound("walk");
            }
            keyframe.value = this.currentState.limit;

        } else if (newState == "idle") {
            if (this.name == "shaman" && this.oldState !== "walk") {
                this.stopFootsteps();
            }
            if (this.name == "fallen") {
                weapon.value = this.textures.t4;
                shield.value = this.textures.t6;
                if (this.animName == "topRight" || this.animName == "right" || this.animName == "botRight") {
                    this.material.uniforms.facingRight.value = false;
                } else {
                    this.material.uniforms.facingRight.value = true;
                }
                this.emitSound("idle");
            }
            body.value = this.textures.t1;
            keyframe.value = this.currentState.limit;
        } else if (newState == "attack") {
            if (this.name == "shaman") this.stopFootsteps();
            body.value = this.textures.t7;
            if (weapon) {
                weapon.value = this.textures.t8;
            }
            if (shield) {
                shield.value = this.textures.t9;
            }
            keyframe.value = this.currentState.limit;
            if (this.name == "shaman") this.emitSound("attack");
        } else if (newState == "resurect" && this.name == "fallen") {
            weapon.value = null;
            shield.value = null;
            //Fallen class : utility function cause sprite sheet is messed up for some reason
            this.adaptSpriteSheet();

            body.value = this.textures.t10;
            keyframe.value = this.currentState.limit;
        }
    }

    animae() {
        if (this.currentState.name == "resurect" && this.animColCounter == 23) {

            //Fallen class : utility function cause sprite sheet is messed up for some reason
            //Restore right order after resurection
            this.adaptSpriteSheet();
            this.stun((Math.random() * 100) + 50);
            this.isAlive = true;
            this.updateAnimState("idle");
        }
        this.animColCounter = (this.animColCounter < this.currentState.limit) ? this.animColCounter + 1 : 0;
        if (this.currentState.name == "attack" && this.animColCounter < 1) {
            this.updateAnimState("idle");
        }
        this.material.uniforms.offsetX.value = this.animColCounter;
        this.material.uniforms.offsetY.value = this.animTable[this.animName];
    }

    run() {
        //console.log(this.animName);
        if (this.shouldAutoMove) {
            this.makeItAutoMove();
        } else if (this.currentState.name !== "attack") {
            let d = this.position.distanceTo(this.moveTarget);
            this.lastPos = new THREE.Vector3().copy(this.position);
            if (d > 0.5) {
                let seek = new THREE.Vector3().subVectors(this.moveTarget, this.position);
                seek.normalize();
                seek.multiplyScalar(0.65);
                this.position.add(seek);
            } else {
                this.updateAnimState("idle");
                this.material.uniforms.offsetX.value = this.animColCounter;
                this.material.uniforms.offsetY.value = this.animTable[this.animName];
            }
        }
    }

    stun(duration) {
        this.autoMoveCounter.current = duration * -1;
        this.autoMoveCounter.lastIdleRoll = 0;
    }

    updateVelocity() {
        let will = new THREE.Vector3().copy(this.velocity);
        will.add(repel);
        will.add(assault);

    }

    attack() {
        if (this.currentState.name !== "attack") {
            //update movement towards target
            if (this.name == "fallen" && this.combat.targetList.length > 0) {
                if (this.combat.targetList[0].stats.isDead) {
                    this.combat.targetList.shift();
                } else {
                    if (this.combat.targetList[0].position.distanceTo(this.position) < 35) {

                        this.combat.targetList[0].isUnderAttack = true;
                        this.velocity = new THREE.Vector3(0, 0, 0);
                        this.moveTarget = new THREE.Vector3().copy(this.position);
                        //this.combat.target.stats.hp.current -= Math.random() * 10;
                        this.updateSpriteAttack();
                        let dmg = Math.random() * 20;
                        this.combat.targetList[0].updateStats(dmg);
                    } else {
                        let desired = new THREE.Vector3().subVectors(this.combat.targetList[0].position, this.position);
                        desired.normalize();
                        desired.multiplyScalar(0.1);
                        this.velocity.add(desired).normalize();
                        this.updateSpriteWalk();
                    }
                }
            } else {
                this.updateSpriteAttack();
            }
        }
    }

    resurect() {
        this.isAlive = false;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.updateAnimState("resurect");
        this.animColCounter = 0;
        this.material.uniforms.offsetX.value = (this.animColCounter) / (this.currentState.limit);
        this.material.uniforms.offsetY.value = this.animTable[this.animName];
    }

    updateSpriteAttack() {
        //update anim
        this.updateAnimState("attack");
        this.animColCounter = 0;
        this.material.uniforms.offsetX.value = (this.animColCounter) / (this.currentState.limit);
        this.material.uniforms.offsetY.value = this.animTable[this.animName];
    }

    makeItAutoMove() {
        //check if combat before doing any move
        // if (this.combat.target !== null && this.forces.isStuck == false) {
        if (this.combat.targetList.length > 0 && this.forces.isStuck == false) {
            //  let d = this.position.distanceTo(this.combat.target.position);
            //	let desiredTPos = new THREE.Vector3().subVectors(this.combat.target.position, this.position);
            //      desiredTPos.normalize().multiplyScalar(0.1);
            //       this.velocity.add(desiredTPos);
            this.attack();

        }

        //new random velocity every X frames
        if (this.autoMoveCounter.current >= this.autoMoveCounter.changeAt && this.combat.targetList.length < 1 && this.isAlive == true) {
            this.autoMoveCounter.current = 0;
            this.autoMoveCounter.changeAt = 50 + Math.random() * 30;
            //calculate distance between Fallen and Master position
            //master position set as 0,0,0 for the sake of test
            //console.log(this.master);
            var masterPos = this.master.position;

            //see whether in yoke distance of master
            let d = this.position.distanceTo(masterPos);

            //give a chance to want to be idle
            this.lastIdleRoll = Math.random();
            let r = this.lastIdleRoll;
            if (d < 15 && r > this.autoMoveCounter.chancesToIdle) {
                this.velocity = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5);
                this.moveTarget = new THREE.Vector3().copy(d);
                this.updateSpriteWalk();
            } else if (d < 15 && r <= this.autoMoveCounter.chancesToIdle) {
                this.updateAnimState("idle");
                this.material.uniforms.offsetX.value = this.animColCounter;
                this.material.uniforms.offsetY.value = this.animTable[this.animName];
                this.velocity = new THREE.Vector3(0, 0, 0);
            } else if (d > 15 && r > this.autoMoveCounter.chancesToIdle) {
                let nbOfFallens = 10; //shouldn't be hardcoded
                let angle = ((360 / nbOfFallens) * Math.floor(Math.random() * nbOfFallens)) * (Math.PI / 180);
                let r = 30;
                let x = this.master.position.x + Math.cos(angle) * r;
                let z = this.master.position.z + Math.sin(angle) * r;

                let circleAroundMaster = new THREE.Vector3(x, this.master.position.y, z);
                let desired = new THREE.Vector3().subVectors(circleAroundMaster, this.position);
                desired.normalize().multiplyScalar(0.5);
                this.velocity = desired;
                this.updateSpriteWalk();
            }
        } else if (this.isAlive == true) {
            this.position.add(this.velocity);
            this.autoMoveCounter.current++;
        }
    }

    updateSpriteWalk() {
        if (this.forces.isStuck == false) {
            this.updateAnimState("walk");
        }
        var seeka = new THREE.Vector3();
        if (this.shouldAutoMove) {
            let futurePos = new THREE.Vector3().copy(this.position).add(this.velocity);
            seeka.subVectors(futurePos, this.position);
        } else {
            seeka.subVectors(this.moveTarget, this.position);
        }

        seeka.normalize();
        seeka.z *= -1; //set positive z to the far distance instead of towards camera

        if (seeka.x > -0.35 && seeka.x < 0.35 && seeka.z > 0) {
            this.animName = "top";
        } else if (seeka.x > 0.35 && seeka.z > 0.35) {
            this.animName = "topRight";
        } else if (seeka.x > 0.35 && seeka.z > -0.35 && seeka.z < 0.35) {
            this.animName = "right";
        } else if (seeka.x > 0.35 && seeka.z < 0) {
            this.animName = "botRight";
        } else if (seeka.x > -0.35 && seeka.x < 0.35 && seeka.z < 0) {
            this.animName = "bot";
        } else if (seeka.x < -0.35 && seeka.z < 0) {
            this.animName = "botLeft";
        } else if (seeka.x < 0.35 && seeka.z > -0.35 && seeka.z < 0.35) {
            this.animName = "left";
        } else if (seeka.x < 0.35 && seeka.z > 0) {
            this.animName = "topLeft";
        }

        if (this.name == "fallen") {
            if (this.animName == "topRight" || this.animName == "right" || this.animName == "botRight") {
                this.material.uniforms.facingRight.value = false;
            } else {
                this.material.uniforms.facingRight.value = true;
            }
        }
    }

    update(camera) {
        let camPos = new THREE.Vector3().copy(this.position).add(new THREE.Vector3(0, 75, 50));
        camera.position.set(camPos.x, camPos.y - 5, camPos.z + 15);
        camera.lookAt(new THREE.Vector3(this.position.x, this.position.y + 5, this.position.z - 5));

        this.lookAt(new THREE.Vector3(camera.position.x, this.position.y + 25, camera.position.z));
        if (this.shadow) this.shadow.position.set(this.position.x, this.position.y, this.position.z);
    }

    emitSound(state) {
        let soundLayers = this.sound[state].path;
        for (let i = 0; i < soundLayers.length; i++) {
            if (this.name == "shaman" && this.oldState == "walk" && this.currentState.name !== "attack") {
                return;
            } else {
                let r = Math.random();
                let chancesToEmit = this.sound[state].proba[i];
                if (r < chancesToEmit) {
                    let tracksCount = this.sound[state].count[i];
                    let trackID = Math.floor(Math.random() * tracksCount);
                    let trackName = `${state}${trackID}.wav`;
                    let trackPath = `${this.sound[state].path[i]}${trackName}`;

                    this.sound[state].player[i].src = trackPath;
                    if (this.name == "shaman" && state == "walk" && i == 1) {
                        //     this.sound[state].player[i].loop = true;
                    }
                    //  this.sound[state].player[i].play();
                }
            }
        }
    }
}