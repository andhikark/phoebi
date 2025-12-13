import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import React, { useRef, useEffect, useImperativeHandle } from 'react';
import type { ComponentId, MaterialId, TransformMode } from '../types/domain';
import woodTextureUrl from '../assets/textures/wood/oak_veneer_01_diff_4k.jpg';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { useDesignStore } from '../state/DesignStore';

interface LearningSpaceProps {
    // activeComponentId: ComponentId
    // activeMaterialId: MaterialId
    transformMode: TransformMode
    // onObjectSelect: (componentId: ComponentId) => void
}

export interface LearningSpaceHandle {
    deleteSelectedObject: () => void;
}

const textureLoader = new Three.TextureLoader();

const woodMaterial = new Three.MeshStandardMaterial({
    map: textureLoader.load(woodTextureUrl)
})

const getGeometryForComponent = (id: ComponentId): Three.BufferGeometry => {
    switch (id) {
        case 'frame':
            return new Three.BoxGeometry(15, 5, 5);
        case 'wheel':
            return new Three.TorusGeometry(5, 1.5, 16, 100);
        case 'seat':
            return new Three.CylinderGeometry(3, 3, 1, 32);
        default:
            return new Three.SphereGeometry(5);
    }
}

const getMaterialForComponent = (id: MaterialId) => {
    switch (id) {
        case 'cardboard':
            return new Three.MeshStandardMaterial({ color: 'red' });
        case 'metal':
            return new Three.MeshStandardMaterial({ color: 'black' });
        case 'plastic':
            return new Three.MeshStandardMaterial({ color: 'blue' });
        case 'recycled_plastic':
            return new Three.MeshStandardMaterial({ color: 'cyan' });
        case 'wood':
            return woodMaterial;
        default:
            return new Three.MeshStandardMaterial({ color: 0xffff })
    }
}

