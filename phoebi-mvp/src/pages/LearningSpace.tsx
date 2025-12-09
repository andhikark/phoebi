import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import React, { useRef, useEffect } from 'react';
import type { ComponentId } from '../types/domain';

interface LearningSpaceProps {
    activeComponentId: ComponentId
}

const getGeometryForComponent = (id: ComponentId): Three.BufferGeometry => {
    switch (id) {
        case 'frame':
            return new Three.BoxGeometry(15, 5, 5);
        case 'wheel':
            return new Three.TorusGeometry(5, 1.5, 16, 100);
        case 'seat':
            return new Three.CylinderGeometry(3, 3, 1, 32);
        // Add other component cases here
        default:
            return new Three.SphereGeometry(5);
    }
}

export const LearningSpace: React.FC<LearningSpaceProps> = ({ activeComponentId }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const sceneRef = useRef<Three.Scene>(null);
    const cameraRef = useRef<Three.PerspectiveCamera>(null);
    const rendererRef = useRef<Three.WebGLRenderer>(null);
    const orbitControlsRef = useRef<OrbitControls>(null);
    const transformControlsRef = useRef<TransformControls>(null);
    const objectsRef = useRef<Three.Mesh[]>([]);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const scene = new Three.Scene();
        sceneRef.current = scene;

        const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        cameraRef.current = camera;

        const renderer = new Three.WebGLRenderer({
            canvas: canvasRef.current,
        });
        rendererRef.current = renderer;

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.setZ(30);

        const pointLight = new Three.PointLight(0xffffff, 100);
        pointLight.position.set(20, 20, 20);

        const ambientLight = new Three.AmbientLight(0xffffff, 50);
        scene.add(pointLight, ambientLight);

        const lightHelper = new Three.PointLightHelper(pointLight);
        const gridHelper = new Three.GridHelper(200, 50);
        scene.add(lightHelper, gridHelper);

        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControlsRef.current = orbitControls;

        const transformControls = new TransformControls(camera, renderer.domElement);
        transformControls.addEventListener('dragging-changed', (event) => {
            orbitControls.enabled = !event.value;
        });
        scene.add(transformControls.getHelper());
        transformControlsRef.current = transformControls;

        const raycaster = new Three.Raycaster();
        const mouse = new Three.Vector2();

        function onCanvasClick(event: MouseEvent) {
            const canvasBounds = canvasRef.current!.getBoundingClientRect();
            mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
            mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(objectsRef.current, false);

            if (intersects.length > 0) {
                // If an object is clicked, attach transform controls to it
                transformControls.attach(intersects[0].object);
            } else {
                // If the background is clicked, detach controls
                transformControls.detach();
            }
        }
        canvasRef.current.addEventListener('click', onCanvasClick);

        function animate() {
            requestAnimationFrame(animate);

            orbitControls.update();
            renderer.render(scene, camera);
        }

        animate();

        return () => {
            canvasRef.current?.removeEventListener('click', onCanvasClick);
            transformControls.dispose();
            orbitControls.dispose();
        };
    }, []);

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;
        if(!transformControlsRef.current) return;

        const geometry = getGeometryForComponent(activeComponentId);
        const material = new Three.MeshStandardMaterial({color: '#7A9A0F'});
        const newMesh = new Three.Mesh(geometry, material);

        scene.add(newMesh);
        objectsRef.current.push(newMesh);
        transformControlsRef.current?.attach(newMesh);
    }, [activeComponentId]);

    return (
        <div>
            <canvas ref={canvasRef} id="bg"></canvas>
        </div>
    )
}