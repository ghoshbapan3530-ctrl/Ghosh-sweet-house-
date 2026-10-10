import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Ambient3DCanvasProps {
  className?: string;
  isDark?: boolean;
}

export const Ambient3DCanvas: React.FC<Ambient3DCanvasProps> = ({
  className = '',
  isDark = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    // Warm Ambient Light
    const ambient = new THREE.AmbientLight(0xfff7ed, 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xf59e0b, 1.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Floating 3D Sweet Elements Group
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    // 1. Golden Honey & Boondi Pearls (Spheres)
    const sphereGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.4
    });
    const whiteChhenaMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      roughness: 0.6
    });

    const particles: {
      mesh: THREE.Mesh;
      baseX: number;
      baseY: number;
      baseZ: number;
      speed: number;
      rotSpeedX: number;
      rotSpeedY: number;
      offset: number;
    }[] = [];

    const numPearls = 28;
    for (let i = 0; i < numPearls; i++) {
      const isGold = i % 2 === 0;
      const mesh = new THREE.Mesh(sphereGeo, isGold ? goldMat : whiteChhenaMat);
      
      const x = (Math.random() - 0.5) * 32;
      const y = (Math.random() - 0.5) * 22;
      const z = (Math.random() - 0.5) * 12;

      mesh.position.set(x, y, z);
      const scale = 0.5 + Math.random() * 0.9;
      mesh.scale.set(scale, scale, scale);

      particleGroup.add(mesh);
      particles.push({
        mesh,
        baseX: x,
        baseY: y,
        baseZ: z,
        speed: 0.0006 + Math.random() * 0.0012,
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.015,
        offset: Math.random() * Math.PI * 2
      });
    }

    // 2. Floating Saffron Strands (Curved tubes or slim boxes)
    const saffronGeo = new THREE.BoxGeometry(0.04, 0.45, 0.04);
    const saffronMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.5
    });

    for (let i = 0; i < 16; i++) {
      const mesh = new THREE.Mesh(saffronGeo, saffronMat);
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10;
      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      particleGroup.add(mesh);
      particles.push({
        mesh,
        baseX: x,
        baseY: y,
        baseZ: z,
        speed: 0.0008 + Math.random() * 0.0015,
        rotSpeedX: 0.01,
        rotSpeedY: 0.02,
        offset: Math.random() * Math.PI * 2
      });
    }

    // Mouse Move Parallax
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 3.5;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight - 0.5) * 3.5;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.016;

      // Mouse smooth interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      camera.position.x = mouseRef.current.x;
      camera.position.y = mouseRef.current.y;
      camera.lookAt(0, 0, 0);

      // Animate floating particles
      particles.forEach((p) => {
        p.mesh.position.y = p.baseY + Math.sin(clock + p.offset) * 0.8;
        p.mesh.position.x = p.baseX + Math.cos(clock * 0.6 + p.offset) * 0.4;
        p.mesh.rotation.x += p.rotSpeedX;
        p.mesh.rotation.y += p.rotSpeedY;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-1 overflow-hidden opacity-45 transition-opacity duration-1000 ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
