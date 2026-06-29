/**
 * 角色类
 * 火柴人风格，纯 Canvas 线条绘制
 */
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONSTANTS.PLAYER.WIDTH;
        this.height = CONSTANTS.PLAYER.HEIGHT;

        // 碰撞箱（略小于视觉）
        this.collisionWidth = CONSTANTS.PLAYER.COLLISION_WIDTH;
        this.collisionHeight = CONSTANTS.PLAYER.COLLISION_HEIGHT;

        this.vx = 0;
        this.vy = 0;

        this.alive = true;
        this.facing = 1; // 1=右，-1=左

        // 生命系统（原版12条命）
        this.life = CONSTANTS.PLAYER.MAX_LIFE;
        this.maxLife = CONSTANTS.PLAYER.MAX_LIFE;
        this.isHurt = false;    // 受伤状态
        this.hurtTimer = 0;     // 受伤闪烁计时
        this.xForce = 0;        // 水平外力（左右推力）

        // 动画状态
        this.animState = 'falling'; // falling / standing / hit / dying / celebrating
        this.squash = 1;
        this.stretch = 1;
        this.walkTimer = 0;
        this.bodySway = 0;
        this.armAngle = 0;
        this.legAngle = 0;

        // 死亡动画
        this.deathTimer = 0;
        this.deathParticles = [];
    }

    update(input, canvasWidth) {
        if (!this.alive) {
            this._updateDeathAnim();
            return;
        }

        // 水平移动
        if (input.isMovingLeft()) {
            this.vx = -CONSTANTS.PHYSICS.MOVE_SPEED;
            this.facing = -1;
        } else if (input.isMovingRight()) {
            this.vx = CONSTANTS.PHYSICS.MOVE_SPEED;
            this.facing = 1;
        } else {
            this.vx *= CONSTANTS.PHYSICS.FRICTION;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
        }

        // 应用水平外力（左右推力）
        this.vx += this.xForce;
        this.xForce *= 0.95; // 衰减

        // 重力
        this.vy += CONSTANTS.PHYSICS.GRAVITY;
        if (this.vy > CONSTANTS.PHYSICS.MAX_FALL_SPEED) {
            this.vy = CONSTANTS.PHYSICS.MAX_FALL_SPEED;
        }

        this.x += this.vx;
        this.y += this.vy;

        // 屏幕边界循环
        if (this.x + this.width / 2 < 0) {
            this.x = canvasWidth - this.width / 2;
        } else if (this.x + this.width / 2 > canvasWidth) {
            this.x = -this.width / 2;
        }

        this._updateAnimState();
        this._updateAnimation();
    }

    _updateAnimState() {
        if (this.vy < -2) {
            this.animState = 'standing'; // 弹跳瞬间
        } else if (this.vy > 2) {
            this.animState = 'falling';
        } else {
            this.animState = 'standing';
        }
    }

    _updateAnimation() {
        this.squash = Utils.lerp(this.squash, 1, 0.15);
        this.stretch = Utils.lerp(this.stretch, 1, 0.15);

        // 受伤闪烁计时
        if (this.hurtTimer > 0) {
            this.hurtTimer--;
            if (this.hurtTimer <= 0) {
                this.isHurt = false;
            }
        }

        switch (this.animState) {
            case 'falling':
                // 下落：手臂上举张开45°，腿分开30°，身体微摆
                this.armAngle = Utils.lerp(this.armAngle, -Math.PI / 4, 0.1);
                this.legAngle = Utils.lerp(this.legAngle, Math.PI / 6, 0.1);
                this.bodySway = Math.sin(Date.now() * 0.01) * 0.05;
                break;

            case 'standing':
                // 弹跳/站立：手臂收回，腿微曲
                this.armAngle = Utils.lerp(this.armAngle, 0, 0.15);
                this.legAngle = Utils.lerp(this.legAngle, 0.1, 0.15);
                this.bodySway = Utils.lerp(this.bodySway, 0, 0.1);
                break;

            case 'dying':
                this.armAngle += 0.2;
                this.legAngle += 0.15;
                break;
        }
    }

    _updateDeathAnim() {
        this.deathTimer++;
        // 碎裂粒子飞散
        for (const p of this.deathParticles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life--;
        }
        this.deathParticles = this.deathParticles.filter(p => p.life > 0);
    }

    jump(velocity) {
        this.vy = velocity || CONSTANTS.PHYSICS.JUMP_VELOCITY;
        this.squash = 0.7;
        this.stretch = 1.3;
    }

    /**
     * 受伤（扣1血）
     */
    hurt() {
        if (this.isHurt) return; // 防止连续受伤
        this.life--;
        this.isHurt = true;
        this.hurtTimer = 60; // 受伤闪烁1秒
        if (this.life <= 0) {
            this.die();
        }
    }

    teleport(x, y) {
        this.x = x - this.width / 2;
        this.y = y;
        this.vy = 0;
    }

    die() {
        this.alive = false;
        this.vy = -8;
        this.deathTimer = 0;
        // 生成碎裂粒子
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.deathParticles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * (2 + Math.random() * 2),
                vy: Math.sin(angle) * (2 + Math.random() * 2) - 3,
                size: 2 + Math.random() * 3,
                life: 40 + Math.random() * 20
            });
        }
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.alive = true;
        this.facing = 1;
        this.squash = 1;
        this.stretch = 1;
        this.animState = 'falling';
        this.bodySway = 0;
        this.armAngle = 0;
        this.legAngle = 0;
        this.deathTimer = 0;
        this.deathParticles = [];
        this.life = CONSTANTS.PLAYER.MAX_LIFE;
        this.isHurt = false;
        this.hurtTimer = 0;
        this.xForce = 0;
    }

    getBounds() {
        // 碰撞箱居中
        const offsetX = (this.width - this.collisionWidth) / 2;
        const offsetY = this.height - this.collisionHeight;
        return {
            x: this.x + offsetX,
            y: this.y + offsetY,
            width: this.collisionWidth,
            height: this.collisionHeight
        };
    }

    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    getBottom() {
        return this.y + this.height;
    }
}
