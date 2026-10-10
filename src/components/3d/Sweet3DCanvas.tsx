import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { SweetModelType, buildSweet3DModel, SWEET_3D_CATALOG } from './sweetModels';
import {
  RotateCcw,
  Play,
  Pause,
  Sun,
  Eye,
  Maximize2,
  Sparkles,
  Layers
} from 'lucide-react';

interface Sweet3DCanvasProps {
  modelType: SweetModelType;
  height?: number | string;
  autoRotateDefault?: boolean;
  allowControls?: boolean;
  showOverlayTools?: boolean;
  className?: string;
  onModelClick?: () => void;
  lightingTheme?: 'warm' | 'studio' | 'royal';
}

export const Sweet3DCanvas: React.FC<Sweet3DCanvasProps> = ({
  modelType,
  height = 360,
  autoRotateDefault = true,
  allowControls = true,
  showOverlayTools = true,
  className = '',
  onModelClick,
  lightingTheme = 'warm'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Control states
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotateDefault);
  const [isWireframe, setIsWireframe] = useState(false);
  const [activeLighting, setActiveLighting] = useState<'warm' | 'studio' | 'royal'>(lightingTheme);

  // Three.js internal instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Orbit drag interaction refs
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 4.8, theta: 0.6, phi: 1.1 });
  const targetSphericalRef = useRef({ radius: 4.8, theta: 0.6, phi: 1.1 });
  const isInteractingRef = useRef(false);

  // Lights ref to adjust on lighting changes
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    dir: THREE.DirectionalLight;
    rim: THREE.SpotLight;
    warmPoint: THREE.PointLight;
  } | null>(null);

  // 1. Setup Three.js Scene, Camera, Renderer
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 300;
    const heightPx = typeof height === 'number' ? height : container.clientHeight || 360;

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(38, width / heightPx, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // LIGHTING SETUP
    const ambient = new THREE.AmbientLight(0xfff3e0, 1.2);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffeedd, 2.2);
    dir.position.set(4, 7, 5);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 1024;
    dir.shadow.mapSize.height = 1024;
    scene.add(dir);

    const rim = new THREE.SpotLight(0xf59e0b, 2.5);
    rim.position.set(-5, 4, -4);
    rim.angle = Math.PI / 4;
    rim.penumbra = 0.8;
    scene.add(rim);

    const warmPoint = new THREE.PointLight(0xd97706, 1.5, 10);
    warmPoint.position.set(0, -1.8, 2);
    scene.add(warmPoint);

    lightsRef.current = { ambient, dir, rim, warmPoint };

    // FLOATING SUBTLE PEDESTAL SHADOW
    const shadowGeo = new THREE.CircleGeometry(2.2, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.18
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.65;
    scene.add(shadowMesh);

    // ANIMATION LOOP
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Auto rotation when not interacting
      if (isAutoRotating && !isInteractingRef.current) {
        targetSphericalRef.current.theta += 0.008;
      }

      // Smooth camera interpolation (damping)
      sphericalRef.current.theta += (targetSphericalRef.current.theta - sphericalRef.current.theta) * 0.08;
      sphericalRef.current.phi += (targetSphericalRef.current.phi - sphericalRef.current.phi) * 0.08;
      sphericalRef.current.radius += (targetSphericalRef.current.radius - sphericalRef.current.radius) * 0.08;

      updateCameraPosition();

      // Subtle float motion on model
      if (modelGroupRef.current) {
        modelGroupRef.current.position.y = Math.sin(Date.now() * 0.0018) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // RESIZE OBSERVER
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      resizeObserver.disconnect();
      renderer.dispose();
      scene.clear();
    };
  }, [height]);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
  };

  // 2. Load / Swap 3D Model
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old model
    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
      modelGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      modelGroupRef.current = null;
    }

    // Build new procedural sweet model
    const newModel = buildSweet3DModel(modelType);
    newModel.position.set(0, 0, 0);
    scene.add(newModel);
    modelGroupRef.current = newModel;

    // Apply wireframe if active
    applyWireframe(isWireframe, newModel);
  }, [modelType]);

  // 3. Apply Lighting Theme
  useEffect(() => {
    const lights = lightsRef.current;
    if (!lights) return;

    if (activeLighting === 'warm') {
      lights.ambient.color.setHex(0xfff3e0);
      lights.ambient.intensity = 1.3;
      lights.dir.color.setHex(0xffeedd);
      lights.dir.intensity = 2.4;
      lights.rim.color.setHex(0xf59e0b);
      lights.rim.intensity = 2.5;
    } else if (activeLighting === 'royal') {
      lights.ambient.color.setHex(0xfde68a);
      lights.ambient.intensity = 1.1;
      lights.dir.color.setHex(0xd97706);
      lights.dir.intensity = 3.0;
      lights.rim.color.setHex(0xd946ef);
      lights.rim.intensity = 2.2;
    } else {
      // Studio
      lights.ambient.color.setHex(0xffffff);
      lights.ambient.intensity = 1.5;
      lights.dir.color.setHex(0xffffff);
      lights.dir.intensity = 2.2;
      lights.rim.color.setHex(0x38bdf8);
      lights.rim.intensity = 1.8;
    }
  }, [activeLighting]);

  // 4. Wireframe Inspection Mode
  const applyWireframe = (wire: boolean, group: THREE.Group | null) => {
    if (!group) return;
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => {
            m.wireframe = wire;
          });
        } else if (child.material) {
          child.material.wireframe = wire;
        }
      }
    });
  };

  const toggleWireframe = () => {
    const next = !isWireframe;
    setIsWireframe(next);
    applyWireframe(next, modelGroupRef.current);
  };

  const resetCamera = () => {
    targetSphericalRef.current = { radius: 4.8, theta: 0.6, phi: 1.1 };
  };

  // Pointer Drag Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!allowControls) return;
    isDraggingRef.current = true;
    isInteractingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !allowControls) return;

    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    targetSphericalRef.current.theta -= deltaX * 0.008;
    targetSphericalRef.current.phi = Math.max(
      0.2,
      Math.min(Math.PI - 0.2, targetSphericalRef.current.phi - deltaY * 0.008)
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    setTimeout(() => {
      isInteractingRef.current = false;
    }, 400);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!allowControls) return;
    e.preventDefault();
    const zoomFactor = e.deltaY * 0.003;
    targetSphericalRef.current.radius = Math.max(
      2.6,
      Math.min(7.5, targetSphericalRef.current.radius + zoomFactor)
    );
  };

  const meta = SWEET_3D_CATALOG[modelType] || SWEET_3D_CATALOG.rasgulla;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none touch-none rounded-3xl ${className}`}
      style={{ height }}
      onWheel={handleWheel}
    >
      {/* Three.js WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={onModelClick}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating 3D Interaction Indicator Badge */}
      <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-bold">3D WebGL</span>
          <span className="text-stone-400">•</span>
          <span>360° Drag & Rotate</span>
        </div>
      </div>

      {/* Sweet Metadata Pill Bottom-Left */}
      <div className="absolute bottom-3 left-3 pointer-events-none z-10 hidden sm:block">
        <div className="p-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-amber-500/25 text-left max-w-xs shadow-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{meta.nameEn}</span>
          </div>
          <p className="text-[10px] text-stone-300 font-bengali leading-tight mt-0.5">
            {meta.taglineBn}
          </p>
        </div>
      </div>

      {/* Floating Overlay Controls Top-Right */}
      {showOverlayTools && allowControls && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 bg-black/70 backdrop-blur-md p-1.5 rounded-2xl border border-stone-800 shadow-xl">
          {/* Auto-rotate toggle */}
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
              isAutoRotating
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-white'
            }`}
            title={isAutoRotating ? 'Pause 360° Auto-Rotation' : 'Resume 360° Auto-Rotation'}
          >
            {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Wireframe Inspector Toggle */}
          <button
            type="button"
            onClick={toggleWireframe}
            className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
              isWireframe
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-white'
            }`}
            title="Inspect 3D Geometry / Wireframe Structure"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Lighting Mode Switcher */}
          <button
            type="button"
            onClick={() => {
              setActiveLighting((prev) =>
                prev === 'warm' ? 'studio' : prev === 'studio' ? 'royal' : 'warm'
              );
            }}
            className="p-1.5 rounded-xl text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
            title={`Lighting: ${activeLighting.toUpperCase()} (Click to toggle)`}
          >
            <Sun className="w-4 h-4" />
          </button>

          {/* Reset Camera */}
          <button
            type="button"
            onClick={resetCamera}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white transition-colors cursor-pointer"
            title="Reset Camera Angle"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
