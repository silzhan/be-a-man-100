/**
 * 游戏常量配置
 * 按需求文档 v2 对齐
 */
const CONSTANTS = {
    // 画布相关
    CANVAS: {
        DESIGN_WIDTH: 480,
        DESIGN_HEIGHT: 720,
        BACKGROUND_COLOR: '#0a0a2a'
    },

    // 物理相关
    PHYSICS: {
        GRAVITY: 0.4,           // 重力加速度 (px/帧²)
        JUMP_VELOCITY: -6,      // 踩平台反弹速度 (向上为负)
        MOVE_SPEED: 4,          // 水平移动速度 (px/帧)
        MAX_FALL_SPEED: 12,     // 最大下落速度
        FRICTION: 0.9           // 摩擦系数
    },

    // 角色相关 (火柴人风格)
    PLAYER: {
        WIDTH: 20,              // 整体宽度（手臂最左到最右）
        HEIGHT: 28,             // 整体高度（头顶部到脚底）
        COLLISION_WIDTH: 12,    // 碰撞箱宽
        COLLISION_HEIGHT: 22,   // 碰撞箱高
        HEAD_RADIUS: 6,         // 头半径 (直径12px)
        BODY_LENGTH: 8,         // 躯干长度
        ARM_LENGTH: 6,          // 手臂长度
        LEG_LENGTH: 6,          // 腿长度
        COLOR: '#FFFFFF',       // 描边颜色（白色）
        START_X: 240,           // 起始X位置
        START_Y: 100,           // 起始Y位置
        MAX_LIFE: 12,           // 最大生命值（原版12条命）
        PUSH_FORCE: 0.12        // 左右推力
    },

    // 平台相关
    PLATFORM: {
        HEIGHT: 12,             // 统一厚度 12px
        TYPES: {
            NORMAL: 'normal',
            MOVING: 'moving',
            BRITTLE: 'brittle',
            TELEPORT: 'teleport',
            SPIKE: 'spike',
            LEFT: 'left',       // 向左推
            RIGHT: 'right',     // 向右推
            NAIL: 'nail',       // 钉子（扣血）
            ROLL: 'roll',       // 滚动/弹跳
            SPRING: 'spring'    // 弹簧
        },
        COLORS: {
            normal: '#44CC44',
            moving: '#4488FF',
            brittle: '#FF8800',
            teleport: '#FFFFFF',
            spike: '#FF3333',
            left: '#FF88FF',    // 粉紫色
            right: '#88FFFF',   // 青色
            nail: '#FF4444',    // 红色
            roll: '#FFAA00',    // 橙黄色
            spring: '#00FF88'   // 亮绿色
        },
        // 平台宽度范围 [min, max]
        WIDTH_RANGES: {
            normal: [48, 72],
            moving: [48, 60],
            brittle: [40, 56],
            teleport: [32, 32],
            spike: [48, 72]
        },
        // 移动平台参数
        MOVING: {
            MIN_SPEED: 0.5,
            VERTICAL_CHANCE: 0.2
        },
        // 脆性平台参数
        BRITTLE: {
            BREAK_FRAMES: [90, 60, 45, 30], // 按难度阶段：碎裂倒计时（帧）
            SHAKE_INTENSITY: 3
        },
        // 传送平台参数
        TELEPORT: {
            TELEPORT_DISTANCE: 150
        }
    },

    // 障碍物类型
    OBSTACLE_TYPES: {
        MOVING_BARRIER: 'movingBarrier',
        GEAR: 'gear',
        FAN: 'fan',
        LASER: 'laser',
        CRUSHER: 'crusher',
        FLYING_ENEMY: 'flyingEnemy',
        FALLING_WALL: 'fallingWall'
    },

    // 障碍物颜色
    OBSTACLE_COLORS: {
        movingBarrier: '#993322',
        gear: '#FF6600',
        fan: '#66CCFF',
        laser: '#FF0066',
        crusher: '#555555',
        flyingEnemy: '#9933FF',
        fallingWall: '#666666'
    },

    // 难度相关
    DIFFICULTY: {
        LEVEL_HEIGHT: 72,
        STAGES: [
            { // 1-20层
                minFloor: 1,
                maxFloor: 20,
                platformGap: [50, 60],
                platformWidthRange: [240, 360],
                normalChance: 0.25,
                leftChance: 0.10,
                rightChance: 0.10,
                rollChance: 0.08,
                springChance: 0.07,
                nailChance: 0.25,
                movingChance: 0.05,
                brittleChance: 0,
                spikeChance: 0.10,
                teleportChance: 0,
                movingSpeed: 0.6,
                brittleBreakFrames: 90,
                obsMovingBarrier: 0.10,
                obsGear: 0.05,
                obsFan: 0.05,
                obsLaser: 0,
                obsCrusher: 0,
                obsFlyingEnemy: 0.15,
                obsFallingWall: 0
            },
            { // 21-40层
                minFloor: 21,
                maxFloor: 40,
                platformGap: [52, 64],
                platformWidthRange: [220, 340],
                normalChance: 0.15,
                leftChance: 0.08,
                rightChance: 0.08,
                rollChance: 0.05,
                springChance: 0.05,
                nailChance: 0.30,
                movingChance: 0.07,
                brittleChance: 0.04,
                spikeChance: 0.12,
                teleportChance: 0.01,
                movingSpeed: 0.9,
                brittleBreakFrames: 60,
                obsMovingBarrier: 0.20,
                obsGear: 0.15,
                obsFan: 0.10,
                obsLaser: 0.05,
                obsCrusher: 0.05,
                obsFlyingEnemy: 0.20,
                obsFallingWall: 0
            },
            { // 41-60层
                minFloor: 41,
                maxFloor: 60,
                platformGap: [55, 68],
                platformWidthRange: [200, 320],
                normalChance: 0.10,
                leftChance: 0.06,
                rightChance: 0.06,
                rollChance: 0.04,
                springChance: 0.04,
                nailChance: 0.32,
                movingChance: 0.08,
                brittleChance: 0.05,
                spikeChance: 0.18,
                teleportChance: 0.02,
                movingSpeed: 1.2,
                brittleBreakFrames: 45,
                obsMovingBarrier: 0.30,
                obsGear: 0.20,
                obsFan: 0.18,
                obsLaser: 0.12,
                obsCrusher: 0.12,
                obsFlyingEnemy: 0.25,
                obsFallingWall: 0
            },
            { // 61-80层
                minFloor: 61,
                maxFloor: 80,
                platformGap: [58, 72],
                platformWidthRange: [180, 300],
                normalChance: 0.08,
                leftChance: 0.05,
                rightChance: 0.05,
                rollChance: 0.03,
                springChance: 0.03,
                nailChance: 0.32,
                movingChance: 0.08,
                brittleChance: 0.05,
                spikeChance: 0.22,
                teleportChance: 0.02,
                movingSpeed: 1.5,
                brittleBreakFrames: 30,
                obsMovingBarrier: 0.35,
                obsGear: 0.25,
                obsFan: 0.22,
                obsLaser: 0.18,
                obsCrusher: 0.18,
                obsFlyingEnemy: 0.30,
                obsFallingWall: 0.10
            },
            { // 81-100层
                minFloor: 81,
                maxFloor: 100,
                platformGap: [60, 76],
                platformWidthRange: [160, 280],
                normalChance: 0.05,
                leftChance: 0.04,
                rightChance: 0.04,
                rollChance: 0.02,
                springChance: 0.02,
                nailChance: 0.32,
                movingChance: 0.08,
                brittleChance: 0.05,
                spikeChance: 0.25,
                teleportChance: 0.03,
                movingSpeed: 1.8,
                brittleBreakFrames: 25,
                obsMovingBarrier: 0.40,
                obsGear: 0.30,
                obsFan: 0.25,
                obsLaser: 0.22,
                obsCrusher: 0.22,
                obsFlyingEnemy: 0.35,
                obsFallingWall: 0.25
            }
        ]
    },

    // 摄像机相关
    CAMERA: {
        FOLLOW_THRESHOLD: 0.4,
        SMOOTH_FACTOR: 0.1
    },

    // 粒子特效相关
    PARTICLES: {
        PLATFORM_BREAK: {
            COUNT: 15,
            SPEED: 3,
            LIFE: 30,
            SIZE: 4
        },
        SCORE_POPUP: {
            DURATION: 60,
            RISE_SPEED: 1
        }
    },

    // 游戏状态
    GAME_STATES: {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameOver',
        WIN: 'win'
    },

    // 存储键名
    STORAGE: {
        BEST_SCORE: 'bestScore',
        SOUND_ENABLED: 'soundEnabled'
    },

    // 目标层数
    TARGET_FLOOR: 100
};
