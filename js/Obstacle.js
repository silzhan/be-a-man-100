/**
 * 障碍物类
 * 7种障碍物：移动障碍、旋转齿轮、风扇、激光、压板、飞行敌人、倒塌墙
 */
class Obstacle {
    constructor(x, y, type, options = {}) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
        this.timer = 0;

        // 尺寸
        this.width = options.width || 20;
        this.height = options.height || 20;

        // 移动参数
        this.vx = options.vx || 0;
        this.vy = options.vy || 0;
        this.startX = x;
        this.startY = y;
        this.moveRange = options.moveRange || 0;

        // 齿轮旋转
        this.rotation = 0;
        this.rotationSpeed = options.rotationSpeed || 0.05;
        this.orbitRadius = options.orbitRadius || 0;

        // 风扇
        this.fanBladeFrame = 0;
        this.windDirection = options.windDirection || 1; // 1=向下，-1=向上

        // 激光
        this.laserOn = true;
        this.laserOnFrames = 90;   // 1.5s
        this.laserOffFrames = 48;  // 0.8s
        this.laserWarning = false;
        this.canvasWidth = options.canvasWidth || 480;

        // 压板
        this.crusherPhase = 'up'; // up / down / pause_up / pause_down
        this.crusherPauseTimer = 0;
        this.crusherDownSpeed = 1;
        this.crusherUpSpeed = 3;

        // 飞行敌人
        this.flyTimer = Math.random() * 100;
        this.flyAmplitude = options.flyAmplitude || 30;

