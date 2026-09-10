import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WeatherTheme } from '../../types/weather';

interface WeatherScene3DProps {
  theme: WeatherTheme;
  isDay: boolean;
  interactive?: boolean;
}

export const WeatherScene3D: React.FC<WeatherScene3DProps> = ({ theme, isDay, interactive = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffaa44, 2, 50);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    // Group for all dynamic weather elements
    const weatherGroup = new THREE.Group();
    scene.add(weatherGroup);

    // Elements references
    let sunMesh: THREE.Mesh | null = null;
    let sunRays: THREE.Points | null = null;
    let moonMesh: THREE.Mesh | null = null;
    let rainParticles: THREE.Points | null = null;
    let snowParticles: THREE.Points | null = null;
    let starsParticles: THREE.Points | null = null;
    let cloudGroup: THREE.Group | null = null;
    let lightningLight: THREE.PointLight | null = null;

    // --- Build Weather Theme Elements ---
    const buildSunny = () => {
      // Core Sun Sphere
      const sunGeo = new THREE.SphereGeometry(3.5, 64, 64);
      const sunMat = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xff7700,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.1,
      });
      sunMesh = new THREE.Mesh(sunGeo, sunMat);
      weatherGroup.add(sunMesh);

      // Corona Halo
      const haloGeo = new THREE.RingGeometry(3.8, 5.2, 64);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffcc33,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      sunMesh.add(haloMesh);

      // Solar Corona / Photons Particles
      const rayCount = 400;
      const rayGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(rayCount * 3);
      for (let i = 0; i < rayCount * 3; i += 3) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 3.6 + Math.random() * 3.5;
        posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
        posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        posArray[i + 2] = radius * Math.cos(phi);
      }
      rayGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const rayMat = new THREE.PointsMaterial({
        size: 0.18,
        color: 0xffeedd,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      sunRays = new THREE.Points(rayGeo, rayMat);
      weatherGroup.add(sunRays);
    };

    const buildNight = () => {
      // Glowing Moon Sphere
      const moonGeo = new THREE.SphereGeometry(3.2, 48, 48);
      const moonMat = new THREE.MeshStandardMaterial({
        color: 0xdde8f8,
        emissive: 0x88aaff,
        emissiveIntensity: 0.4,
        roughness: 0.7,
        metalness: 0.1,
      });
      moonMesh = new THREE.Mesh(moonGeo, moonMat);
      weatherGroup.add(moonMesh);

      // Starfield (1200 twinkling stars)
      const starCount = 1200;
      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 60;
        starPos[i + 1] = (Math.random() - 0.5) * 40;
        starPos[i + 2] = (Math.random() - 0.5) * 40 - 5;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({
        size: 0.14,
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      starsParticles = new THREE.Points(starGeo, starMat);
      scene.add(starsParticles);
    };

    const buildClouds = () => {
      cloudGroup = new THREE.Group();
      const cloudPuffCount = 14;
      const puffGeo = new THREE.SphereGeometry(1.6, 24, 24);
      const puffMat = new THREE.MeshStandardMaterial({
        color: theme === 'thunder' ? 0x242838 : 0xd8e2ec,
        roughness: 0.9,
        metalness: 0.05,
        transparent: true,
        opacity: 0.92,
      });

      for (let i = 0; i < cloudPuffCount; i++) {
        const puff = new THREE.Mesh(puffGeo, puffMat);
        puff.position.set(
          (Math.random() - 0.5) * 7,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3
        );
        const scale = 0.8 + Math.random() * 0.9;
        puff.scale.set(scale, scale * 0.8, scale);
        cloudGroup.add(puff);
      }
      weatherGroup.add(cloudGroup);
    };

    const buildRain = () => {
      buildClouds();
      const rainCount = 1400;
      const rainGeo = new THREE.BufferGeometry();
      const rainPos = new Float32Array(rainCount * 3);
      for (let i = 0; i < rainCount * 3; i += 3) {
        rainPos[i] = (Math.random() - 0.5) * 25;
        rainPos[i + 1] = Math.random() * 20 - 10;
        rainPos[i + 2] = (Math.random() - 0.5) * 15;
      }
      rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
      const rainMat = new THREE.PointsMaterial({
        size: 0.12,
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      rainParticles = new THREE.Points(rainGeo, rainMat);
      weatherGroup.add(rainParticles);
    };

    const buildThunder = () => {
      buildRain();
      lightningLight = new THREE.PointLight(0xa855f7, 0, 100);
      lightningLight.position.set(0, 5, 2);
      scene.add(lightningLight);
    };

    const buildSnow = () => {
      buildClouds();
      const snowCount = 800;
      const snowGeo = new THREE.BufferGeometry();
      const snowPos = new Float32Array(snowCount * 3);
      for (let i = 0; i < snowCount * 3; i += 3) {
        snowPos[i] = (Math.random() - 0.5) * 25;
        snowPos[i + 1] = Math.random() * 20 - 10;
        snowPos[i + 2] = (Math.random() - 0.5) * 15;
      }
      snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
      const snowMat = new THREE.PointsMaterial({
        size: 0.22,
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      snowParticles = new THREE.Points(snowGeo, snowMat);
      weatherGroup.add(snowParticles);
    };

    // Instantiate elements based on theme
    if (theme === 'sunny') {
      buildSunny();
    } else if (theme === 'night') {
      buildNight();
    } else if (theme === 'rainy') {
      buildRain();
    } else if (theme === 'thunder') {
      buildThunder();
    } else if (theme === 'snow') {
      buildSnow();
    } else {
      buildClouds();
    }

    // Pointer / Touch Tracking for 3D parallax tilt
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!interactive || !mount) return;
      const rect = mount.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      targetRotationY = x * 0.75;
      targetRotationX = y * 0.6;
    };

    window.addEventListener('mousemove', handlePointerMove);
    mount.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let nextLightningTime = 2 + Math.random() * 3;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Gentle continuous autonomous sway so mobile screens are always alive
      const autoSwayX = Math.sin(elapsedTime * 0.7) * 0.08;
      const autoSwayY = Math.cos(elapsedTime * 0.5) * 0.12;

      // Smooth camera/group rotation interpolation
      weatherGroup.rotation.y += (targetRotationY + autoSwayY - weatherGroup.rotation.y) * 0.05;
      weatherGroup.rotation.x += (targetRotationX + autoSwayX - weatherGroup.rotation.x) * 0.05;

      // Sun animation
      if (sunMesh) {
        sunMesh.rotation.y += delta * 0.3;
        sunMesh.rotation.z += delta * 0.15;
      }
      if (sunRays) {
        sunRays.rotation.y -= delta * 0.2;
        sunRays.rotation.x += delta * 0.1;
      }

      // Moon animation
      if (moonMesh) {
        moonMesh.rotation.y += delta * 0.15;
        moonMesh.position.y = Math.sin(elapsedTime * 0.8) * 0.3;
      }
      if (starsParticles) {
        starsParticles.rotation.y += delta * 0.02;
      }

      // Clouds gentle breathing animation
      if (cloudGroup) {
        cloudGroup.position.y = Math.sin(elapsedTime * 0.9) * 0.25;
        cloudGroup.rotation.y += delta * 0.05;
      }

      // Rain animation
      if (rainParticles) {
        const positions = rainParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= delta * 18;
          if (positions[i] < -10) {
            positions[i] = 10;
          }
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Snow animation
      if (snowParticles) {
        const positions = snowParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] -= delta * 3.5;
          positions[i] += Math.sin(elapsedTime + i) * 0.02;
          if (positions[i + 1] < -10) {
            positions[i + 1] = 10;
          }
        }
        snowParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Thunderstorm Lightning Flash
      if (lightningLight) {
        if (elapsedTime > nextLightningTime) {
          lightningLight.intensity = 8 + Math.random() * 12;
          lightningLight.color.setHex(Math.random() > 0.4 ? 0xffffff : 0xa855f7);
          setTimeout(() => {
            if (lightningLight) lightningLight.intensity = 0;
          }, 80 + Math.random() * 100);
          nextLightningTime = elapsedTime + 2.5 + Math.random() * 4;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Auto-Fit Window & Container Resize Listener
    const handleResize = () => {
      if (!mount) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      if (mount) {
        mount.removeEventListener('touchmove', handlePointerMove);
      }
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme, isDay, interactive]);

  return (
    <div 
      ref={mountRef} 
      style={{ touchAction: 'pan-y' }}
      className="w-full h-full min-h-[200px] sm:min-h-[260px] md:min-h-[340px] relative cursor-grab active:cursor-grabbing select-none"
      title="Interactive 3D Weather Model - Touch / Move to inspect"
    />
  );
};
