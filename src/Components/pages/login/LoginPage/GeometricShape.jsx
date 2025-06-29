import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GeometricShape = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current || !mountRef.current) return;
    isInitialized.current = true;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Set a dark gradient background
    rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    const renderer = rendererRef.current;
    renderer.setClearColor(0x1a0029, 1); // Deep purple background
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 4;

    // Parameters - adjusted for more circular appearance
    const particleCount = 2000; // Increased particle count
    const radius = 2; // Increased radius
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const basePositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Create circular particle distribution
    for (let i = 0; i < particleCount; i++) {
      // Create multiple circular layers
      const layer = Math.floor(i / (particleCount / 5)); // 5 layers
      const angleStep = (Math.PI * 2) / (particleCount / 5);
      const angle = (i % (particleCount / 5)) * angleStep;
      
      const layerRadius = radius - (layer * 0.2); // Decrease radius for inner layers
      const x = layerRadius * Math.cos(angle);
      const y = layerRadius * Math.sin(angle);
      const z = (Math.random() - 0.5) * 0.5; // Slight depth variation

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;
      sizes[i] = 0.02; // Smaller particles

      // Updated color scheme to match site theme
      const hue = 0.75 + (Math.sin(angle) * 0.05); // Purple base hue
      const saturation = 0.7 + (layer * 0.05);
      const lightness = 0.5 + (layer * 0.1); // Brighter outer layers
      const color = new THREE.Color().setHSL(hue, saturation, lightness);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Enhanced particle material
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x8236fc, // Match the site's primary purple
      size: 0.02,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(geometry, particleMaterial);
    particlesRef.current = particleSystem;
    scene.add(particleSystem);

    // Add subtle ambient light with purple tint
    const ambientLight = new THREE.AmbientLight(0x6b21a8, 0.3);
    scene.add(ambientLight);

    // Animation
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.0005; // Slower animation
      const positions = geometry.attributes.position.array;
      const colors = geometry.attributes.color.array;

      for (let i = 0; i < particleCount; i++) {
        const bx = basePositions[i * 3];
        const by = basePositions[i * 3 + 1];
        const bz = basePositions[i * 3 + 2];

        // Circular wave motion
        const angle = Math.atan2(by, bx);
        const dist = Math.sqrt(bx * bx + by * by);
        const wave = 0.1 * Math.sin(time * 2 + angle * 4);
        
        positions[i * 3] = bx + Math.cos(angle) * wave;
        positions[i * 3 + 1] = by + Math.sin(angle) * wave;
        positions[i * 3 + 2] = bz + Math.cos(time * 2 + dist) * 0.05;

        // Gentle color pulsing
        const pulse = Math.sin(time * 4 + angle) * 0.1 + 0.9;
        colors[i * 3] *= pulse;
        colors[i * 3 + 1] *= pulse;
        colors[i * 3 + 2] *= pulse;
      }

      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;

      // Smooth rotation
      particleSystem.rotation.z += 0.001;
      particleSystem.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      isInitialized.current = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (sceneRef.current && particlesRef.current) {
        sceneRef.current.remove(particlesRef.current);
      }
      geometry.dispose();
      particleMaterial.dispose();
      rendererRef.current.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at center, #2d0058 0%, #1a0029 100%)'
      }}
    />
  );
};

export default GeometricShape; 