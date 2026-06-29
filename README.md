# 是男人就下100层 🏗️

> Canvas 2D 平台跳跃原生 H5 小游戏重制版  
> 纯前端，零依赖，打开即玩

![preview](https://img.shields.io/badge/status-active-brightgreen)
![platform](https://img.shields.io/badge/platform-mobile%20%7C%20desktop-blue)

---

## 🎮 试玩

👉 **[https://silzhan.github.io/be-a-man-100](https://silzhan.github.io/be-a-man-100)**

---

## 📖 玩法说明

玩家控制火柴人从高处不断向下跳跃，**每经过一个平台计一层**，目标是到达第 **100 层**。

- **键盘**：←/→ 移动，↑/空格/点击 跳跃
- **触屏**：点击屏幕左侧/右侧 移动，上滑或双击 跳跃
- 踩上普通平台安全着陆，踩上尖刺/钉子平台会**扣血 + 弹开**
- 路上会遇到激光、齿轮、压板、倒塌墙等障碍物
- 血量归零则游戏结束
- 到达 100 层即为通关 🎉

---

## 🧩 平台类型（10种）

| 类型 | 说明 |
|------|------|
| 🟩 普通 | 绿色，基本落脚点 |
| 🔵 移动 | 蓝色，左右周期性平移 |
| 🟫 脆裂 | 棕色，踩一次后碎裂消失 |
| 🟣 传送 | 紫色，踩到传送到屏幕最高平台 |
| ⚡ 加速 | 黄色带电，踩到会垂直弹跳 |
| 🔴 尖刺 | 红刺，扣血 + 弹开 |
| ⚫ 钉子 | 黑刺，同尖刺 |
| ⬜ 弹簧 | 白色，踩到高弹跳 |
| 🌀 滚轮 | 踩到倾斜，推动角色水平移动 |
| ⏪ 倒带 | 绿色旋转，踩到回到上方 |

## ⚠️ 障碍物（7种）

| 类型 | 说明 |
|------|------|
| 🔦 激光 | 左右交替开关，碰触扣 2 血 |
| ⚙️ 齿轮 | 旋转，碰触扣 2 血 |
| 🗜️ 压板 | 上下往复，压中扣 3 血 |
| 🧱 倒塌墙 | 掉落预警后砸下，扣 3 血 |
| 🔩 固定钉子 | 平台上固定尖刺 |
| ⛓️ 摇摆链球 | 弧形摆动，碰触扣 1 血 |
| 🪙 金币 | 加分 |

---

## 🏗️ 技术栈

- **渲染**：Canvas 2D
- **动画**：requestAnimationFrame
- **碰撞**：AABB 连续碰撞检测
- **自适应**：移动端/桌面端响应式缩放
- **依赖**：零外部依赖

```
├── index.html           入口
├── css/
│   └── style.css        样式
├── js/
│   ├── main.js          启动入口
│   ├── Game.js          游戏主循环 & 状态机
│   ├── Player.js        玩家（火柴人）
│   ├── Physics.js       碰撞检测
│   ├── PlatformManager.js  平台生成 & 难度递增
│   ├── Platform.js      平台实体
│   ├── Obstacle.js      障碍物实体
│   ├── Camera.js        摄像机跟随
│   ├── Renderer.js      Canvas 绘制
│   ├── InputManager.js  输入处理（键盘 + 触屏）
│   ├── HUD.js           HUD 信息显示
│   ├── ScreenManager.js 菜单/结算/结束界面
│   ├── ParticleSystem.js 粒子效果
│   ├── SoundManager.js  音效管理（Web Audio）
│   └── Constants.js     全局常量 & 难度配置
└── assets/              资源文件
```

---

## 🧪 本地运行

支持任何静态文件服务器：

```bash
# Python
python -m http.server 8080

# Node
npx serve .

# VS Code
Live Server 插件 → 右键 index.html → Open with Live Server
```

然后浏览器打开 `http://localhost:8080`。

---

## 📝 许可

MIT