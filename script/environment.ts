import { Map as MapboxMap } from 'mapbox-gl';

export type WeatherConfig = {
    wind?: boolean;
    fog?: boolean;
    rain?: boolean;
    snow?: boolean;
    storm?: boolean;
    night?: boolean;
    bounds?: [[number, number], [number, number]] | null;
};

interface WeatherParticle {
    x: number;
    y: number;
    lng: number;
    lat: number;
    speed: number;
    size: number;
    opacity: number;
    vx: number;
    vy: number;
}

export class WeatherSystem {
    private map: MapboxMap;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private animationId: number | null = null;
    private isActive: boolean = false;

    // Weather state
    private config: WeatherConfig = {};
    private particles: WeatherParticle[] = [];
    private bounds: [[number, number], [number, number]] | null = null;

    // Callbacks
    private onNightChange?: (night: boolean) => void;
    private resizeHandler: () => void;

    constructor(map: MapboxMap, onNightChange?: (night: boolean) => void) {
        this.map = map;
        this.onNightChange = onNightChange;

        // Create canvas overlay
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';

        const mapContainer = this.map.getContainer();
        mapContainer.appendChild(this.canvas);

        const context = this.canvas.getContext('2d', { alpha: true });
        if (!context) {
            throw new Error('Could not get 2D context from canvas');
        }
        this.ctx = context;

        // Setup
        this.resizeCanvas();
        this.resizeHandler = () => this.resizeCanvas();
        this.map.on('resize', this.resizeHandler);
    }

    /**
     * Resize canvas to match map container
     */
    private resizeCanvas(): void {
        const container = this.map.getContainer();
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    /**
     * Check if a geographic point is within bounds
     */
    private isInBounds(lng: number, lat: number): boolean {
        if (!this.bounds) return true;

        const [[west, south], [east, north]] = this.bounds;
        return lng >= west && lng <= east && lat >= south && lat <= north;
    }

    /**
     * Calculate distance in km between two points
     */
    private getDistance(lng1: number, lat1: number, lng2: number, lat2: number): number {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Get center point of bounds
     */
    private getBoundsCenter(): [number, number] | null {
        if (!this.bounds) return null;
        const [[west, south], [east, north]] = this.bounds;
        return [(west + east) / 2, (south + north) / 2];
    }

    /**
     * Create a particle (rain drop or snowflake)
     */
    private createParticle(atTop: boolean = false): WeatherParticle | null {
        let lng: number = 0;
        let lat: number = 0;

        if (this.bounds) {
            const [[west, south], [east, north]] = this.bounds;
            const maxAttempts = 50;

            for (let i = 0; i < maxAttempts; i++) {
                lng = west + Math.random() * (east - west);
                lat = south + Math.random() * (north - south);

                if (this.isInBounds(lng, lat)) {
                    break;
                }
                if (i === maxAttempts - 1) return null;
            }
        } else {
            // Global effect - use viewport bounds
            const bounds = this.map.getBounds();
            if (bounds) {
                lng = bounds.getWest() + Math.random() * (bounds.getEast() - bounds.getWest());
                lat = bounds.getSouth() + Math.random() * (bounds.getNorth() - bounds.getSouth());
            }
        }

        const point = this.map.project([lng, lat]);
        const isSnow = this.config.snow;

        // Wind direction
        const windAngle = this.config.wind ? 140 : 80;
        const windRad = (windAngle - 90) * Math.PI / 180;

        return {
            x: point.x,
            y: atTop ? -20 : Math.random() * this.canvas.height,
            lng,
            lat,
            speed: isSnow ? 1 + Math.random() * 2 : 5 + Math.random() * 3,
            size: isSnow ? 2 + Math.random() * 3 : 1,
            opacity: 0.3 + Math.random() * 0.5,
            vx: Math.cos(windRad) * (this.config.wind ? 2 : 0.5),
            vy: Math.sin(windRad)
        };
    }

    /**
     * Initialize particles
     */
    private initParticles(): void {
        this.particles = [];
        const density = this.config.storm ? 800 : this.config.rain ? 500 : 300;

        for (let i = 0; i < density; i++) {
            const particle = this.createParticle();
            if (particle) {
                this.particles.push(particle);
            }
        }
    }

    /**
     * Update particle positions
     */
    private updateParticles(): void {
        const isSnow = this.config.snow;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Update position
            p.y += p.speed;
            p.x += p.vx;

            // Add some drift for snow
            if (isSnow) {
                p.x += Math.sin(p.y * 0.01) * 0.5;
            }

            // Update geographic position
            const lngLat = this.map.unproject([p.x, p.y]);
            p.lng = lngLat.lng;
            p.lat = lngLat.lat;

            // Check if out of bounds
            if (p.y > this.canvas.height + 20 ||
                p.x < -20 ||
                p.x > this.canvas.width + 20 ||
                !this.isInBounds(p.lng, p.lat)) {

                const newParticle = this.createParticle(true);
                if (newParticle) {
                    this.particles[i] = newParticle;
                } else {
                    this.particles.splice(i, 1);
                }
            }
        }

        // Maintain density
        const targetDensity = this.config.storm ? 800 : this.config.rain ? 500 : 300;
        while (this.particles.length < targetDensity) {
            const p = this.createParticle();
            if (p) {
                this.particles.push(p);
            } else {
                break;
            }
        }
    }

    /**
     * Render particles
     */
    private renderParticles(): void {
        const isSnow = this.config.snow;
        const intensity = this.config.storm ? 1 : 0.7;

        for (const p of this.particles) {
            // Update screen position
            const point = this.map.project([p.lng, p.lat]);
            p.x = point.x;
            p.y = point.y;

            if (p.x >= -20 && p.x <= this.canvas.width + 20 &&
                p.y >= -20 && p.y <= this.canvas.height + 20 &&
                this.isInBounds(p.lng, p.lat)) {

                this.ctx.globalAlpha = p.opacity * intensity;

                if (isSnow) {
                    // Draw snowflake
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    // Draw rain drop
                    this.ctx.strokeStyle = this.config.storm ? '#6b7c9c' : '#a8adbc';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();

                    const length = isSnow ? 5 : 10 + Math.random() * 5;
                    const endX = p.x + p.vx * length;
                    const endY = p.y + p.vy * length;

                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(endX, endY);
                    this.ctx.stroke();
                }
            }
        }

        this.ctx.globalAlpha = 1;
    }

    /**
     * Render fog effect
     */
    private renderFog(): void {
        if (!this.config.fog) return;

        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height)
        );

