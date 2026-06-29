/**
 * HUD（抬头显示）
 * 显示游戏状态信息
 */
class HUD {
    constructor(canvasWidth) {
        this.canvasWidth = canvasWidth;
        this.height = 50;
        
        // 分数动画
        this.displayFloor = 0;
        this.targetFloor = 0;
        this.floorChangeFlash = 0;
    }

    /**
     * 更新HUD
     */
    update(currentFloor) {
        if (currentFloor > this.targetFloor) {
            this.targetFloor = currentFloor;
            this.floorChangeFlash = 10;
        }
        
        // 平滑更新显示的层数
        this.displayFloor = Math.round(Utils.lerp(this.displayFloor, this.targetFloor, 0.2));
        
        // 闪光效果
        if (this.floorChangeFlash > 0) {
            this.floorChangeFlash--;
        }
    }

    /**
     * 渲染HUD
     */
    render(ctx, currentFloor, bestFloor, canvasWidth, playerLife) {
        this.canvasWidth = canvasWidth;

        ctx.save();

        // 背景
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, this.height);

        // 层数显示
        const floorText = `层数: ${this.displayFloor}`;

        // 层数数字闪光效果
        if (this.floorChangeFlash > 0) {
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 10;
        }

        // 左侧：当前层数
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(floorText, 15, 30);

        // 重置阴影
        ctx.shadowBlur = 0;

        // 右侧：最高层数
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`🏆 ${bestFloor}`, canvasWidth - 15, 30);

        // 生命条（原版12格）
        if (playerLife !== undefined) {
            this._renderLifeBar(ctx, playerLife, canvasWidth);
        }

        // 进度条
        const progressBarWidth = canvasWidth - 30;
        const progressBarHeight = 3;
        const progressBarX = 15;
        const progressBarY = this.height - 8;
        const progress = Math.min(currentFloor / CONSTANTS.TARGET_FLOOR, 1);

        // 进度条背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

        // 进度条填充
        const progressGradient = ctx.createLinearGradient(progressBarX, 0, progressBarX + progressBarWidth * progress, 0);
        progressGradient.addColorStop(0, '#00ff88');
        progressGradient.addColorStop(1, '#00ffff');
        ctx.fillStyle = progressGradient;
        ctx.fillRect(progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight);

        ctx.restore();
    }

    /**
     * 渲染生命条
     */
    _renderLifeBar(ctx, life, canvasWidth) {
        const barWidth = 100;
        const barX = canvasWidth / 2 - barWidth / 2;
        const barY = 8;
        const barH = 8;
        const maxLife = CONSTANTS.PLAYER.MAX_LIFE;
        const lifeRatio = life / maxLife;

        // 背景
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barH + 2);

        // 血量
        const lifeColor = life <= 3 ? '#FF4444' : life <= 6 ? '#FFAA00' : '#FF6688';
        ctx.fillStyle = lifeColor;
        ctx.fillRect(barX, barY, barWidth * lifeRatio, barH);

        // 边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barH);

        // 数字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('❤️ ' + life + '/' + maxLife, canvasWidth / 2, barY + barH + 14);
    }

    /**
     * 重置HUD
     */
    reset() {
        this.displayFloor = 0;
        this.targetFloor = 0;
        this.floorChangeFlash = 0;
    }
}
