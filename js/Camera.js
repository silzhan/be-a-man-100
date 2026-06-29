/**
 * 摄像机类
 * 管理视口滚动和层数计算
 * 游戏向下坠落，摄像机向下滚动（y值增大）
 */
class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // 摄像机位置（左上角）
        this.x = 0;
        this.y = 0;

        // 目标位置（用于平滑跟随）
        this.targetY = 0;

        // 初始位置
        this.initialY = 0;

        // 当前层数
        this.currentFloor = 0;

        // 最高层数
        this.maxFloor = 0;

        // 层数计算
        this.floorHeight = CONSTANTS.DIFFICULTY.LEVEL_HEIGHT;

        // 是否已初始化
        this.initialized = false;
    }

    /**
     * 初始化摄像机位置
     */
    init(startY) {
        this.y = startY;
        this.initialY = startY;
        this.targetY = startY;
        this.currentFloor = 0;
        this.maxFloor = 0;
        this.initialized = true;
    }

    /**
     * 更新摄像机位置
     * 角色向下坠落（y增大），摄像机跟随下移
     */
    update(playerY) {
        if (!this.initialized) return;

        // 计算角色在屏幕上的位置
        const playerScreenY = playerY - this.y;
        const threshold = this.canvasHeight * CONSTANTS.CAMERA.FOLLOW_THRESHOLD;

        // 角色超过屏幕中上部分时，摄像机跟随下移
        if (playerScreenY > threshold) {
            const newTarget = playerY - threshold;
            // 只允许摄像机向下移动（y增大），不回滚
            if (newTarget > this.targetY) {
                this.targetY = newTarget;
            }
        }

        // 平滑跟随
        this.y = Utils.lerp(this.y, this.targetY, CONSTANTS.CAMERA.SMOOTH_FACTOR);

        // 计算层数
        this._calculateFloor();
    }

    /**
     * 计算当前层数
     * 摄像机向下滚动，y值增大，层数增加
     */
    _calculateFloor() {
        const distance = this.y - this.initialY;
        if (distance <= 0) return;

        const newFloor = Math.floor(distance / this.floorHeight);

        // 只允许层数增加
        if (newFloor > this.currentFloor) {
            this.currentFloor = newFloor;
            this.maxFloor = Math.max(this.maxFloor, this.currentFloor);
        }
    }

    /**
     * 获取当前层数
     */
    getCurrentFloor() {
        return this.currentFloor;
    }

    /**
     * 获取最高层数
     */
    getMaxFloor() {
        return this.maxFloor;
    }

    /**
     * 将世界坐标转换为屏幕坐标
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }

    /**
     * 将屏幕坐标转换为世界坐标
     */
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }

    /**
     * 检查对象是否在屏幕内
     */
    isInView(worldX, worldY, width, height) {
        return (
            worldX + width > this.x &&
            worldX < this.x + this.canvasWidth &&
            worldY + height > this.y &&
            worldY < this.y + this.canvasHeight
        );
    }

    /**
     * 重置摄像机
     */
    reset(startY) {
        this.init(startY);
    }

    /**
     * 更新画布尺寸
     */
    resize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }
}
