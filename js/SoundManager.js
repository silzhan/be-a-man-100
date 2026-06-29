/**
 * 音效管理器
 * 使用 Web Audio API 合成简单音效
 */
class SoundManager {
    constructor() {
        this.enabled = Utils.getStorage(CONSTANTS.STORAGE.SOUND_ENABLED, true);
        this.ctx = null;
        this._initContext();
    }

    /**
     * 初始化 Audio Context
     */
    _initContext() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    /**
     * 确保 Audio Context 处于运行状态
     */
    _resumeContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * 播放跳跃音效
     */
    playJump() {
        if (!this.enabled || !this.ctx) return;
        this._resumeContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.15);
    }

    /**
     * 播放碎裂音效
     */
    playBreak() {
        if (!this.enabled || !this.ctx) return;
        this._resumeContext();

        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();

        source.buffer = buffer;
        source.connect(gain);
        gain.connect(this.ctx.destination);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        source.start(this.ctx.currentTime);
    }

    /**
     * 播放传送音效
     */
    playTeleport() {
        if (!this.enabled || !this.ctx) return;
        this._resumeContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.3);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.5);
    }

    /**
     * 播放死亡音效
     */
    playHit() {
        if (!this.enabled || !this.ctx) return;
        this._resumeContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.4);
    }

    /**
     * 播放通关音效
     */
    playWin() {
        if (!this.enabled || !this.ctx) return;
        this._resumeContext();

        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.15);

            gain.gain.setValueAtTime(0, this.ctx.currentTime + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + i * 0.15 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.15 + 0.3);

            osc.start(this.ctx.currentTime + i * 0.15);
            osc.stop(this.ctx.currentTime + i * 0.15 + 0.3);
        });
    }

    /**
     * 切换音效开关
     */
    toggle() {
        this.enabled = !this.enabled;
        Utils.setStorage(CONSTANTS.STORAGE.SOUND_ENABLED, this.enabled);
        return this.enabled;
    }

    /**
     * 获取音效状态
     */
    isEnabled() {
        return this.enabled;
    }
}
