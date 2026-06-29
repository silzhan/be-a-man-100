/**
 * 工具函数模块
 * 提供通用的辅助函数
 */
const Utils = {
    /**
     * 生成指定范围内的随机整数
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * 生成指定范围内的随机浮点数
     */
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * 限制值在指定范围内
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * 线性插值
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    /**
     * 检测两个矩形是否重叠 (AABB碰撞检测)
     */
    rectOverlap(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    },

    /**
     * 检测角色是否从上方落在平台上
     */
    isLandingOnPlatform(player, platform, prevPlayerY) {
        const playerBottom = player.y + player.height;
        const prevPlayerBottom = prevPlayerY + player.height;
        const platformTop = platform.y;

        // 角色底部在当前帧或上一帧与平台顶部接触
        const isFalling = player.vy >= 0;
        const wasAbove = prevPlayerBottom <= platformTop + 5;
        const isAtPlatform = Math.abs(playerBottom - platformTop) < 10;

        // 水平范围重叠
        const horizontalOverlap = (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width
        );

        return isFalling && (wasAbove || isAtPlatform) && horizontalOverlap;
    },

    /**
     * 从localStorage获取数据
     */
    getStorage(key, defaultValue) {
        try {
            const value = localStorage.getItem(key);
            return value !== null ? JSON.parse(value) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    /**
     * 保存数据到localStorage
     */
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    },

    /**
     * 生成十六进制颜色
     */
    randomColor() {
        const colors = ['#ff0044', '#00ff88', '#0088ff', '#ff8800', '#ffff00', '#ff00ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * 计算两点之间的距离
     */
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
