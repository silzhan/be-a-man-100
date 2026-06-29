/**
 * 画面管理器
 * 管理开始画面、暂停画面、结束画面等
 */
class ScreenManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 动画计时器
        this.titleBounce = 0;
        this.buttonPulse = 0;
    }

    /**
     * 渲染开始画面
     */
    renderMenu(bestFloor) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        this.titleBounce += 0.03;
        this.buttonPulse += 0.05;
        
        ctx.save();
        
        // 背景
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(1, '#1a1a4e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // 装饰粒子
        this._drawDecorativeParticles(ctx, width, height);
        
        // 标题
        const titleY = height * 0.3 + Math.sin(this.titleBounce) * 5;
        
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20;
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('是男人就下100层', width / 2, titleY);
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.fillText('🎮 经典H5重制版', width / 2, titleY + 35);
        
        // 开始按钮
        const buttonWidth = 180;
        const buttonHeight = 45;
        const buttonX = width / 2 - buttonWidth / 2;
        const buttonY = height * 0.5;
        
        const pulseScale = 1 + Math.sin(this.buttonPulse) * 0.03;
        
        ctx.save();
        ctx.translate(width / 2, buttonY + buttonHeight / 2);
        ctx.scale(pulseScale, pulseScale);
        ctx.translate(-width / 2, -(buttonY + buttonHeight / 2));
        
        // 按钮背景
        ctx.fillStyle = '#00cc66';
        ctx.shadowColor = '#00cc66';
        ctx.shadowBlur = 15;
        this._roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 8);
        ctx.fill();
        
        // 按钮文字
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('开始游戏', width / 2, buttonY + buttonHeight / 2 + 7);
        
        ctx.restore();
        
        // 最高分
        if (bestFloor > 0) {
            ctx.fillStyle = '#aaaaaa';
            ctx.font = '14px sans-serif';
            ctx.fillText(`🏆 历史最高: ${bestFloor} 层`, width / 2, height * 0.65);
        }
        
        // 操作说明
        ctx.fillStyle = '#666666';
        ctx.font = '12px sans-serif';
        ctx.fillText('← → 或 A D 移动', width / 2, height * 0.78);
        ctx.fillText('P / ESC 暂停', width / 2, height * 0.78 + 20);
        ctx.fillText('点击/触屏: 左半屏← 右半屏→', width / 2, height * 0.78 + 40);
        
        ctx.restore();
    }

    /**
     * 渲染暂停画面
     */
    renderPause() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        ctx.save();
        
        // 半透明遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, width, height);
        
        // 暂停标题
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⏸ 游戏暂停', width / 2, height * 0.35);
        
        // 按钮
        const buttons = [
            { text: '继续游戏', y: height * 0.48 },
            { text: '重新开始', y: height * 0.58 },
            { text: '返回主菜单', y: height * 0.68 }
        ];
        
        const buttonWidth = 160;
        const buttonHeight = 40;
        
        for (const button of buttons) {
            const buttonX = width / 2 - buttonWidth / 2;
            
            ctx.fillStyle = '#333333';
            this._roundRect(ctx, buttonX, button.y, buttonWidth, buttonHeight, 6);
            ctx.fill();
            
            ctx.strokeStyle = '#555555';
            ctx.lineWidth = 1;
            this._roundRect(ctx, buttonX, button.y, buttonWidth, buttonHeight, 6);
            ctx.stroke();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px sans-serif';
            ctx.fillText(button.text, width / 2, button.y + buttonHeight / 2 + 5);
        }
        
        ctx.restore();
    }

    /**
     * 游戏结束画面
     */
    renderGameOver(currentFloor, bestFloor, isNewRecord) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        this.buttonPulse += 0.05;
        
        ctx.save();
        
        // 半透明遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);
        
        // 游戏结束标题
        ctx.fillStyle = '#ff4444';
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💀 游戏结束', width / 2, height * 0.3);
        
        ctx.shadowBlur = 0;
        
        // 层数显示
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px sans-serif';
        ctx.fillText('你到达了', width / 2, height * 0.42);
        
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText(`${currentFloor}`, width / 2, height * 0.52);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px sans-serif';
        ctx.fillText('层', width / 2, height * 0.58);
        
        // 新纪录
        if (isNewRecord) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 18px sans-serif';
            ctx.fillText('🎉 新纪录！', width / 2, height * 0.65);
        }
        
        // 最高分
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '14px sans-serif';
        ctx.fillText(`🏆 最高: ${bestFloor} 层`, width / 2, height * 0.7);
        
        // 重新开始按钮
        const buttonWidth = 160;
        const buttonHeight = 45;
        const buttonX = width / 2 - buttonWidth / 2;
        const buttonY = height * 0.78;
        
        const pulseScale = 1 + Math.sin(this.buttonPulse) * 0.03;
        
        ctx.save();
        ctx.translate(width / 2, buttonY + buttonHeight / 2);
        ctx.scale(pulseScale, pulseScale);
        ctx.translate(-width / 2, -(buttonY + buttonHeight / 2));
        
        ctx.fillStyle = '#ff4444';
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 10;
        this._roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 8);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('再来一次', width / 2, buttonY + buttonHeight / 2 + 6);
        
        ctx.restore();
        ctx.restore();
    }

    /**
     * 通关画面
     */
    renderWin(floor) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        this.titleBounce += 0.05;
        this.buttonPulse += 0.08;
        
        ctx.save();
        
        // 渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1a0a2e');
        gradient.addColorStop(0.5, '#2a1a4e');
        gradient.addColorStop(1, '#1a0a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // 装饰粒子
        this._drawDecorativeParticles(ctx, width, height);
        
        // 恭喜标题
        const titleY = height * 0.25 + Math.sin(this.titleBounce) * 5;
        
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 20;
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 恭喜通关！', width / 2, titleY);
        
        ctx.shadowBlur = 0;
        
        // 层数显示
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.fillText('你成功到达了', width / 2, height * 0.4);
        
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 64px sans-serif';
        ctx.fillText(`${floor}`, width / 2, height * 0.53);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.fillText('层！', width / 2, height * 0.6);
        
        // 赞美文字
        ctx.fillStyle = '#ffaa00';
        ctx.font = '16px sans-serif';
        ctx.fillText('真正的男人！💪', width / 2, height * 0.68);
        
        // 返回按钮
        const buttonWidth = 160;
        const buttonHeight = 45;
        const buttonX = width / 2 - buttonWidth / 2;
        const buttonY = height * 0.8;
        
        const pulseScale = 1 + Math.sin(this.buttonPulse) * 0.05;
        
        ctx.save();
        ctx.translate(width / 2, buttonY + buttonHeight / 2);
        ctx.scale(pulseScale, pulseScale);
        ctx.translate(-width / 2, -(buttonY + buttonHeight / 2));
        
        ctx.fillStyle = '#00cc66';
        ctx.shadowColor = '#00cc66';
        ctx.shadowBlur = 15;
        this._roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 8);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('返回主菜单', width / 2, buttonY + buttonHeight / 2 + 6);
        
        ctx.restore();
        ctx.restore();
    }

    /**
     * 绘制装饰粒子
     */
    _drawDecorativeParticles(ctx, width, height) {
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(time + i * 0.5) * 0.5 + 0.5) * width;
            const y = (Math.cos(time * 0.7 + i * 0.3) * 0.5 + 0.5) * height;
            const size = 2 + Math.sin(time + i) * 1;
            const alpha = 0.1 + Math.sin(time * 0.5 + i) * 0.1;
            
            ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * 绘制圆角矩形
     */
    _roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}
