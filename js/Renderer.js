/**
 * 渲染器
 * 火柴人角色 + 障碍物 + 霓虹平台
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this._updateBackgroundGradient();

        this.stars = [];
        for (let i = 0; i < 40; i++) {
            this.stars.push({
                x: Math.random() * 500,
                y: Math.random() * 3000,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }

    _updateBackgroundGradient() {
        this.bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        this.bgGradient.addColorStop(0, '#0a0a2a');
        this.bgGradient.addColorStop(1, '#1a1a3a');
    }

    clear() {
        this.ctx.fillStyle = this.bgGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    renderBackground(camera) {
        const ctx = this.ctx;
        for (const star of this.stars) {
            const sy = ((star.y - camera.y * 0.15) % (this.height + 50)) - 25;
            ctx.fillStyle = `rgba(255,255,255,${star.alpha + Math.sin(Date.now() * 0.002 + star.x) * 0.1})`;
            ctx.beginPath();
            ctx.arc(star.x % this.width, sy, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ==================== 火柴人角色 ====================

    renderPlayer(player, camera) {
        if (!player.alive && player.deathParticles.length === 0) return;

        const ctx = this.ctx;
        const pos = camera.worldToScreen(player.x, player.y);
        const cx = pos.x + player.width / 2;
        const bottom = pos.y + player.height;

        ctx.save();

        // 死亡：渲染碎裂粒子
        if (!player.alive) {
            this._renderDeathParticles(ctx, player, camera);
            ctx.restore();
            return;
        }

        // 挤压拉伸
        ctx.translate(cx, bottom);
        ctx.scale(player.squash, player.stretch);
        ctx.translate(-cx, -bottom);

        // 身体微摆
        const sway = player.bodySway || 0;
        ctx.translate(cx, bottom);
        ctx.rotate(sway);
        ctx.translate(-cx, -bottom);

        const headR = CONSTANTS.PLAYER.HEAD_RADIUS;
        const headY = pos.y + headR;
        const bodyTop = headY + headR;
        const bodyBottom = bodyTop + CONSTANTS.PLAYER.BODY_LENGTH;
        const armAngle = player.armAngle || 0;
        const legAngle = player.legAngle || 0;
        const f = player.facing;

        // 受伤闪烁效果
        if (player.isHurt && player.hurtTimer % 6 < 3) {
            ctx.strokeStyle = '#FF4444';
        } else {
            ctx.strokeStyle = CONSTANTS.PLAYER.COLOR;
        }
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 影子
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.ellipse(cx, bottom + 2, 8, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 腿
        const legSpread = 3;
        ctx.save();
        ctx.translate(cx - legSpread, bodyBottom);
        ctx.rotate(legAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, CONSTANTS.PLAYER.LEG_LENGTH);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(cx + legSpread, bodyBottom);
        ctx.rotate(-legAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, CONSTANTS.PLAYER.LEG_LENGTH);
        ctx.stroke();
        ctx.restore();

        // 躯干
        ctx.beginPath();
        ctx.moveTo(cx, bodyTop);
        ctx.lineTo(cx, bodyBottom);
        ctx.stroke();

        // 手臂
        ctx.save();
        ctx.translate(cx, bodyTop + 2);
        ctx.rotate(-Math.PI / 6 + armAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-CONSTANTS.PLAYER.ARM_LENGTH, CONSTANTS.PLAYER.ARM_LENGTH);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(cx, bodyTop + 2);
        ctx.rotate(Math.PI / 6 - armAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(CONSTANTS.PLAYER.ARM_LENGTH, CONSTANTS.PLAYER.ARM_LENGTH);
        ctx.stroke();
        ctx.restore();

        // 头
        ctx.beginPath();
        ctx.arc(cx, headY, headR, 0, Math.PI * 2);
        ctx.stroke();
        // 头部填充（半透明白）
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fill();

        ctx.restore();
    }

    _renderDeathParticles(ctx, player, camera) {
        for (const p of player.deathParticles) {
            const sp = camera.worldToScreen(p.x, p.y);
            const alpha = p.life / 60;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.fillRect(sp.x - p.size / 2, sp.y - p.size / 2, p.size, p.size);
        }
    }

    // ==================== 平台 ====================

    renderPlatform(platform, camera) {
        if (!platform.visible) return;
        const ctx = this.ctx;
        const pos = camera.worldToScreen(platform.x + platform.shakeOffset, platform.y);

        ctx.save();
        switch (platform.type) {
            case CONSTANTS.PLATFORM.TYPES.NORMAL:
                this._drawNormalPlatform(ctx, pos, platform);
                break;
            case CONSTANTS.PLATFORM.TYPES.MOVING:
                this._drawMovingPlatform(ctx, pos, platform);
                break;
            case CONSTANTS.PLATFORM.TYPES.BRITTLE:
                this._drawBrittlePlatform(ctx, pos, platform);
                break;
            case CONSTANTS.PLATFORM.TYPES.TELEPORT:
                this._drawTeleportPlatform(ctx, pos, platform);
                break;
            case CONSTANTS.PLATFORM.TYPES.SPIKE:
                this._drawSpikePlatform(ctx, pos, platform);
                break;
            case CONSTANTS.PLATFORM.TYPES.LEFT:
                this._drawDirectionPlatform(ctx, pos, platform, '←');
                break;
            case CONSTANTS.PLATFORM.TYPES.RIGHT:
                this._drawDirectionPlatform(ctx, pos, platform, '→');
                break;
            case CONSTANTS.PLATFORM.TYPES.NAIL:
                this._drawNailPlatform(ctx, pos, platform);
                break;
            case CONSTANTS.PLATFORM.TYPES.ROLL:
                this._drawRollPlatform(ctx, pos, platform);
                break;
            case CONSTANTS.PLATFORM.TYPES.SPRING:
                this._drawSpringPlatform(ctx, pos, platform);
                break;
        }
        ctx.restore();
    }

    _drawNormalPlatform(ctx, pos, p) {
        // 绿色平台
        ctx.fillStyle = '#44CC44';
        ctx.shadowColor = '#44CC44';
        ctx.shadowBlur = 4;
        ctx.fillRect(pos.x, pos.y, p.width, p.height);
        ctx.shadowBlur = 0;
        // 高光
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(pos.x, pos.y, p.width, p.height / 3);
    }

    _drawMovingPlatform(ctx, pos, p) {
        ctx.fillStyle = '#4488FF';
        ctx.shadowColor = '#4488FF';
        ctx.shadowBlur = 6;
        ctx.fillRect(pos.x, pos.y, p.width, p.height);
        ctx.shadowBlur = 0;
        // 方向指示
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        const ax = p.moveDirection > 0 ? pos.x + p.width - 6 : pos.x + 2;
        ctx.beginPath();
        ctx.moveTo(ax, pos.y + p.height / 2);
        ctx.lineTo(ax + 4 * p.moveDirection, pos.y + p.height / 2 - 3);
        ctx.lineTo(ax + 4 * p.moveDirection, pos.y + p.height / 2 + 3);
        ctx.closePath();
        ctx.fill();
    }

    _drawBrittlePlatform(ctx, pos, p) {
        const alpha = p.breaking ? (1 - p.breakTimer / p.breakFrames) : 1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FF8800';
        ctx.shadowColor = '#FF8800';
        ctx.shadowBlur = 4;
        ctx.fillRect(pos.x, pos.y, p.width, p.height);
        ctx.shadowBlur = 0;
        // 裂纹
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(pos.x + p.width * 0.3, pos.y);
        ctx.lineTo(pos.x + p.width * 0.35, pos.y + p.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x + p.width * 0.7, pos.y);
        ctx.lineTo(pos.x + p.width * 0.65, pos.y + p.height);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    _drawTeleportPlatform(ctx, pos, p) {
        const glow = p.glowIntensity;
        ctx.fillStyle = `rgba(255,255,255,${0.5 + glow * 0.5})`;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12 * glow;
        ctx.fillRect(pos.x, pos.y, p.width, p.height);
        ctx.shadowBlur = 0;
        // 上升箭头
        ctx.fillStyle = `rgba(0,255,255,${0.4 + glow * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(pos.x + p.width / 2, pos.y - 3);
        ctx.lineTo(pos.x + p.width / 2 - 3, pos.y + 2);
        ctx.lineTo(pos.x + p.width / 2 + 3, pos.y + 2);
        ctx.closePath();
        ctx.fill();
    }

    _drawSpikePlatform(ctx, pos, p) {
        // 底座
        ctx.fillStyle = '#555';
        ctx.fillRect(pos.x, pos.y + p.height - 4, p.width, 4);
        // 尖刺
        const count = Math.floor(p.width / 10);
        const sw = p.width / count;
        ctx.fillStyle = '#FF3333';
        ctx.shadowColor = '#FF3333';
        ctx.shadowBlur = 6;
        for (let i = 0; i < count; i++) {
            ctx.beginPath();
            ctx.moveTo(pos.x + i * sw, pos.y + p.height - 3);
            ctx.lineTo(pos.x + i * sw + sw / 2, pos.y);
            ctx.lineTo(pos.x + (i + 1) * sw, pos.y + p.height - 3);
            ctx.closePath();
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    // 左右推力平台
    _drawDirectionPlatform(ctx, pos, p, arrow) {
        const color = p.type === CONSTANTS.PLATFORM.TYPES.LEFT ? '#FF88FF' : '#88FFFF';
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        ctx.fillRect(pos.x, pos.y, p.width, p.height);
        ctx.shadowBlur = 0;
        // 箭头
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(arrow, pos.x + p.width / 2, pos.y + p.height - 2);
    }

    // 钉子平台（扣血）
    _drawNailPlatform(ctx, pos, p) {
        ctx.fillStyle = '#555';
        ctx.fillRect(pos.x, pos.y + p.height - 4, p.width, 4);
        // 钉子（短粗三角）
        const count = Math.floor(p.width / 8);
        const nw = p.width / count;
        ctx.fillStyle = '#FF4444';
        ctx.shadowColor = '#FF4444';
        ctx.shadowBlur = 4;
        for (let i = 0; i < count; i++) {
            ctx.beginPath();
            ctx.moveTo(pos.x + i * nw, pos.y + p.height - 3);
            ctx.lineTo(pos.x + i * nw + nw / 2, pos.y + 3);
            ctx.lineTo(pos.x + (i + 1) * nw, pos.y + p.height - 3);
            ctx.closePath();
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    // 滚动/弹跳平台
    _drawRollPlatform(ctx, pos, p) {
        ctx.fillStyle = '#FFAA00';
        ctx.shadowColor = '#FFAA00';
        ctx.shadowBlur = 4;
        ctx.fillRect(pos.x, pos.y, p.width, p.height);
        ctx.shadowBlur = 0;
        // 滚动纹理
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        for (let rx = pos.x + 5; rx < pos.x + p.width; rx += 8) {
            ctx.beginPath();
            ctx.arc(rx, pos.y + p.height / 2, 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // 弹簧平台
    _drawSpringPlatform(ctx, pos, p) {
        // 底座
        ctx.fillStyle = '#00FF88';
        ctx.shadowColor = '#00FF88';
        ctx.shadowBlur = 6;
        ctx.fillRect(pos.x, pos.y + 4, p.width, p.height - 4);
        ctx.shadowBlur = 0;
        // 弹簧线圈
        ctx.strokeStyle = '#00CC66';
        ctx.lineWidth = 2;
        const coils = 3;
        for (let i = 0; i < coils; i++) {
            const cx = pos.x + p.width * (i + 0.5) / coils;
            ctx.beginPath();
            ctx.arc(cx, pos.y + 2, 4, 0, Math.PI);
            ctx.stroke();
        }
    }

    // ==================== 障碍物 ====================

    renderObstacle(obstacle, camera) {
        if (!obstacle.active) return;
        const ctx = this.ctx;
        const pos = camera.worldToScreen(obstacle.x, obstacle.y);

        ctx.save();
        switch (obstacle.type) {
            case CONSTANTS.OBSTACLE_TYPES.MOVING_BARRIER:
                this._drawMovingBarrier(ctx, pos, obstacle);
                break;
            case CONSTANTS.OBSTACLE_TYPES.GEAR:
                this._drawGear(ctx, pos, obstacle);
                break;
            case CONSTANTS.OBSTACLE_TYPES.FAN:
                this._drawFan(ctx, pos, obstacle);
                break;
            case CONSTANTS.OBSTACLE_TYPES.LASER:
                this._drawLaser(ctx, pos, obstacle, camera);
                break;
            case CONSTANTS.OBSTACLE_TYPES.CRUSHER:
                this._drawCrusher(ctx, pos, obstacle);
                break;
            case CONSTANTS.OBSTACLE_TYPES.FLYING_ENEMY:
                this._drawFlyingEnemy(ctx, pos, obstacle);
                break;
            case CONSTANTS.OBSTACLE_TYPES.FALLING_WALL:
                this._drawFallingWall(ctx, pos, obstacle, camera);
                break;
        }
        ctx.restore();
    }

    // 移动障碍：暗红色方块 + 红色光晕
    _drawMovingBarrier(ctx, pos, o) {
        ctx.fillStyle = 'rgba(255,50,50,0.15)';
        ctx.beginPath();
        ctx.arc(pos.x + 10, pos.y + 10, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#993322';
        ctx.fillRect(pos.x, pos.y, 20, 20);
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 1;
        ctx.strokeRect(pos.x, pos.y, 20, 20);
    }

    // 旋转齿轮：橙色带齿
    _drawGear(ctx, pos, o) {
        const cx = pos.x + 12, cy = pos.y + 12;
        const r = 10;
        const teeth = 5;

        ctx.translate(cx, cy);
        ctx.rotate(o.rotation);

        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        for (let i = 0; i < teeth; i++) {
            const a1 = (i / teeth) * Math.PI * 2;
            const a2 = ((i + 0.5) / teeth) * Math.PI * 2;
            ctx.lineTo(Math.cos(a1) * (r + 4), Math.sin(a1) * (r + 4));
            ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
            ctx.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
            ctx.lineTo(Math.cos(a2) * (r + 4), Math.sin(a2) * (r + 4));
        }
        ctx.closePath();
        ctx.fill();

        // 中心圆
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // 风扇：矩形 + 旋转叶片 + 气流粒子
    _drawFan(ctx, pos, o) {
        // 外壳
        ctx.fillStyle = '#66CCFF';
        ctx.fillRect(pos.x, pos.y, 30, 12);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(pos.x, pos.y, 30, 12);

        // 叶片（2帧动画）
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        const frame = o.fanBladeFrame;
        for (let i = 0; i < 3; i++) {
            const bx = pos.x + 5 + i * 10;
            const offset = (frame % 2 === 0) ? 0 : 3;
            ctx.fillRect(bx + offset, pos.y + 2, 4, 8);
        }

        // 气流粒子
        ctx.fillStyle = 'rgba(200,230,255,0.3)';
        for (let i = 0; i < 5; i++) {
            const px = pos.x + 3 + i * 6;
            const py = pos.y + 14 + ((Date.now() * 0.02 + i * 15) % 60);
            ctx.fillRect(px, py, 2, 4);
        }
    }

    // 激光：红色光束，开关+预警闪烁
    _drawLaser(ctx, pos, o, camera) {
        if (!o.laserOn && !o.laserWarning) return;

        const alpha = o.laserWarning ? (Math.sin(Date.now() * 0.02) * 0.3 + 0.3) : 0.8;
        const beamWidth = o.canvasWidth || this.width;
        ctx.fillStyle = `rgba(255,0,102,${alpha})`;
        ctx.shadowColor = '#FF0066';
        ctx.shadowBlur = o.laserOn ? 10 : 4;
        ctx.fillRect(0, pos.y, beamWidth, 4);
        ctx.shadowBlur = 0;

        // 发射器两端
        ctx.fillStyle = '#555';
        ctx.fillRect(0, pos.y - 3, 12, 10);
        ctx.fillRect(beamWidth - 12, pos.y - 3, 12, 10);
    }

    // 压板：深灰色方块 + 连接杆
    _drawCrusher(ctx, pos, o) {
        // 连接杆到顶部
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pos.x + 20, pos.y);
        ctx.lineTo(pos.x + 20, pos.y - 100);
        ctx.stroke();

        // 压板本体
        ctx.fillStyle = '#555555';
        ctx.fillRect(pos.x, pos.y, 40, 16);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.strokeRect(pos.x, pos.y, 40, 16);

        // 危险标记
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(pos.x + 5, pos.y + 6, 30, 4);
    }

    // 飞行敌人：紫色蝙蝠（翅膀扇动）
    _drawFlyingEnemy(ctx, pos, o) {
        const cx = pos.x + 8, cy = pos.y + 8;
        const wingFlap = Math.sin(o.flyTimer * 8) * 0.4;

        // 身体
        ctx.fillStyle = '#9933FF';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();

        // 翅膀
        ctx.fillStyle = '#7722CC';
        ctx.save();
        ctx.translate(cx - 5, cy - 2);
        ctx.rotate(-wingFlap);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-8, -4);
        ctx.lineTo(-4, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(cx + 5, cy - 2);
        ctx.rotate(wingFlap);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(8, -4);
        ctx.lineTo(4, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 眼睛
        ctx.fillStyle = '#ff0';
        ctx.fillRect(cx - 3, cy - 2, 2, 2);
        ctx.fillRect(cx + 1, cy - 2, 2, 2);
    }

    // 倒塌墙：灰色砖块 + 阴影预警
    _drawFallingWall(ctx, pos, o, camera) {
        if (!o.shadowShown) {
            // 阴影预警
            const shadowPos = camera.worldToScreen(o.x, o.startY + 600);
            ctx.fillStyle = `rgba(255,0,0,${0.1 + Math.sin(Date.now() * 0.01) * 0.05})`;
            ctx.fillRect(shadowPos.x, shadowPos.y - 5, o.width, 20);
            return;
        }

        // 砖块
        ctx.fillStyle = '#666666';
        ctx.fillRect(pos.x, pos.y, o.width, o.height);
        // 砖缝
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 0.5;
        for (let bx = pos.x + 15; bx < pos.x + o.width; bx += 15) {
            ctx.beginPath();
            ctx.moveTo(bx, pos.y);
            ctx.lineTo(bx, pos.y + o.height);
            ctx.stroke();
        }
    }

    // ==================== 虚拟按钮 ====================

    renderVirtualButtons(input) {
        if (!input.touch.active) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = 0.15;
        if (input.touch.left) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, this.width / 2, this.height);
        } else if (input.touch.right) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.width / 2, 0, this.width / 2, this.height);
        }
        ctx.restore();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this._updateBackgroundGradient();
    }
}
