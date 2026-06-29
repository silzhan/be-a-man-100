/**
 * 游戏入口
 * 初始化并启动游戏
 */
(function() {
    'use strict';

    // 等待DOM加载完成
    window.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('gameCanvas');

        if (!canvas) {
            console.error('Canvas element not found!');
            return;
        }

        // 创建并启动游戏
        const game = new Game(canvas);
        game.start();

        // 防止移动端双击缩放
        document.addEventListener('dblclick', (e) => e.preventDefault());

        // 防止页面滚动
        document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

        console.log('🎮 是男人就下100层 - 游戏已启动');
    });
})();
