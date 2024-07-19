const AudioController = class {
    constructor(audioUrl, maxIntensity = 10, decayRate = 0.1, decayInterval = 50) {
        this.audioUrl = audioUrl;
        this.maxIntensity = maxIntensity;
        this.decayRate = decayRate;
        this.decayInterval = decayInterval;
        this.intensity = 0;
        this.decayIntervalId = null;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.buffer = null;
        this.source = null;

        this.loadSound();
    }

    async loadSound() {
        const response = await fetch(this.audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
    }

    play() {
        if (this.audioContext.state === "suspended") {
            this.audioContext.resume();
        }

        if (this.buffer) {
            this.stop();
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = this.buffer;
            this.source.connect(this.gainNode);
            this.source.loop = true;
            this.source.start();
        }
    }

    stop() {
        if (this.source) {
            this.source.stop();
            this.source = null;
        }
    }

    updateVolume() {
        const volume = Math.min(this.intensity / this.maxIntensity, 1);
        this.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

        if (volume > 0 && !this.source) {
            this.play();
        } else if (volume === 0 && this.source) {
            this.stop();
        }
    }

    incrementIntensity(amount = 1) {
        this.intensity = Math.min(this.intensity + amount, this.maxIntensity);
        this.updateVolume();
    }

    fadeOut(duration = 0.3) {
        if (this.source) {
            this.gainNode.gain.setTargetAtTime(0, this.audioContext.currentTime, duration / 3);
            setTimeout(() => this.stop(), duration * 1000);
        }
        this.intensity = 0;
    }
};
