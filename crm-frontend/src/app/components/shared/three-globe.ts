import { Component, ElementRef, OnInit, OnDestroy, NgZone, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-three-globe',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full min-h-[300px]">
        <div #globeContainer class="w-full h-full cursor-grab active:cursor-grabbing"></div>
        <div #tooltip class="hidden absolute z-20 bg-gray-900/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none border border-gray-700 transform -translate-x-1/2 -translate-y-[120%]">
            <p #tooltipTitle class="font-bold text-green-400"></p>
            <p #tooltipText class="text-gray-300"></p>
        </div>
    </div>
  `,
  styles: [`:host { display: block; width: 100%; height: 100%; }`]
})
export class ThreeGlobeComponent implements OnInit, OnDestroy {
  @ViewChild('globeContainer', { static: true }) globeContainer!: ElementRef;
  @ViewChild('tooltip', { static: true }) tooltipRef!: ElementRef;
  @ViewChild('tooltipTitle', { static: true }) tooltipTitleRef!: ElementRef;
  @ViewChild('tooltipText', { static: true }) tooltipTextRef!: ElementRef;
  
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private globe!: THREE.Mesh;
  private citiesMesh!: THREE.Points;
  private animationFrameId: number = 0;
  
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private cityData: any[] = [];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initThreeJs();
    }
  }

  ngOnDestroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.renderer) this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize);
    const container = this.globeContainer?.nativeElement;
    if (container) {
        window.removeEventListener('mouseup', this.onMouseUp);
    }
  }

  private initThreeJs() {
    const container = this.globeContainer.nativeElement;
    
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.z = 250;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Create a wireframe globe
    const geometry = new THREE.SphereGeometry(100, 32, 32);
    
    // Base solid sphere
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x1e1b4b,
      transparent: true,
      opacity: 0.8
    });
    this.globe = new THREE.Mesh(geometry, material);
    this.scene.add(this.globe);

    // Wireframe overlay
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    this.globe.add(wireframe);

    // Add interactive cities
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsCount = 60;
    const posArray = new Float32Array(pointsCount * 3);
    
    const regions = ['North America', 'Europe', 'Asia Pacific', 'South America', 'EMEA'];
    
    for(let i = 0; i < pointsCount; i++) {
        const phi = Math.acos( -1 + ( 2 * i ) / pointsCount );
        const theta = Math.sqrt( pointsCount * Math.PI ) * phi;
        
        const r = 100.5; // Slightly above surface
        posArray[i*3] = r * Math.cos(theta) * Math.sin(phi);
        posArray[i*3+1] = r * Math.sin(theta) * Math.sin(phi);
        posArray[i*3+2] = r * Math.cos(phi);
        
        // Generate mock data for this point
        this.cityData.push({
            region: regions[Math.floor(Math.random() * regions.length)],
            users: Math.floor(Math.random() * 5000) + 100
        });
    }
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const pointsMaterial = new THREE.PointsMaterial({
      size: 4,
      color: 0x22c55e,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9
    });
    this.citiesMesh = new THREE.Points(pointsGeometry, pointsMaterial);
    this.globe.add(this.citiesMesh);

    // Configure raycaster to have a slightly larger hit radius
    this.raycaster.params.Points.threshold = 3;

    // Mouse events
    container.addEventListener('mousedown', this.onMouseDown.bind(this));
    container.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Animation Loop
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  private onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.previousMousePosition = { x: e.offsetX, y: e.offsetY };
  }

  private onMouseMove(e: MouseEvent) {
    const container = this.globeContainer.nativeElement;
    
    // Update mouse position for raycasting
    const rect = container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;
    
    if (this.isDragging) {
      const deltaMove = {
        x: e.offsetX - this.previousMousePosition.x,
        y: e.offsetY - this.previousMousePosition.y
      };

      this.globe.rotation.y += deltaMove.x * 0.005;
      this.globe.rotation.x += deltaMove.y * 0.005;

      this.previousMousePosition = { x: e.offsetX, y: e.offsetY };
      this.hideTooltip();
    } else {
      // Not dragging, check for hover
      this.checkIntersection(e.clientX - rect.left, e.clientY - rect.top);
    }
  }
  
  private checkIntersection(clientX: number, clientY: number) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObject(this.citiesMesh);
      
      if (intersects.length > 0) {
          const index = intersects[0].index;
          if (index !== undefined) {
              this.showTooltip(clientX, clientY, this.cityData[index]);
          }
      } else {
          this.hideTooltip();
      }
  }
  
  private showTooltip(x: number, y: number, data: any) {
      const tooltip = this.tooltipRef.nativeElement;
      this.tooltipTitleRef.nativeElement.innerText = data.region;
      this.tooltipTextRef.nativeElement.innerText = `Active Customers: ${data.users}`;
      
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.classList.remove('hidden');
      
      // Change cursor to pointer
      this.globeContainer.nativeElement.style.cursor = 'pointer';
  }
  
  private hideTooltip() {
      this.tooltipRef.nativeElement.classList.add('hidden');
      this.globeContainer.nativeElement.style.cursor = this.isDragging ? 'grabbing' : 'grab';
  }

  private onMouseUp = () => {
    this.isDragging = false;
    this.globeContainer.nativeElement.style.cursor = 'grab';
  }

  private onWindowResize = () => {
    const container = this.globeContainer?.nativeElement;
    if(!container || container.clientWidth === 0) return;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
    if (!this.isDragging) {
      this.globe.rotation.y += 0.002;
    }
    
    // Important: we also need to raycast during animation to catch hover while spinning
    if (!this.isDragging) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.citiesMesh);
        if (intersects.length === 0 && !this.tooltipRef.nativeElement.classList.contains('hidden')) {
            this.hideTooltip();
        }
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}
