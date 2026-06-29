/**
 * 粒子特效系统
 * 管理游戏中的各种粒子效果
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.scorePopups = [];
    }

    /**
     * 更新所有粒子
     */
    update() {
        // 更新粒子
        this.particles = this.particles.filter(particle => {
            particle.life--;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity || 0;
            particle.size *= particle.decay || 0.98;
            return particle.life > 0 && particle.size > 0.5;
        });

        // 更新得分飘字
        this.scorePopups = this.scorePopups.filter(popup => {
            popup.life--;
            popup.y -= popup.riseSpeed;
            popup.alpha = popup.life / popup.maxLife;
            return popup.life > 0;
        });
    }

    /**
     * 生成平台碎裂粒子
     */
    emitPlatformBreak(x, y, color) {
        const config = CONSTANTS.PARTICLES.PLATFORM_BREAK;
        
        for (let i = 0; i < config.COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * config.SPEED + 1;
            
            this.particles.push({
                x: x + (Math.random() - 0.5) * 40,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: Math.random() * config.SIZE + 2,
                color: color,
                life: config.LIFE + Math.random() * 10,
                gravity: 0.1,
                decay: 0.96
            });
        }
    }

    /**
     * 生成传送特效粒子
     */
    emitTeleport(x, y) {
        const colors = ['#ffffff', '#00ffff', '#ffff00'];
        
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 30 + Math.random() * 20,
                gravity: -0.05,
                decay: 0.95
            });
        }
    }

    /**
     * 生成得分飘字
     */
    emitScorePopup(x, y, score) {
        this.scorePopups.push({
            x: x,
            y: y,
            text: `+${score}`,
            life: 60,
            maxLife: 60,
            riseSpeed: 1,
            alpha: 1,
            color: '#ffff00',
            size: 20
        });
    }

    /**
     * 生成死亡特效
     */
    emitDeath(x, y) {
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 6 + 3,
                color: '#ff0044',
                life: 40 + Math.random() * 20,
                gravity: 0.15,
                decay: 0.97
            });
        }
    }

    /**
     * 生成通关庆祝粒子
     */
    emitCelebration(canvasWidth, canvasHeight) {
        const colors = ['#ff0044', '#00ff88', '#0088ff', '#ffff00', '#ff00ff', '#ffffff'];
        
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * canvasWidth,
                y: canvasHeight + 10,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 8 - 5,
                size: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 100 + Math.random() * 50,
                gravity: 0.05,
                decay: 0.99
            });
        }
    }

    /**
     * 渲染所有粒子
     */
    render(ctx, camera) {
        // 渲染粒子
        for (const particle of this.particles) {
            const screenPos = camera.worldToScreen(particle.x, particle.y);
            
            ctx.save();
            ctx.globalAlpha = particle.life / 40;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 渲染得分飘字
        for (const popup of this.scorePopups) {
            const screenPos = camera.worldToScreen(popup.x, popup.y);
            
            ctx.save();
            ctx.globalAlpha = popup.alpha;
            ctx.fillStyle = popup.color;
            ctx.font = `bold ${popup.size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(popup.text, screenPos.x, screenPos.y);
            ctx.restore();
        }
    }

    /**
     * 清空所有粒子
     */
    clear() {
        this.particles = [];
        this.scorePopups = [];
    }
}
