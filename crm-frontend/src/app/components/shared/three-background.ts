import { Component, ElementRef, OnInit, OnDestroy, NgZone, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-three-background',
  standalone: true,
  template: `<div #canvasContainer class="absolute inset-0 z-0 bg-gray-900 overflow-hidden"></div>`,
  styles: [`
    :host { display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
  `]
})
export class ThreeBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
  
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;
  private orbs!: THREE.Points;
  private animationFrameId: number = 0;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initThreeJs();
    }
  }

  ngOnDestroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.renderer) this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize);
  }

  private initThreeJs() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x111827, 0.002); // Tailwind gray-900

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 30;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Setup particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x6366f1, // Tailwind indigo-500
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(particlesGeometry, material);
    this.scene.add(this.particles);

    // Add some larger glowing orbs
    const geometry2 = new THREE.BufferGeometry();
    const posArray2 = new Float32Array(50 * 3);
    for(let i = 0; i < 50 * 3; i++) {
        posArray2[i] = (Math.random() - 0.5) * 80;
    }
    geometry2.setAttribute('position', new THREE.BufferAttribute(posArray2, 3));
    const material2 = new THREE.PointsMaterial({
        size: 1.5,
        color: 0x8b5cf6, // Violet 500
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        map: this.createCircleTexture()
    });
    this.orbs = new THREE.Points(geometry2, material2);
    this.scene.add(this.orbs);

    // Get the actual container element
    const container = this.canvasContainer.nativeElement;
    container.appendChild(this.renderer.domElement);

    // Handle Resize
    window.addEventListener('resize', this.onWindowResize);

    // Animation Loop
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  private createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d')!;
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
    this.particles.rotation.y += 0.001;
    this.particles.rotation.x += 0.0005;

    this.orbs.rotation.y -= 0.0005;
    this.orbs.rotation.x -= 0.0002;

    this.renderer.render(this.scene, this.camera);
  }
}
