/**
 * 平台类
 * 管理不同类型平台的行为和渲染
 */
class Platform {
    constructor(x, y, width, type, options = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = CONSTANTS.PLATFORM.HEIGHT;
        this.type = type;
        this.color = CONSTANTS.PLATFORM.COLORS[type];

        this.active = true;
        this.visible = true;

        // 移动平台
        this.moveSpeed = options.moveSpeed || 0;
        this.moveDirection = options.moveDirection || 1;
        this.moveRange = options.moveRange || 0;
        this.startX = x;
        this.isVerticalMove = options.isVerticalMove || false;
        this.startY = y;

        // 脆性平台（帧计数）
        this.breaking = false;
        this.breakTimer = 0;
        this.breakFrames = options.breakFrames || 90;
        this.shakeOffset = 0;

        // 传送平台
        this.glowTimer = 0;
        this.glowIntensity = 0;

        // 尖刺平台
        this.spikeTimer = 0;
    }

    update() {
        if (!this.active) return;

        switch (this.type) {
            case CONSTANTS.PLATFORM.TYPES.MOVING:
                this._updateMoving();
                break;
            case CONSTANTS.PLATFORM.TYPES.BRITTLE:
                this._updateBrittle();
                break;
            case CONSTANTS.PLATFORM.TYPES.TELEPORT:
                this._updateTeleport();
                break;
            case CONSTANTS.PLATFORM.TYPES.SPIKE:
                this._updateSpike();
                break;
        }
    }

    _updateMoving() {
        if (this.isVerticalMove) {
            this.y += this.moveSpeed * this.moveDirection;
            if (Math.abs(this.y - this.startY) > this.moveRange) {
                this.moveDirection *= -1;
            }
        } else {
            this.x += this.moveSpeed * this.moveDirection;
            if (Math.abs(this.x - this.startX) > this.moveRange) {
                this.moveDirection *= -1;
            }
        }
    }

    _updateBrittle() {
        if (this.breaking) {
            this.breakTimer++;
            this.shakeOffset = (Math.random() - 0.5) * CONSTANTS.PLATFORM.BRITTLE.SHAKE_INTENSITY;
            if (this.breakTimer >= this.breakFrames) {
                this.active = false;
            }
        }
    }

    _updateTeleport() {
        this.glowTimer += 0.05;
        this.glowIntensity = 0.5 + Math.sin(this.glowTimer) * 0.5;
    }

    _updateSpike() {
        this.spikeTimer += 0.03;
    }

    startBreaking() {
        if (this.type === CONSTANTS.PLATFORM.TYPES.BRITTLE && !this.breaking) {
            this.breaking = true;
            this.breakTimer = 0;
        }
    }

    getBounds() {
        return {
            x: this.x + this.shakeOffset,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isInView(cameraY, canvasHeight, margin = 100) {
        return (
            this.y + this.height > cameraY - margin &&
            this.y < cameraY + canvasHeight + margin
        );
    }

    getDisplayColor() {
        switch (this.type) {
            case CONSTANTS.PLATFORM.TYPES.TELEPORT:
                return `rgba(255, 255, 255, ${0.5 + this.glowIntensity * 0.5})`;
            case CONSTANTS.PLATFORM.TYPES.BRITTLE:
                if (this.breaking) {
                    const progress = this.breakTimer / this.breakFrames;
                    return `rgba(255, 136, 0, ${1 - progress})`;
                }
                return this.color;
            default:
                return this.color;
        }
    }

    static createNormal(x, y, width) {
        return new Platform(x, y, width, CONSTANTS.PLATFORM.TYPES.NORMAL);
    }

    static createMoving(x, y, width, speed, isVertical = false) {
        return new Platform(x, y, width, CONSTANTS.PLATFORM.TYPES.MOVING, {
            moveSpeed: speed,
            moveRange: Utils.randomFloat(50, 100),
            moveDirection: Math.random() > 0.5 ? 1 : -1,
            isVerticalMove: isVertical
        });
    }

    static createBrittle(x, y, width, breakFrames) {
        return new Platform(x, y, width, CONSTANTS.PLATFORM.TYPES.BRITTLE, { breakFrames });
    }

    static createTeleport(x, y, width) {
        return new Platform(x, y, width, CONSTANTS.PLATFORM.TYPES.TELEPORT);
    }

    static createSpike(x, y, width) {
        return new Platform(x, y, width, CONSTANTS.PLATFORM.TYPES.SPIKE);
    }

    // 原版平台类型
    static createLeft(x, y, width) {
        return new Platform(x, y, width, CONSTANTS.PLATFORM.TYPES.LEFT);
    }

    static createRight(x, y, width) {
        return new Platform(x, y, width, CONSTANTS.PLATFORM.TYPES.RIGHT);
    }

    static createNail(x, y, width) {
        return new Platform(x, y, width, CONSTANTS.PLATFORM.TYPES.NAIL);
    }

    static createRoll(x, y, width) {
        return new Platform(x, y, width, CONSTANTS.PLATFORM.TYPES.ROLL);
    }

    static createSpring(x, y, width) {
        return new Platform(x, y, width, CONSTANTS.PLATFORM.TYPES.SPRING);
    }
}
