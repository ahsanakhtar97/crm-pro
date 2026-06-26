import { Component, ElementRef, OnInit, OnDestroy, NgZone, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-three-environment',
  standalone: true,
  template: `<div #canvasContainer class="fixed inset-0 z-[-1] bg-[#050510] overflow-hidden"></div>`,
  styles: [`:host { display: block; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none; }`]
})
export class ThreeEnvironmentComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
  
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;
  private lines!: THREE.LineSegments;
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
    this.scene.fog = new THREE.FogExp2(0x050510, 0.002);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 80;
    this.camera.position.y = 15;
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create Cyber Network
    const particlesCount = 400; // Optimized for 60FPS networking
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const velocities = [];

    for (let i = 0; i < particlesCount; i++) {
        positions[i*3] = (Math.random() - 0.5) * 200;
        positions[i*3+1] = (Math.random() - 0.5) * 100;
        positions[i*3+2] = (Math.random() - 0.5) * 200;
        
        velocities.push({
            x: (Math.random() - 0.5) * 0.05,
            y: (Math.random() - 0.5) * 0.05,
            z: (Math.random() - 0.5) * 0.05
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    (geometry as any).userData = { velocities };

    // Point Material
    const material = new THREE.PointsMaterial({
        size: 1.5,
        color: 0x818cf8, // Indigo 400
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    // Lines for network
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x4f46e5, // Indigo 600
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
    });
    
    const lineGeometry = new THREE.BufferGeometry();
    this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.scene.add(this.lines);

    const container = this.canvasContainer.nativeElement;
    container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.onWindowResize);

    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
    // Rotate entire scene very slowly
    this.scene.rotation.y += 0.0003;

    // Move particles
    const positions = this.particles.geometry.attributes['position'].array as Float32Array;
    const velocities = (this.particles.geometry as any).userData.velocities;

    const linePositions = [];
    
    for (let i = 0; i < positions.length / 3; i++) {
        positions[i*3] += velocities[i].x;
        positions[i*3+1] += velocities[i].y;
        positions[i*3+2] += velocities[i].z;

        // Bounce bounds
        if (Math.abs(positions[i*3]) > 100) velocities[i].x *= -1;
        if (Math.abs(positions[i*3+1]) > 50) velocities[i].y *= -1;
        if (Math.abs(positions[i*3+2]) > 100) velocities[i].z *= -1;

        // Network connections
        for (let j = i + 1; j < positions.length / 3; j++) {
            const dx = positions[i*3] - positions[j*3];
            const dy = positions[i*3+1] - positions[j*3+1];
            const dz = positions[i*3+2] - positions[j*3+2];
            const distSq = dx*dx + dy*dy + dz*dz;
            
            if (distSq < 400) { 
                linePositions.push(
                    positions[i*3], positions[i*3+1], positions[i*3+2],
                    positions[j*3], positions[j*3+1], positions[j*3+2]
                );
            }
        }
    }
    
    this.particles.geometry.attributes['position'].needsUpdate = true;
    this.lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    this.renderer.render(this.scene, this.camera);
  }
}
