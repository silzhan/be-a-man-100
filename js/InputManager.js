/**
 * 输入管理器
 * 处理键盘和触摸输入
 */
class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        
        // 按键状态
        this.keys = {
            left: false,
            right: false,
            jump: false,
            pause: false,
            restart: false
        };

        // 触摸状态
        this.touch = {
            active: false,
            left: false,
            right: false,
            startX: 0,
            startY: 0
        };

        // 暂停键单次触发
        this.pausePressed = false;
        this.restartPressed = false;

        this._setupKeyboard();
        this._setupTouch();
    }

    /**
     * 设置键盘事件
     */
    _setupKeyboard() {
        // 按键映射
        const keyMap = {
            'ArrowLeft': 'left',
            'KeyA': 'left',
            'ArrowRight': 'right',
            'KeyD': 'right',
            'ArrowUp': 'jump',
            'KeyW': 'jump',
            'Space': 'jump'
        };

        document.addEventListener('keydown', (e) => {
            const action = keyMap[e.code];
            if (action) {
                e.preventDefault();
                this.keys[action] = true;
            }

            // 暂停键 (P 或 ESC)
            if (e.code === 'KeyP' || e.code === 'Escape') {
                e.preventDefault();
                if (!this.pausePressed) {
                    this.keys.pause = true;
                    this.pausePressed = true;
                }
            }

            // 重新开始 (R)
            if (e.code === 'KeyR') {
                e.preventDefault();
                if (!this.restartPressed) {
                    this.keys.restart = true;
                    this.restartPressed = true;
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            const action = keyMap[e.code];
            if (action) {
                this.keys[action] = false;
            }

            if (e.code === 'KeyP' || e.code === 'Escape') {
                this.pausePressed = false;
            }

            if (e.code === 'KeyR') {
                this.restartPressed = false;
            }
        });

        // 窗口失焦时重置所有按键
        window.addEventListener('blur', () => {
            this.keys.left = false;
            this.keys.right = false;
            this.keys.jump = false;
        });
    }

    /**
     * 设置触摸事件
     */
    _setupTouch() {
        // 触摸开始
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touch.active = true;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            
            // 根据触摸位置判断左右
            this.touch.left = x < rect.width / 2;
            this.touch.right = !this.touch.left;
            
            this.touch.startX = x;
            this.touch.startY = touch.clientY - rect.top;
        }, { passive: false });

        // 触摸移动
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.touch.active) return;

            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            
            // 根据当前位置更新方向
            this.touch.left = x < rect.width / 2;
            this.touch.right = !this.touch.left;
        }, { passive: false });

        // 触摸结束
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touch.active = false;
            this.touch.left = false;
            this.touch.right = false;
        }, { passive: false });

        // 触摸取消
        this.canvas.addEventListener('touchcancel', (e) => {
            this.touch.active = false;
            this.touch.left = false;
            this.touch.right = false;
        });
    }

    /**
     * 获取向左移动状态
     */
    isMovingLeft() {
        return this.keys.left || this.touch.left;
    }

    /**
     * 获取向右移动状态
     */
    isMovingRight() {
        return this.keys.right || this.touch.right;
    }

    /**
     * 获取跳跃状态
     */
    isJumping() {
        return this.keys.jump;
    }

    /**
     * 检测暂停键（单次触发）
     */
    isPausePressed() {
        if (this.keys.pause) {
            this.keys.pause = false;
            return true;
        }
        return false;
    }

    /**
     * 检测重新开始键（单次触发）
     */
    isRestartPressed() {
        if (this.keys.restart) {
            this.keys.restart = false;
            return true;
        }
        return false;
    }

    /**
     * 重置所有输入状态
     */
    reset() {
        this.keys.left = false;
        this.keys.right = false;
        this.keys.jump = false;
        this.keys.pause = false;
        this.keys.restart = false;
        this.touch.active = false;
        this.touch.left = false;
        this.touch.right = false;
    }
}
