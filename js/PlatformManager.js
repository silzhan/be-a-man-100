/**
 * 平台管理器
 * 按需求文档 v2 概率表生成，保证可达性
 */
class PlatformManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.platforms = [];
        this.obstacles = [];
        this.lowestPlatformY = 0;
        this.lastPlatformCenterX = canvasWidth / 2;
    }

    init() {
        this.platforms = [];
        this.obstacles = [];
        this.lowestPlatformY = 0;
        this.lastPlatformCenterX = this.canvasWidth / 2;
        this._generateInitialPlatforms();
    }

    _generateInitialPlatforms() {
        // 起始平台（玩家正下方，宽一点好接住）
        const startW = 80;
        const startX = this.canvasWidth / 2 - startW / 2;
        this.platforms.push(Platform.createNormal(startX, 180, startW));
        this.lowestPlatformY = 180;
        this.lastPlatformCenterX = this.canvasWidth / 2;

        // 向下生成初始平台——保证每个平台都覆盖玩家垂直下落路径(x≈240)
        // 这样玩家不按方向键也能一直往下落，不会被"晾"在半空
        let currentY = 180;
        for (let i = 0; i < 20; i++) {
            currentY += Utils.randomFloat(52, 60);
            const t = i / 20;
            // 平台宽度从宽到窄平滑过渡（200→100），让玩家逐步适应
            const width = Utils.randomFloat(
                200 - t * 100,
                240 - t * 120
            );
            // 保证平台覆盖玩家默认下落路径(x=240 player collision: 234~246)
            // 平台左边缘 <= 234，右边缘 >= 246
            const minLeft = Math.max(0, 234 - (width - 12) / 2 - 20);
            const maxLeft = Math.min(234, this.canvasWidth - width);
            const x = Utils.randomFloat(minLeft, maxLeft);

            this.platforms.push(Platform.createNormal(x, currentY, width));
            this.lastPlatformCenterX = x + width / 2;
            this.lowestPlatformY = currentY;
        }
    }

    update(cameraY, currentFloor) {
        this._generatePlatforms(cameraY, currentFloor);
        this._cleanupPlatforms(cameraY);

        for (const p of this.platforms) {
            if (p.active) p.update();
        }
        for (const o of this.obstacles) {
            if (o.active) o.update();
        }
    }

    _generatePlatforms(cameraY, currentFloor) {
        const stage = this._getDifficulty(currentFloor);
        const targetY = cameraY + this.canvasHeight + 300;

        while (this.lowestPlatformY < targetY) {
            const gap = Utils.randomFloat(stage.platformGap[0], stage.platformGap[1]);
            const newY = this.lowestPlatformY + gap;

            // 选择平台类型
            const platform = this._createPlatformByDifficulty(newY, stage);
            this.platforms.push(platform);

            // 更新可达性参考
            this.lastPlatformCenterX = platform.x + platform.width / 2;

            // 生成障碍物
            this._trySpawnObstacle(newY, stage, platform);

            this.lowestPlatformY = newY;
        }
    }

    /**
     * 可达性算法：保证新平台与上一个平台水平重叠 ≥20px
     */
    _getReachableX(newWidth, lastCenterX) {
        // 角色最大水平跨越距离 = 水平速度 × 下落时间
        // 下落时间 = sqrt(2 × 垂直间距 / 重力)
        const maxGap = 90; // 最大垂直间距
        const fallTime = Math.sqrt(2 * maxGap / CONSTANTS.PHYSICS.GRAVITY);
        const maxReach = CONSTANTS.PHYSICS.MOVE_SPEED * fallTime;

        // 新平台中心必须在 [lastCenterX - maxReach, lastCenterX + maxReach] 范围内
        const minCenter = Math.max(newWidth / 2, lastCenterX - maxReach);
        const maxCenter = Math.min(this.canvasWidth - newWidth / 2, lastCenterX + maxReach);

        const centerX = Utils.randomFloat(minCenter, maxCenter);
        return Math.max(0, Math.min(this.canvasWidth - newWidth, centerX - newWidth / 2));
    }

    _createPlatformByDifficulty(y, stage) {
        const rand = Math.random();
        let cumulative = 0;

        // 按原版+扩展概率表
        cumulative += stage.spikeChance;
        if (rand < cumulative) {
            const w = this._getWidth(stage, 'spike');
            const x = this._getReachableX(w, this.lastPlatformCenterX);
            return Platform.createSpike(x, y, w);
        }

        cumulative += stage.teleportChance;
        if (rand < cumulative) {
            const w = this._getWidth(stage, 'teleport');
            const x = this._getReachableX(w, this.lastPlatformCenterX);
            return Platform.createTeleport(x, y, w);
        }

        cumulative += stage.nailChance;
        if (rand < cumulative) {
            const w = this._getWidth(stage, 'normal');
            const x = this._getReachableX(w, this.lastPlatformCenterX);
            return Platform.createNail(x, y, w);
        }

        cumulative += stage.brittleChance;
        if (rand < cumulative) {
            const w = this._getWidth(stage, 'brittle');
            const x = this._getReachableX(w, this.lastPlatformCenterX);
            return Platform.createBrittle(x, y, w, stage.brittleBreakFrames);
        }

        cumulative += stage.movingChance;
        if (rand < cumulative) {
            const w = this._getWidth(stage, 'moving');
            const x = this._getReachableX(w, this.lastPlatformCenterX);
            const isVertical = Math.random() < CONSTANTS.PLATFORM.MOVING.VERTICAL_CHANCE;
            return Platform.createMoving(x, y, w, stage.movingSpeed, isVertical);
        }

        cumulative += stage.leftChance;
        if (rand < cumulative) {
            const w = this._getWidth(stage, 'normal');
            const x = this._getReachableX(w, this.lastPlatformCenterX);
            return Platform.createLeft(x, y, w);
        }

        cumulative += stage.rightChance;
        if (rand < cumulative) {
            const w = this._getWidth(stage, 'normal');
            const x = this._getReachableX(w, this.lastPlatformCenterX);
            return Platform.createRight(x, y, w);
        }

        cumulative += stage.rollChance;
        if (rand < cumulative) {
            const w = this._getWidth(stage, 'normal');
            const x = this._getReachableX(w, this.lastPlatformCenterX);
            return Platform.createRoll(x, y, w);
        }

        cumulative += stage.springChance;
        if (rand < cumulative) {
            const w = this._getWidth(stage, 'normal');
            const x = this._getReachableX(w, this.lastPlatformCenterX);
            return Platform.createSpring(x, y, w);
        }

        // 默认普通平台
        const w = this._getWidth(stage, 'normal');
        const x = this._getReachableX(w, this.lastPlatformCenterX);
        return Platform.createNormal(x, y, w);
    }

    _getWidth(stage, type) {
        // 使用难度阶段配置的宽度范围
        return Utils.randomFloat(stage.platformWidthRange[0], stage.platformWidthRange[1]);
    }

    /**
     * 尝试在平台附近生成障碍物
     */
    _trySpawnObstacle(y, stage, platform) {
        const OT = CONSTANTS.OBSTACLE_TYPES;

        // 每个平台附近最多生成一个障碍物，防止无解堆叠
        const roll = Math.random();
        let obsSpawned = false;

        // 移动障碍（在平台上方）
        if (!obsSpawned && roll < stage.obsMovingBarrier) {
            this.obstacles.push(Obstacle.createMovingBarrier(platform));
            obsSpawned = true;
        }

        // 旋转齿轮（悬浮在平台间）- 独立判定，不影响主障碍物
        if (Math.random() < stage.obsGear * 0.5) {
            this.obstacles.push(Obstacle.createGear(
                Utils.randomFloat(20, this.canvasWidth - 44),
                y - Utils.randomFloat(20, 50)
            ));
            // 齿轮不占用主障碍物名额
        }

        // 如果不生成主障碍物，再尝试下一个
        if (!obsSpawned) {
            const roll2 = Math.random();
            // 风扇（固定在上方）
            if (roll2 < stage.obsFan) {
                this.obstacles.push(Obstacle.createFan(
                    Utils.randomFloat(30, this.canvasWidth - 60),
                    y - Utils.randomFloat(60, 100)
                ));
                obsSpawned = true;
            }
        }

        if (!obsSpawned) {
            const roll3 = Math.random();
            // 激光
            if (roll3 < stage.obsLaser) {
                this.obstacles.push(Obstacle.createLaser(y - Utils.randomFloat(10, 40), this.canvasWidth));
                obsSpawned = true;
            }
        }

        if (!obsSpawned) {
            const roll4 = Math.random();
            // 压板
            if (roll4 < stage.obsCrusher) {
                this.obstacles.push(Obstacle.createCrusher(
                    Utils.randomFloat(40, this.canvasWidth - 80),
                    y - Utils.randomFloat(80, 120)
                ));
                obsSpawned = true;
            }
        }

        if (!obsSpawned) {
            const roll5 = Math.random();
            // 飞行敌人
            if (roll5 < stage.obsFlyingEnemy) {
                this.obstacles.push(Obstacle.createFlyingEnemy(
                    Utils.randomFloat(10, this.canvasWidth - 26),
                    y - Utils.randomFloat(30, 80)
                ));
                obsSpawned = true;
            }
        }

        if (!obsSpawned) {
            // 倒塌墙（81-100层专属）
            if (Math.random() < stage.obsFallingWall) {
                this.obstacles.push(Obstacle.createFallingWall(
                    Utils.randomFloat(0, this.canvasWidth * 0.5),
                    y - this.canvasHeight - 50
                ));
            }
        }
    }

    _cleanupPlatforms(cameraY) {
        const removeAbove = cameraY - this.canvasHeight;
        this.platforms = this.platforms.filter(p =>
            p.active && p.y + p.height > removeAbove
        );
        this.obstacles = this.obstacles.filter(o =>
            o.active && o.y > removeAbove - 100 && o.y < cameraY + this.canvasHeight + 200
        );
    }

    _getDifficulty(currentFloor) {
        // 找到对应阶段
        for (const stage of CONSTANTS.DIFFICULTY.STAGES) {
            if (currentFloor >= stage.minFloor && currentFloor <= stage.maxFloor) {
                return stage;
            }
        }

        // 超过最大阶段：基于最后阶段，难度持续递增
        const baseStage = CONSTANTS.DIFFICULTY.STAGES[CONSTANTS.DIFFICULTY.STAGES.length - 1];
        const overflow = currentFloor - baseStage.maxFloor;
        const factor = 1 + overflow * 0.01; // 每层难度增加1%

        return {
            ...baseStage,
            platformGap: [
                Math.min(baseStage.platformGap[0] + overflow * 0.3, 120),
                Math.min(baseStage.platformGap[1] + overflow * 0.3, 140)
            ],
            platformWidthRange: [
                Math.max(baseStage.platformWidthRange[0] - overflow * 0.2, 60),
                Math.max(baseStage.platformWidthRange[1] - overflow * 0.2, 120)
            ],
            nailChance: Math.min(baseStage.nailChance + overflow * 0.002, 0.40),
            spikeChance: Math.min(baseStage.spikeChance + overflow * 0.002, 0.35),
            normalChance: Math.max(baseStage.normalChance - overflow * 0.003, 0.05),
            movingSpeed: baseStage.movingSpeed + overflow * 0.005,
            obsGear: Math.min(baseStage.obsGear + overflow * 0.002, 0.40),
            obsFan: Math.min(baseStage.obsFan + overflow * 0.002, 0.35),
            obsLaser: Math.min(baseStage.obsLaser + overflow * 0.002, 0.35),
            obsCrusher: Math.min(baseStage.obsCrusher + overflow * 0.002, 0.35),
            obsFlyingEnemy: Math.min(baseStage.obsFlyingEnemy + overflow * 0.002, 0.40),
            obsFallingWall: Math.min(baseStage.obsFallingWall + overflow * 0.002, 0.40)
        };
    }

    getActivePlatforms() {
        return this.platforms.filter(p => p.active);
    }

    getActiveObstacles() {
        return this.obstacles.filter(o => o.active);
    }

    reset() {
        this.init();
    }

    resize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }
}
