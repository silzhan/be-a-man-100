/**
 * 游戏主类
 * 管理游戏状态、核心循环和模块协调
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 游戏状态
        this.state = CONSTANTS.GAME_STATES.MENU;

        // 初始化各模块
        this.renderer = new Renderer(canvas);
        this.input = new InputManager(canvas);
        this.screenManager = new ScreenManager(canvas);
        this.particleSystem = new ParticleSystem();
        this.soundManager = new SoundManager();
        this.physics = new Physics();

        // 游戏对象（在 startGame 中初始化）
        this.player = null;
        this.platformManager = null;
        this.camera = null;
        this.hud = null;

        // 分数
        this.bestFloor = Utils.getStorage(CONSTANTS.STORAGE.BEST_SCORE, 0);
        this.isNewRecord = false;
        this._lastMilestone = 0; // 上次庆祝的里程碑层数

        // 暂停菜单点击检测区域
        this.pauseButtons = [];

        // 绑定循环
        this._gameLoop = this._gameLoop.bind(this);
    }

    /**
     * 启动游戏循环
     */
    start() {
        this._resizeCanvas();
        window.addEventListener('resize', () => this._resizeCanvas());
        requestAnimationFrame(this._gameLoop);
    }

    /**
     * 游戏主循环
     */
    _gameLoop() {
        switch (this.state) {
            case CONSTANTS.GAME_STATES.MENU:
                this._updateMenu();
                this._renderMenu();
                break;

            case CONSTANTS.GAME_STATES.PLAYING:
                this._updatePlaying();
                this._renderPlaying();
                break;

            case CONSTANTS.GAME_STATES.PAUSED:
                this._updatePaused();
                this._renderPaused();
                break;

            case CONSTANTS.GAME_STATES.GAME_OVER:
                this._updateGameOver();
                this._renderGameOver();
                break;

            case CONSTANTS.GAME_STATES.WIN:
                this._updateWin();
                this._renderWin();
                break;
        }

        requestAnimationFrame(this._gameLoop);
    }

    // ==================== 菜单状态 ====================

    _updateMenu() {
        // 检测开始游戏（键盘）
        if (this.input.keys.jump) {
            this.input.keys.jump = false;
            this._startGame();
        }
        // 检测是否点击了开始按钮区域
        if (this.input.touch.active) {
            const rect = this.canvas.getBoundingClientRect();
            const tx = (this.input.touch.startX / rect.width) * this.canvas.width;
            const ty = (this.input.touch.startY / rect.height) * this.canvas.height;
            this.input.touch.active = false;
            
            const btnW = 180, btnH = 45;
            const btnX = this.canvas.width / 2 - btnW / 2;
            const btnY = this.canvas.height * 0.5;
            if (tx >= btnX && tx <= btnX + btnW &&
                ty >= btnY && ty <= btnY + btnH) {
                this._startGame();
            }
        }
    }

    _renderMenu() {
        this.screenManager.renderMenu(this.bestFloor);
    }

    // ==================== 游戏进行状态 ====================

    _startGame() {
        // 初始化游戏对象
        this.player = new Player(CONSTANTS.PLAYER.START_X - CONSTANTS.PLAYER.WIDTH / 2, CONSTANTS.PLAYER.START_Y);
        this.platformManager = new PlatformManager(this.canvas.width, this.canvas.height);
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.hud = new HUD(this.canvas.width);

        // 初始化
        this.platformManager.init();
        this.camera.init(0); // 摄像机从顶部开始
        this.particleSystem.clear();
        this.hud.reset();

        this.isNewRecord = false;
        this._lastMilestone = 0;
        this.state = CONSTANTS.GAME_STATES.PLAYING;
    }

    _updatePlaying() {
        // 检测暂停
        if (this.input.isPausePressed()) {
            this.state = CONSTANTS.GAME_STATES.PAUSED;
            return;
        }

        // 保存上一帧位置（用于碰撞检测）
        this.physics.savePreviousPosition(this.player);

        // 更新玩家输入
        this.player.update(this.input, this.canvas.width);

        // 获取当前层数
        const currentFloor = this.camera.getCurrentFloor();

        // 更新平台
        this.platformManager.update(this.camera.y, currentFloor);

        // 碰撞检测
        const platforms = this.platformManager.getActivePlatforms();
        const collision = this.physics.checkPlatformCollision(this.player, platforms);
        const result = this.physics.handleCollision(
            this.player,
            collision,
            this.particleSystem,
            this.soundManager
        );

        // 检测死亡（生命归零）
        if (result === 'death' || !this.player.alive) {
            this.particleSystem.emitDeath(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2
            );
            this._gameOver();
            return;
        }

        // 检测障碍物碰撞
        const obstacles = this.platformManager.getActiveObstacles();
        const obsHit = this.physics.checkObstacleCollision(this.player, obstacles);
        if (obsHit && obsHit.hit) {
            // 扣血（不同障碍物不同伤害）
            for (let i = 0; i < obsHit.damage; i++) {
                this.player.hurt();
            }
            this.soundManager.playHit();
            if (!this.player.alive) {
                this.particleSystem.emitDeath(
                    this.player.x + this.player.width / 2,
                    this.player.y + this.player.height / 2
                );
                this._gameOver();
                return;
            }
        }
        // 风扇气流效果
        if (obsHit && obsHit.type === 'wind') {
            this.player.vy += 0.2 * obsHit.direction;
        }

        // 检测掉出屏幕
        if (this.physics.isOutOfBounds(this.player, this.camera.y, this.canvas.height)) {
            this._gameOver();
            return;
        }

        // 更新摄像机
        this.camera.update(this.player.y);

        // 检测层数变化
        const newFloor = this.camera.getCurrentFloor();
        if (newFloor > currentFloor) {
            // 每5层或每遇到5的倍数显示飘字提示
            if (newFloor % 5 === 0 || newFloor - currentFloor >= 5) {
                this.particleSystem.emitScorePopup(
                    this.player.x + this.player.width / 2,
                    this.player.y,
                    newFloor - currentFloor
                );
            }
        }

        // 检测通关（到达目标层数）
        if (newFloor >= CONSTANTS.TARGET_FLOOR) {
            this._win();
            return;
        }

        // 检测里程碑（每100层庆祝）
        if (newFloor > 0 && newFloor % 100 === 0 && newFloor !== this._lastMilestone) {
            this._lastMilestone = newFloor;
            this.particleSystem.emitCelebration(this.canvas.width, this.canvas.height);
            this.soundManager.playWin();
        }

        // 更新粒子
        this.particleSystem.update();

        // 更新 HUD
        this.hud.update(newFloor);
    }

    _renderPlaying() {
        const ctx = this.ctx;

        // 清空画布
        this.renderer.clear();

        // 渲染背景
        this.renderer.renderBackground(this.camera);

        // 渲染平台
        const platforms = this.platformManager.getActivePlatforms();
        for (const platform of platforms) {
            if (platform.isInView(this.camera.y, this.canvas.height)) {
                this.renderer.renderPlatform(platform, this.camera);
            }
        }

        // 渲染障碍物
        const obstacles = this.platformManager.getActiveObstacles();
        for (const obs of obstacles) {
            this.renderer.renderObstacle(obs, this.camera);
        }

        // 渲染粒子
        this.particleSystem.render(ctx, this.camera);

        // 渲染角色
        this.renderer.renderPlayer(this.player, this.camera);

        // 渲染虚拟按钮
        this.renderer.renderVirtualButtons(this.input);

        // 渲染 HUD
        const currentFloor = this.camera.getCurrentFloor();
        this.hud.render(ctx, currentFloor, Math.max(this.bestFloor, currentFloor), this.canvas.width, this.player.life);
    }

    // ==================== 暂停状态 ====================

    _updatePaused() {
        // 检测继续
        if (this.input.isPausePressed()) {
            this.state = CONSTANTS.GAME_STATES.PLAYING;
            return;
        }

        // 检测菜单按钮点击
        if (this.input.touch.active) {
            const touch = this.input.touch;
            const rect = this.canvas.getBoundingClientRect();
            const x = (touch.startX / rect.width) * this.canvas.width;
            const y = (touch.startY / rect.height) * this.canvas.height;

            for (const btn of this.pauseButtons) {
                if (x >= btn.x && x <= btn.x + btn.w &&
                    y >= btn.y && y <= btn.y + btn.h) {
                    this.input.touch.active = false;
                    btn.action();
                    return;
                }
            }
        }
    }

    _renderPaused() {
        this._renderPlaying(); // 先渲染游戏画面
        this.screenManager.renderPause();

        // 记录按钮区域（用于点击检测）
        const width = this.canvas.width;
        const height = this.canvas.height;
        const btnW = 160, btnH = 40;

        this.pauseButtons = [
            {
                x: width / 2 - btnW / 2, y: height * 0.48,
                w: btnW, h: btnH,
                action: () => { this.state = CONSTANTS.GAME_STATES.PLAYING; }
            },
            {
                x: width / 2 - btnW / 2, y: height * 0.58,
                w: btnW, h: btnH,
                action: () => { this._startGame(); }
            },
            {
                x: width / 2 - btnW / 2, y: height * 0.68,
                w: btnW, h: btnH,
                action: () => { this.state = CONSTANTS.GAME_STATES.MENU; }
            }
        ];
    }

    // ==================== 游戏结束状态 ====================

    _gameOver() {
        this.player.die();
        this.soundManager.playHit();

        // 更新最高分
        const currentFloor = this.camera.getCurrentFloor();
        if (currentFloor > this.bestFloor) {
            this.bestFloor = currentFloor;
            this.isNewRecord = true;
            Utils.setStorage(CONSTANTS.STORAGE.BEST_SCORE, this.bestFloor);
        }

        // 延迟切换到结束画面
        setTimeout(() => {
            this.state = CONSTANTS.GAME_STATES.GAME_OVER;
        }, 800);
    }

    _updateGameOver() {
        this.particleSystem.update();

        // 检测重新开始（键盘）
        if (this.input.keys.jump) {
            this.input.keys.jump = false;
            this._startGame();
        }

        // 检测 R 键
        if (this.input.isRestartPressed()) {
            this._startGame();
        }

        // 触摸：检测是否点击了"再来一次"按钮
        if (this.input.touch.active) {
            const rect = this.canvas.getBoundingClientRect();
            const tx = (this.input.touch.startX / rect.width) * this.canvas.width;
            const ty = (this.input.touch.startY / rect.height) * this.canvas.height;
            this.input.touch.active = false;

            const btnW = 160, btnH = 45;
            const btnX = this.canvas.width / 2 - btnW / 2;
            const btnY = this.canvas.height * 0.78;
            if (tx >= btnX && tx <= btnX + btnW &&
                ty >= btnY && ty <= btnY + btnH) {
                this._startGame();
            }
        }
    }

    _renderGameOver() {
        const ctx = this.ctx;
        this.renderer.clear();
        this.renderer.renderBackground(this.camera);

        // 渲染残留粒子
        this.particleSystem.render(ctx, this.camera);

        const currentFloor = this.camera.getCurrentFloor();
        this.screenManager.renderGameOver(currentFloor, this.bestFloor, this.isNewRecord);
    }

    // ==================== 通关状态 ====================

    _win() {
        this.soundManager.playWin();
        this.particleSystem.emitCelebration(this.canvas.width, this.canvas.height);

        // 更新最高分
        if (CONSTANTS.TARGET_FLOOR > this.bestFloor) {
            this.bestFloor = CONSTANTS.TARGET_FLOOR;
            Utils.setStorage(CONSTANTS.STORAGE.BEST_SCORE, this.bestFloor);
        }

        this.state = CONSTANTS.GAME_STATES.WIN;
    }

    _updateWin() {
        this.particleSystem.update();

        // 检测返回菜单（键盘）
        if (this.input.keys.jump) {
            this.input.keys.jump = false;
            this.state = CONSTANTS.GAME_STATES.MENU;
        }

        // 触摸：检测是否点击了"返回主菜单"按钮
        if (this.input.touch.active) {
            const rect = this.canvas.getBoundingClientRect();
            const tx = (this.input.touch.startX / rect.width) * this.canvas.width;
            const ty = (this.input.touch.startY / rect.height) * this.canvas.height;
            this.input.touch.active = false;

            const btnW = 160, btnH = 45;
            const btnX = this.canvas.width / 2 - btnW / 2;
            const btnY = this.canvas.height * 0.8;
            if (tx >= btnX && tx <= btnX + btnW &&
                ty >= btnY && ty <= btnY + btnH) {
                this.state = CONSTANTS.GAME_STATES.MENU;
            }
        }
    }

    _renderWin() {
        const ctx = this.ctx;
        this.renderer.clear();

        // 渲染庆祝粒子
        this.particleSystem.render(ctx, this.camera);

        this.screenManager.renderWin(CONSTANTS.TARGET_FLOOR);
    }

    // ==================== 工具方法 ====================

    /**
     * 调整画布大小
     */
    _resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const maxWidth = CONSTANTS.CANVAS.DESIGN_WIDTH;
        const maxHeight = CONSTANTS.CANVAS.DESIGN_HEIGHT;

        let width = Math.min(window.innerWidth, maxWidth);
        let height = Math.min(window.innerHeight, maxHeight);

        // 保持比例
        const ratio = maxWidth / maxHeight;
        if (width / height > ratio) {
            width = height * ratio;
        } else {
            height = width / ratio;
        }

        this.canvas.width = width;
        this.canvas.height = height;

        // 更新各模块的画布尺寸
        if (this.renderer) this.renderer.resize(width, height);
        if (this.platformManager) this.platformManager.resize(width, height);
        if (this.camera) this.camera.resize(width, height);
        if (this.hud) this.hud.canvasWidth = width;
    }
}