export const LearningSpace = React.forwardRef<LearningSpaceHandle, LearningSpaceProps>(({ transformMode }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const sceneRef = useRef<Three.Scene>(null);
    const cameraRef = useRef<Three.PerspectiveCamera>(null);
    const rendererRef = useRef<Three.WebGLRenderer>(null);
    const orbitControlsRef = useRef<OrbitControls>(null);
    const transformControlsRef = useRef<TransformControls>(null);
    const objectsRef = useRef<Three.Mesh[]>([]);
    const composerRef = useRef<EffectComposer>(null);
    const outlinePassRef = useRef<OutlinePass>(null);

    const { objects, selectedObjectId, setSelectedObject } = useDesignStore();

    useImperativeHandle(ref, () => ({
        deleteSelectedObject: () => {
            const transformControls = transformControlsRef.current;
            const scene = sceneRef.current;
            const outlinePass = outlinePassRef.current;

            if (!transformControls?.object || !scene) return;

            const objectToDelete = transformControls.object;

            transformControls.detach();

            if (outlinePass) {
                outlinePass.selectedObjects = [];
            }

            scene.remove(objectToDelete);

            objectsRef.current = objectsRef.current.filter(obj => obj.uuid !== objectToDelete.uuid);

            if (objectToDelete instanceof Three.Mesh) {
                objectToDelete.geometry.dispose();
                if (Array.isArray(objectToDelete.material)) {
                    objectToDelete.material.forEach(m => m.dispose());
                } else {
                    objectToDelete.material.dispose();
                }
            }
        }
    }));

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

        const floorGeometry = new Three.PlaneGeometry(2000, 2000);
        const floorMaterial = new Three.MeshStandardMaterial({
            color: 0xd9d9c3,
            side: Three.DoubleSide
        });
        const floor = new Three.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;
        scene.add(floor);

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.setZ(30);

        const pointLight = new Three.PointLight(0xffffff, 4);
        pointLight.position.set(20, 20, 20);

        const ambientLight = new Three.AmbientLight(0xffffff, 2);
        scene.add(pointLight, ambientLight);

        const lightHelper = new Three.PointLightHelper(pointLight);
        const gridHelper = new Three.GridHelper(2000, 2000);
        scene.add(lightHelper, gridHelper);

        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.maxPolarAngle = Math.PI / 2;
        orbitControlsRef.current = orbitControls;

        //Post processing
        const composer = new EffectComposer(renderer);
        composerRef.current = composer;

        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const outlinePass = new OutlinePass(new Three.Vector2(window.innerWidth, window.innerHeight), scene, camera);
        outlinePass.edgeStrength = 2;
        outlinePass.edgeGlow = 0.1;
        outlinePass.edgeThickness = 2;
        outlinePass.visibleEdgeColor.set('#4CBC93');
        outlinePass.hiddenEdgeColor.set('#4CBC93');
        composer.addPass(outlinePass);
        outlinePassRef.current = outlinePass;

        const transformControls = new TransformControls(camera, renderer.domElement);

        let isDragging = false;
        transformControls.addEventListener('dragging-changed', (event) => {
            isDragging = event.value as boolean;
            orbitControls.enabled = !event.value;
        });
        transformControls.addEventListener('objectChange', () => {
            const object = transformControls.object;
            if (object) {
                const boundingBox = new Three.Box3().setFromObject(object);
                const floorLevel = 0;

                if (boundingBox.min.y < floorLevel) {
                    const offset = floorLevel - boundingBox.min.y;
                    object.position.y += offset;
                }
            }
        });
        scene.add(transformControls.getHelper());
        transformControlsRef.current = transformControls;

        const raycaster = new Three.Raycaster();
        const mouse = new Three.Vector2();

        const onPointerDown = () => {
            isDragging = false;
        }

        function onPointerUp(event: MouseEvent) {
            if (isDragging || orbitControls.enabled === false) return;

            const canvasBounds = canvasRef.current!.getBoundingClientRect();
            mouse.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
            mouse.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(objectsRef.current, false);

            if (intersects.length > 0) {
                const newSelectedObject = intersects[0].object as Three.Mesh;
                const objectUUID = newSelectedObject.name;

                if (objectUUID) {
                    setSelectedObject(objectUUID);
                }
            }
        }
        canvasRef.current.addEventListener('pointerdown', onPointerDown);
        canvasRef.current.addEventListener('pointerup', onPointerUp);

        function animate() {
            requestAnimationFrame(animate);

            orbitControls.update();
            composer.render();
        }

        animate();

        return () => {
            canvasRef.current?.removeEventListener('pointerdown', onPointerDown);
            transformControls.dispose();
            orbitControls.dispose();
        };
    }, []);

    useEffect(() => {
        const scene = sceneRef.current;
        const transformControls = transformControlsRef.current;
        const outlinePass = outlinePassRef.current;

        if (!scene || !transformControls || !outlinePass) return;

        const sceneMeshes = objectsRef.current;
        const storeObjects = objects; 
        const meshesToRemove = sceneMeshes.filter(mesh =>
            !storeObjects.some(obj => obj.uuid === mesh.name)
        );
        meshesToRemove.forEach(mesh => {
            scene.remove(mesh);
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => m.dispose());
            } else {
                mesh.material.dispose();
            }
        });

        const objectsToAdd = storeObjects.filter(obj =>
            !sceneMeshes.some(mesh => mesh.name === obj.uuid)
        );
        objectsToAdd.forEach(obj => {
            const geometry = getGeometryForComponent(obj.componentId);
            const material = getMaterialForComponent(obj.materialId);
            geometry.computeBoundingBox();
            const height = geometry.boundingBox!.max.y - geometry.boundingBox!.min.y;

            const newMesh = new Three.Mesh(geometry, material);
            newMesh.name = obj.uuid; 
            newMesh.position.y = height / 2 + 0.01;
            scene.add(newMesh);
            objectsRef.current.push(newMesh);
        });

        sceneMeshes.forEach(mesh => {
            const correspondingObject = storeObjects.find(obj => obj.uuid === mesh.name);
            if (correspondingObject && (mesh.material as Three.Material) !== getMaterialForComponent(correspondingObject.materialId)) {
                (mesh.material as Three.Material).dispose();
                mesh.material = getMaterialForComponent(correspondingObject.materialId);
            }
        });
        objectsRef.current = scene.children.filter(child => child instanceof Three.Mesh && child.name) as Three.Mesh[];

        const selectedMesh = sceneMeshes.find(mesh => mesh.name === selectedObjectId);

        if (selectedMesh) {
            transformControls.attach(selectedMesh);
            outlinePass.selectedObjects = [selectedMesh];
        } else {
            if (transformControls.object) {
                transformControls.detach();
                outlinePass.selectedObjects = [];
            }
        }

    }, [objects, selectedObjectId]);

    useEffect(() => {
        const transformControls = transformControlsRef.current;
        if (transformControls) {
            transformControls.setMode(transformMode)
        }
    }, [transformMode])

    return (
        <div>
            <canvas ref={canvasRef} id="bg">
            </canvas>
        </div>
    )
})