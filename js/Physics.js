/**
 * 物理引擎
 * 处理碰撞检测和物理响应
 */
class Physics {
    constructor() {
        this.prevBounds = null;
    }

    /**
     * 保存角色上一帧碰撞箱
     */
    savePreviousPosition(player) {
        this.prevBounds = player.getBounds();
    }

    /**
     * 检测角色与平台的碰撞
     * 返回碰撞信息对象，无碰撞返回null
     */
    checkPlatformCollision(player, platforms) {
        if (!player.alive) return null;

        const playerBounds = player.getBounds();

        for (const platform of platforms) {
            if (!platform.active) continue;

            const platformBounds = platform.getBounds();

            // 检查是否落在平台上
            if (this._isLandingOnPlatform(playerBounds, platformBounds, player.vy)) {
                // 根据平台类型返回不同的碰撞结果
                switch (platform.type) {
                    case CONSTANTS.PLATFORM.TYPES.SPIKE:
                    case CONSTANTS.PLATFORM.TYPES.NAIL:
                        return {
                            type: 'hurt',
                            platform: platform
                        };

                    case CONSTANTS.PLATFORM.TYPES.BRITTLE:
                        return {
                            type: 'land',
                            platform: platform,
                            action: 'break'
                        };

                    case CONSTANTS.PLATFORM.TYPES.TELEPORT:
                        return {
                            type: 'teleport',
                            platform: platform
                        };

                    case CONSTANTS.PLATFORM.TYPES.LEFT:
                        return {
                            type: 'land',
                            platform: platform,
                            action: 'push_left'
                        };

                    case CONSTANTS.PLATFORM.TYPES.RIGHT:
                        return {
                            type: 'land',
                            platform: platform,
                            action: 'push_right'
                        };

                    case CONSTANTS.PLATFORM.TYPES.ROLL:
                    case CONSTANTS.PLATFORM.TYPES.SPRING:
                        return {
                            type: 'land',
                            platform: platform,
                            action: 'bounce'
                        };

                    default:
                        return {
                            type: 'land',
                            platform: platform
                        };
                }
            }
        }

        return null;
    }

    /**
     * 检测是否落在平台上（V2：直接 AABB 重叠 + 方向判定）
     *
     * 思路：检测两个条件是否同时成立——
     *   1. 当前帧玩家碰撞箱与平台碰撞箱有重叠（AABB）
     *   2. 上一帧玩家底部 ≤ 平台顶部 + 小容差（说明是从上方落下来的，不是从侧面/下面穿进来的）
     * 这个方法不依赖帧率，任何速度下都不会穿透。
     */
    _isLandingOnPlatform(playerBounds, platformBounds, playerVy) {
        // 必须在下落
        if (playerVy < 0) return false;

        // 没有上一帧数据则跳过（第一帧）
        if (!this.prevBounds) {
            this.prevBounds = playerBounds;
            return false;
        }

        // ---- 条件1：当前帧 AABB 重叠检测 ----
        // 水平重叠
        if (playerBounds.x + playerBounds.width <= platformBounds.x) return false;
        if (playerBounds.x >= platformBounds.x + platformBounds.width) return false;
        // 垂直重叠：玩家底部需要 ≥ 平台顶部（不能完全在平台上方）
        if (playerBounds.y + playerBounds.height <= platformBounds.y) return false;
        // 玩家顶部不能超过平台底部太多（防止从侧面穿过时误判）
        if (playerBounds.y >= platformBounds.y + platformBounds.height) return false;

        // ---- 条件2：上一帧从上方落下来 ----
        const prevBottom = this.prevBounds.y + this.prevBounds.height;
        // 上一帧的脚底不能低于平台顶部太多（最多8px，可覆盖帧率波动）
        if (prevBottom > platformBounds.y + 8) return false;

        return true;
    }

    /**
     * 检测角色是否掉出屏幕
     */
    isOutOfBounds(player, cameraY, canvasHeight) {
        const playerScreenY = player.y - cameraY;
        return playerScreenY > canvasHeight + 150;
    }