        gradient.addColorStop(0, 'rgba(216, 223, 232, 0)');
        gradient.addColorStop(0.5, 'rgba(216, 223, 232, 0.1)');
        gradient.addColorStop(1, 'rgba(216, 223, 232, 0.3)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Animation loop
     */
    private animate(): void {
        if (!this.isActive) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render fog first (background)
        this.renderFog();

        // Render particles
        if (this.config.rain || this.config.snow || this.config.storm) {
            this.updateParticles();
            this.renderParticles();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Apply weather configuration
     */
    public setWeather(config: WeatherConfig | null): void {
        // Clear existing effects
        if (config === null) {
            this.stop();
            this.config = {};
            this.bounds = null;

            // Reset native mapbox effects
            this.map.setFog(null);
            this.map.setSnow(null);
            this.map.setRain(null);

            if (this.onNightChange) {
                this.onNightChange(false);
            }
            return;
        }

        // Update config
        const wasActive = this.isActive;
        this.config = { ...config };
        this.bounds = config.bounds || null;

        // Handle night mode
        if (config.night !== undefined && this.onNightChange) {
            this.onNightChange(config.night);
        }

        // Handle native fog if no bounds specified
        if (config.fog && !config.bounds) {
            this.map.setFog({
                range: [0.5, 10],
                color: '#d8dfe8',
                'horizon-blend': 0.1,
                'high-color': '#c8d5e8',
                'space-color': '#7c9cc5',
                'star-intensity': 0.15
            });
        } else {
            this.map.setFog(null);
        }

        // Handle custom effects (rain, snow) with bounds support
        const needsCustomEffect = (config.rain || config.snow || config.storm || (config.fog && config.bounds));

        if (needsCustomEffect) {
            if (!wasActive) {
                this.start();
            }
            this.initParticles();
        } else {
            this.stop();
        }

        // Fallback to native effects if no bounds
        if (!config.bounds) {
            if (config.snow && !this.map.getSnow()) {
                this.map.setSnow({
                    density: ['interpolate', ['linear'], ['zoom'], 8, 0, 10, 0.8],
                    intensity: 0.6,
                    color: config.night ? '#ffffff' : '#888',
                    opacity: 0.8,
                    direction: [10, 70],
                    'center-thinning': 0.2
                });
            }

            if ((config.rain || config.wind || config.storm) && !this.map.getRain()) {
                const isStorm = config.storm;
                this.map.setRain({
                    density: ['interpolate', ['linear'], ['zoom'], 8, 0, 10, 1.0],
                    intensity: isStorm ? 1.0 : 0.8,
                    color: isStorm ? '#6b7c9c' : '#a8adbc',
                    opacity: isStorm ? 0.9 : 0.7,
                    vignette: ['interpolate', ['linear'], ['zoom'], 9, 0.0, 13, 0.8],
                    'vignette-color': '#464646',
                    direction: [0, config.wind ? 140 : 80],
                    'droplet-size': [2.6, 18.2],
                    'distortion-strength': 0.7,
                    'center-thinning': 0
                });
            }
        }
    }

    /**
     * Start animation
     */
    private start(): void {
        if (this.isActive) return;
        this.isActive = true;
        this.animate();
    }

    /**
     * Stop animation
     */
    private stop(): void {
        this.isActive = false;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = [];
    }

    /**
     * Cleanup and destroy
     */
    public destroy(): void {
        this.stop();
        this.map.off('resize', this.resizeHandler);
        this.canvas.remove();
        this.map.setFog(null);
        this.map.setSnow(null);
        this.map.setRain(null);
    }
}

export function createBoundsAroundPoint(
    coord: [number, number],
    sizeKm: number = 50
): [[number, number], [number, number]] {
    const [lng, lat] = coord;
    const latDelta = sizeKm / 111;
    const lngDelta = sizeKm / (111 * Math.cos(lat * Math.PI / 180));

    return [
        [lng - lngDelta, lat - latDelta],
        [lng + lngDelta, lat + latDelta]
    ];
}