        // 倒塌墙
        this.fallSpeed = options.fallSpeed || 3;
        this.shadowShown = false;
        this.shadowTimer = 0;
    }

    update() {
        if (!this.active) return;
        this.timer++;

        switch (this.type) {
            case CONSTANTS.OBSTACLE_TYPES.MOVING_BARRIER:
                this._updateMovingBarrier();
                break;
            case CONSTANTS.OBSTACLE_TYPES.GEAR:
                this._updateGear();
                break;
            case CONSTANTS.OBSTACLE_TYPES.FAN:
                this._updateFan();
                break;
            case CONSTANTS.OBSTACLE_TYPES.LASER:
                this._updateLaser();
                break;
            case CONSTANTS.OBSTACLE_TYPES.CRUSHER:
                this._updateCrusher();
                break;
            case CONSTANTS.OBSTACLE_TYPES.FLYING_ENEMY:
                this._updateFlyingEnemy();
                break;
            case CONSTANTS.OBSTACLE_TYPES.FALLING_WALL:
                this._updateFallingWall();
                break;
        }
    }

    // 移动障碍：在平台上方左右移动
    _updateMovingBarrier() {
        this.x += this.vx;
        if (Math.abs(this.x - this.startX) > this.moveRange) {
            this.vx *= -1;
        }
    }

    // 旋转齿轮：自转 + 可选圆周运动
    _updateGear() {
        this.rotation += this.rotationSpeed;
        if (this.orbitRadius > 0) {
            this.x = this.startX + Math.cos(this.timer * 0.02) * this.orbitRadius;
            this.y = this.startY + Math.sin(this.timer * 0.02) * this.orbitRadius;
        }
    }

    // 风扇：叶片旋转
    _updateFan() {
        this.fanBladeFrame = (this.fanBladeFrame + 1) % 4;
    }

    // 激光：开关循环，有预警
    _updateLaser() {
        const cycle = this.laserOnFrames + this.laserOffFrames;
        const pos = this.timer % cycle;

        if (pos < this.laserOnFrames) {
            // 开启阶段
            if (pos > this.laserOnFrames - 18) {
                // 预警闪烁（关前0.3s）
                this.laserWarning = true;
            } else {
                this.laserWarning = false;
            }
            this.laserOn = true;
        } else {
            // 关闭阶段
            if (pos > cycle - 18) {
                // 开启前预警
                this.laserWarning = true;
            } else {
                this.laserWarning = false;
            }
            this.laserOn = false;
        }
    }

    // 压板：慢下 → 底部暂停1s → 快上 → 顶部暂停0.5s
    _updateCrusher() {
        switch (this.crusherPhase) {
            case 'down':
                this.y += this.crusherDownSpeed;
                if (this.y >= this.startY + 80) {
                    this.crusherPhase = 'pause_down';
                    this.crusherPauseTimer = 60; // 1s
                }
                break;
            case 'pause_down':
                this.crusherPauseTimer--;
                if (this.crusherPauseTimer <= 0) {
                    this.crusherPhase = 'up';
                }
                break;
            case 'up':
                this.y -= this.crusherUpSpeed;
                if (this.y <= this.startY) {
                    this.crusherPhase = 'pause_up';
                    this.crusherPauseTimer = 30; // 0.5s
                }
                break;
            case 'pause_up':
                this.crusherPauseTimer--;
                if (this.crusherPauseTimer <= 0) {
                    this.crusherPhase = 'down';
                }
                break;
        }
    }

    // 飞行敌人：水平+正弦波轨迹
    _updateFlyingEnemy() {
        this.flyTimer += 0.03;
        this.x += this.vx;
        this.y = this.startY + Math.sin(this.flyTimer) * this.flyAmplitude;

        // 边界反弹
        if (this.x < 0 || this.x > 480 - this.width) {
            this.vx *= -1;
        }
    }

    // 倒塌墙：从顶掉落，有阴影预警
    _updateFallingWall() {
        if (!this.shadowShown) {
            this.shadowTimer++;
            if (this.shadowTimer > 30) { // 0.5s预警
                this.shadowShown = true;
            }
        } else {
            this.y += this.fallSpeed;
            if (this.y > 800) {
                this.active = false;
            }
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    // 获取风扇气流区域
    getWindZone() {
        return {
            x: this.x,
            y: this.y + this.height,
            width: this.width,
            height: 80
        };
    }

    // ==================== 静态工厂方法 ====================

    static createMovingBarrier(platform) {
        return new Obstacle(
            platform.x + 10,
            platform.y - 20,
            CONSTANTS.OBSTACLE_TYPES.MOVING_BARRIER,
            {
                width: 20, height: 20,
                vx: 1 + Math.random(),
                moveRange: 40 + Math.random() * 40
            }
        );
    }

    static createGear(x, y) {
        return new Obstacle(x, y, CONSTANTS.OBSTACLE_TYPES.GEAR, {
            width: 24, height: 24,
            rotationSpeed: 0.05 + Math.random() * 0.03,
            orbitRadius: Math.random() > 0.5 ? 20 + Math.random() * 20 : 0
        });
    }

    static createFan(x, y) {
        return new Obstacle(x, y, CONSTANTS.OBSTACLE_TYPES.FAN, {
            width: 30, height: 12
        });
    }

    static createLaser(y, canvasWidth) {
        return new Obstacle(0, y, CONSTANTS.OBSTACLE_TYPES.LASER, {
            width: canvasWidth || 480, height: 4,
            canvasWidth: canvasWidth || 480
        });
    }

    static createCrusher(x, y) {
        return new Obstacle(x, y, CONSTANTS.OBSTACLE_TYPES.CRUSHER, {
            width: 40, height: 16,
            crusherPhase: 'down'
        });
    }

    static createFlyingEnemy(x, y) {
        return new Obstacle(x, y, CONSTANTS.OBSTACLE_TYPES.FLYING_ENEMY, {
            width: 16, height: 16,
            vx: 0.8 + Math.random() * 0.8,
            flyAmplitude: 20 + Math.random() * 30
        });
    }

    static createFallingWall(x, y) {
        const w = 144 + Math.random() * 96; // 屏幕30%~50%
        return new Obstacle(x, y, CONSTANTS.OBSTACLE_TYPES.FALLING_WALL, {
            width: w, height: 20,
            fallSpeed: 3 + Math.random() * 2
        });
    }
}