    /**
     * 检测角色与障碍物碰撞
     * 返回 { hit: true, damage: N, type: string } 或 false
     */
    checkObstacleCollision(player, obstacles) {
        if (!player.alive) return false;

        const pb = player.getBounds();

        for (const obs of obstacles) {
            if (!obs.active) continue;

            // 激光只在开启时碰撞
            if (obs.type === CONSTANTS.OBSTACLE_TYPES.LASER && !obs.laserOn) continue;

            // 倒塌墙未显示时不碰撞
            if (obs.type === CONSTANTS.OBSTACLE_TYPES.FALLING_WALL && !obs.shadowShown) continue;

            const ob = obs.getBounds();

            // AABB碰撞
            if (pb.x < ob.x + ob.width &&
                pb.x + pb.width > ob.x &&
                pb.y < ob.y + ob.height &&
                pb.y + pb.height > ob.y) {
                // 不同障碍物不同伤害
                let damage = 1;
                switch (obs.type) {
                    case CONSTANTS.OBSTACLE_TYPES.CRUSHER:
                    case CONSTANTS.OBSTACLE_TYPES.FALLING_WALL:
                        damage = 3; // 压板和倒塌墙扣3血
                        break;
                    case CONSTANTS.OBSTACLE_TYPES.LASER:
                    case CONSTANTS.OBSTACLE_TYPES.GEAR:
                        damage = 2; // 激光和齿轮扣2血
                        break;
                    default:
                        damage = 1;
                }
                return { hit: true, damage: damage, type: obs.type };
            }

            // 风扇气流区域（不致死，但施加额外下落速度）
            if (obs.type === CONSTANTS.OBSTACLE_TYPES.FAN) {
                const wz = obs.getWindZone();
                if (pb.x < wz.x + wz.width &&
                    pb.x + pb.width > wz.x &&
                    pb.y < wz.y + wz.height &&
                    pb.y + pb.height > wz.y) {
                    // 返回风扇效果标记
                    return { type: 'wind', direction: obs.windDirection };
                }
            }
        }

        return false;
    }

    /**
     * 处理平台碰撞响应
     */
    handleCollision(player, collision, particleSystem, soundManager) {
        if (!collision) return null;

        switch (collision.type) {
            case 'hurt':
                // 钉子/尖刺：扣血 + 弹起（防止穿模）
                player.y = collision.platform.y - player.height;
                player.jump(CONSTANTS.PHYSICS.JUMP_VELOCITY);
                player.hurt();
                if (soundManager) soundManager.playHit();
                return player.alive ? 'hurt' : 'death';

            case 'land':
                // 踩在平台上
                const platform = collision.platform;
                player.y = platform.y - player.height;

                // 根据动作类型处理
                switch (collision.action) {
                    case 'break':
                        player.jump(CONSTANTS.PHYSICS.JUMP_VELOCITY);
                        platform.startBreaking();
                        if (particleSystem) {
                            particleSystem.emitPlatformBreak(
                                platform.x + platform.width / 2,
                                platform.y,
                                platform.color
                            );
                        }
                        if (soundManager) soundManager.playBreak();
                        break;

                    case 'push_left':
                        player.jump(CONSTANTS.PHYSICS.JUMP_VELOCITY);
                        player.xForce = -CONSTANTS.PLAYER.PUSH_FORCE;
                        if (soundManager) soundManager.playJump();
                        break;

                    case 'push_right':
                        player.jump(CONSTANTS.PHYSICS.JUMP_VELOCITY);
                        player.xForce = CONSTANTS.PLAYER.PUSH_FORCE;
                        if (soundManager) soundManager.playJump();
                        break;

                    case 'bounce':
                        // 弹跳：更高的反弹
                        player.jump(CONSTANTS.PHYSICS.JUMP_VELOCITY * 1.5);
                        if (soundManager) soundManager.playJump();
                        break;

                    default:
                        player.jump(CONSTANTS.PHYSICS.JUMP_VELOCITY);
                        if (soundManager) soundManager.playJump();
                        break;
                }

                return 'landed';

            case 'teleport':
                // 传送
                const teleportY = collision.platform.y - CONSTANTS.PLATFORM.TELEPORT.TELEPORT_DISTANCE;
                player.teleport(
                    collision.platform.x + collision.platform.width / 2,
                    teleportY
                );
                if (particleSystem) {
                    particleSystem.emitTeleport(
                        collision.platform.x + collision.platform.width / 2,
                        collision.platform.y
                    );
                }
                if (soundManager) soundManager.playTeleport();
                return 'teleported';

            default:
                return null;
        }
    }
}
