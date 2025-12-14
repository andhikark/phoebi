import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import React, { useRef, useEffect, useImperativeHandle } from 'react';
import type { ComponentId, MaterialId, TransformMode } from '../types/domain';

import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { useDesignStore, type SceneGroup } from '../state/DesignStore';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import bicycleModelUrl from '../assets/blueprint/bicycle.glb'; 
import { metalMaterial, newCardboardMaterial, plasticMaterial, recycledCardboardMaterial, woodMaterial } from '../data/materials';

interface LearningSpaceProps {
    transformMode: TransformMode
    lightIntensity: number
    showBlueprint: boolean;
}

export interface LearningSpaceHandle {
    deleteSelectedObject: () => void;
    glueObjects: (uuid1: string, uuid2: string) => void;
    findTouchingObjectUuid: (selectedUuid: string) => string | null;
}



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
            return recycledCardboardMaterial;
        case 'metal':
            return metalMaterial;
        case 'plastic':
        case 'recycled_plastic':
            return plasticMaterial;
        case 'wood':
            return woodMaterial;
        default:
            return newCardboardMaterial
    }
}

export const LearningSpace = React.forwardRef<LearningSpaceHandle, LearningSpaceProps>(({ transformMode, lightIntensity, showBlueprint }, ref) => {
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<Three.Scene>(null);
    const cameraRef = useRef<Three.PerspectiveCamera>(null);
    const rendererRef = useRef<Three.WebGLRenderer>(null);
    const orbitControlsRef = useRef<OrbitControls>(null);
    const transformControlsRef = useRef<TransformControls>(null);
    const objectsRef = useRef<Three.Object3D[]>([]);
    const composerRef = useRef<EffectComposer>(null);
    const outlinePassRef = useRef<OutlinePass>(null);
    const lightRef = useRef<Three.DirectionalLight>(null);
    const lightHelperRef = useRef<Three.DirectionalLightHelper>(null);
    const ambientLightRef = useRef<Three.AmbientLight | null>(null);
    const hemisphereLightRef = useRef<Three.HemisphereLight | null>(null);
    const objectStateRef = useRef<Map<string, { lastSafePos: Three.Vector3 }>>(new Map());
    const blueprintRef = useRef<Three.Group | null>(null);

    const { sceneItems, selectedItemId, setSelectedItemId, updateItemTransform, glueObjects } = useDesignStore();

    useImperativeHandle(ref, () => ({
        deleteSelectedObject: () => {
            const transformControls = transformControlsRef.current;
            const scene = sceneRef.current;
            const outlinePass = outlinePassRef.current;

            if (!transformControls?.object || !scene) return;

            const objectToDelete = transformControls.object;

            transformControls.detach();
            if (objectToDelete === lightRef.current) return;

            if (outlinePass) {
                outlinePass.selectedObjects = [];
            }

            scene.remove(objectToDelete);

            objectsRef.current = objectsRef.current.filter(obj => obj.uuid !== objectToDelete.uuid);
            objectStateRef.current.delete(objectToDelete.name);

            if (objectToDelete instanceof Three.Mesh) {
                objectToDelete.geometry.dispose();
                if (Array.isArray(objectToDelete.material)) {
                    objectToDelete.material.forEach(m => m.dispose());
                } else {
                    objectToDelete.material.dispose();
                }
            }
        },
        glueObjects: (uuid1, uuid2) => {
            const scene = sceneRef.current;
            if (!scene) return;

            const obj1 = scene.getObjectByName(uuid1);
            const obj2 = scene.getObjectByName(uuid2);

            if (!obj1 || !obj2) return;

            // 1. Flatten the inputs: get all individual meshes from obj1 and obj2. 
            const allMeshes: Three.Mesh[] = []; 
            [obj1, obj2].forEach(obj => { 
                if (obj.type === 'Group') { 
                    // If it's a group, add its children (which are meshes) 
                    allMeshes.push(...(obj.children as Three.Mesh[])); 
                } else if (obj.type === 'Mesh') { 
                    // If it's a mesh, add it directly 
                    allMeshes.push(obj as Three.Mesh); 
                } 
            }); 

            // 2. Calculate the new group's center based on the world position of all meshes. 
            const worldPositions = allMeshes.map(mesh => mesh.getWorldPosition(new Three.Vector3())); 
            const centerBox = new Three.Box3().setFromPoints(worldPositions); 
            const groupPosition = centerBox.getCenter(new Three.Vector3()); 

            // 3. Use a temporary group and .attach() to calculate correct local positions. 
            const tempGroup = new Three.Group(); 
            tempGroup.position.copy(groupPosition); 
            scene.add(tempGroup); // Add temporarily to scene for attach to work 
            allMeshes.forEach(mesh => tempGroup.attach(mesh)); 
            scene.remove(tempGroup); // Clean up temporary group 

            // 4. Prepare the data structure for the Zustand store. 
            const groupData: SceneGroup = { 
                type: 'group', 
                uuid: `group-${Three.MathUtils.generateUUID()}`, 
                position: groupPosition.toArray(), 
                rotation: [0, 0, 0], 
                scale: [1, 1, 1], 
                children: allMeshes.map(child => ({ 
                    type: 'mesh', 
                    uuid: child.name, 
                    componentId: (child as any).userData.componentId, 
                    materialId: (child as any).userData.materialId, 
                    position: child.position.toArray(), 
                    rotation: child.rotation.toArray().slice(0, 3) as [number, number, number], 
                    scale: child.scale.toArray() as [number, number, number], 
                })) 
            }; 

            // 5. Call the store action. 
            glueObjects(groupData, [uuid1, uuid2]); 
        },
        findTouchingObjectUuid: (selectedUuid: string) => { 
            const scene = sceneRef.current; 
            if (!scene) return null; 

            const selectedObject = objectsRef.current.find(obj => obj.name === selectedUuid); 
            if (!selectedObject) return null; 

            const selectedBox = new Three.Box3().setFromObject(selectedObject); 

            // Find the first object that is touching the selected one 
            for (const otherObject of objectsRef.current) { 
                if (otherObject.name === selectedUuid) continue; 

                const otherBox = new Three.Box3().setFromObject(otherObject); 
                if (selectedBox.intersectsBox(otherBox)) { 
                    return otherObject.name; // Return the UUID of the touching object 
                } 
            } 

            return null; // No touching object found 
        } 
    }));

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const scene = new Three.Scene();
        scene.background = new Three.Color(0xbfd1e5);
        sceneRef.current = scene;

        const camera = new Three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        cameraRef.current = camera;

        const renderer = new Three.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
        });
        rendererRef.current = renderer;

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = Three.PCFSoftShadowMap; 
        renderer.toneMapping = Three.ACESFilmicToneMapping;
        renderer.outputColorSpace = Three.SRGBColorSpace;

        const floorGeometry = new Three.PlaneGeometry(2000, 2000);
        const floorMaterial = new Three.MeshStandardMaterial({
            color: 0x808080,
            side: Three.DoubleSide
        });
        const floor = new Three.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;
        floor.receiveShadow = true;
        scene.add(floor);

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.setZ(30);

        const hemisphereLight = new Three.HemisphereLight(0xffffff, 0x444444, 0.5); // Sky color, ground color, intensity
        scene.add(hemisphereLight);
        hemisphereLightRef.current = hemisphereLight;

        const directionalLight = new Three.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(50, 50, 50); // Position the light source
        directionalLight.castShadow = true;

        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.maxPolarAngle = Math.PI / 2;
        orbitControlsRef.current = orbitControls;

        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;

        lightRef.current = directionalLight;
        scene.add(directionalLight);

        const lightHelper = new Three.DirectionalLightHelper(directionalLight, 5); // Use DirectionalLightHelper
        lightHelperRef.current = lightHelper;
        const gridHelper = new Three.GridHelper(2000, 2000);
        scene.add(lightHelper, gridHelper);

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
            if (!event.value) { // Drag End
                const object = transformControls.object;
                if (object) {
                    updateItemTransform(
                        object.name,
                        object.position.toArray(),
                        object.rotation.toArray().slice(0, 3) as [number, number, number],
                        object.scale.toArray() as [number, number, number]
                    );
                }
            }
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
                if (object.name) { 
                    const movingBox = new Three.Box3().setFromObject(object); 
                    for (const otherMesh of objectsRef.current) { 
                        if (otherMesh === object) continue; 

                        const otherBox = new Three.Box3().setFromObject(otherMesh); 
                        if (movingBox.intersectsBox(otherBox)) { 
                            
                            // Calculate the vector from the other object to the moving one
                            const movingCenter = new Three.Vector3(); 
                            movingBox.getCenter(movingCenter); 
                            const otherCenter = new Three.Vector3(); 
                            otherBox.getCenter(otherCenter); 
                            
                            // Calculate overlap on each axis
                            const overlap = new Three.Vector3(); 
                            overlap.x = Math.min(movingBox.max.x, otherBox.max.x) - Math.max(movingBox.min.x, otherBox.min.x); 
                            overlap.y = Math.min(movingBox.max.y, otherBox.max.y) - Math.max(movingBox.min.y, otherBox.min.y); 
                            overlap.z = Math.min(movingBox.max.z, otherBox.max.z) - Math.max(movingBox.min.z, otherBox.min.z); 

                            // Find the axis with the minimum overlap (this is the axis to push out on)
                            if (overlap.x < overlap.y && overlap.x < overlap.z) { 
                                const sign = Math.sign(movingCenter.x - otherCenter.x); 
                                object.position.x += (overlap.x * sign); 
                            } else if (overlap.y < overlap.z) { 
                                const sign = Math.sign(movingCenter.y - otherCenter.y); 
                                object.position.y += (overlap.y * sign); 
                            } else { 
                                const sign = Math.sign(movingCenter.z - otherCenter.z); 
                                object.position.z += (overlap.z * sign); 
                            } 
                        } 
                    } 

                    const state = objectStateRef.current.get(object.name); 
                    if (state) { 
                        // Always update the safe position after resolution
                        state.lastSafePos.copy(object.position); 
                    }
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
            const intersects = raycaster.intersectObjects(objectsRef.current, true);

            if (intersects.length > 0) {
                let newSelectedObject = intersects[0].object;
                while (newSelectedObject.parent && newSelectedObject.parent !== scene) { 
                    newSelectedObject = newSelectedObject.parent; 
                } 
                const objectUUID = newSelectedObject.name;

                if (objectUUID) {
                    setSelectedItemId(objectUUID);
                }
            } else {
                const lightIntersects = lightHelper ? raycaster.intersectObject(lightHelper, true) : [];
                if (lightIntersects.length > 0) {
                    transformControls.attach(directionalLight);
                    if (outlinePassRef.current) outlinePassRef.current.selectedObjects = [lightHelper];
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
        if (!lightRef.current || !hemisphereLightRef.current) return;
        const t = (lightIntensity - 1) / 99;

        const minDirectionalIntensity = 0.1;
        const maxDirectionalIntensity = 4.0;

        const minHemisphereIntensity = 0.0;
        const maxHemisphereIntensity = 1.5;

        lightRef.current.intensity = Three.MathUtils.lerp(minDirectionalIntensity, maxDirectionalIntensity, t);
        hemisphereLightRef.current.intensity = Three.MathUtils.lerp(minHemisphereIntensity, maxHemisphereIntensity, t);

        if (lightHelperRef.current) {
            lightHelperRef.current.update();
        }
    }, [lightIntensity])

    useEffect(() => {
        const scene = sceneRef.current;
        const transformControls = transformControlsRef.current;
        const outlinePass = outlinePassRef.current;

        if (!scene || !transformControls || !outlinePass) return;

        objectsRef.current.forEach(obj => { 
            scene.remove(obj); 
        }); 
        objectsRef.current = []; 
        objectStateRef.current.clear(); 

       sceneItems.forEach(item => { 
            if (item.type === 'group') { 
                const group = new Three.Group(); 
                group.name = item.uuid; 

                if (item.position) group.position.fromArray(item.position); 
                if (item.rotation) group.rotation.fromArray(item.rotation); 
                if (item.scale) group.scale.fromArray(item.scale);

                item.children.forEach(childMesh => { 
                    const geometry = getGeometryForComponent(childMesh.componentId); 
                    const material = getMaterialForComponent(childMesh.materialId); 
                    const mesh = new Three.Mesh(geometry, material); 
                    mesh.name = childMesh.uuid; 
                    // Note: Positions of children are relative to the group. 
                    // The .attach() method used during gluing handled this. 
                    mesh.userData = { componentId: childMesh.componentId, materialId: childMesh.materialId }; 
                    
                    // Set child's LOCAL transform from store data 
                    if (childMesh.position) mesh.position.fromArray(childMesh.position); 
                    if (childMesh.rotation) mesh.rotation.fromArray(childMesh.rotation); 
                    if (childMesh.scale) mesh.scale.fromArray(childMesh.scale);
                    group.add(mesh); 
                }); 

                scene.add(group); 
                objectsRef.current.push(group); 
                // Note: Collision state for groups would need to be handled differently. 

            } else {
                const geometry = getGeometryForComponent(item.componentId);
                const material = getMaterialForComponent(item.materialId);
                const newMesh = new Three.Mesh(geometry, material);
                newMesh.name = item.uuid;

                newMesh.userData = { componentId: item.componentId, materialId: item.materialId };

                if (!item.position) {
                    geometry.computeBoundingBox();
                    const size = new Three.Vector3();
                    geometry.boundingBox!.getSize(size);
                    let spawnPosition = new Three.Vector3(0, size.y / 2 + 0.01, 0);
                    let isOccupied = true, attempts = 0;
                    while (isOccupied && attempts < 100) {
                        isOccupied = false;
                        const prospectiveBBox = new Three.Box3().setFromCenterAndSize(spawnPosition, size);
                        for (const existing of objectsRef.current) {
                            if (prospectiveBBox.intersectsBox(new Three.Box3().setFromObject(existing))) {
                                isOccupied = true;
                                spawnPosition.x += size.x + 2;
                                break;
                            }
                        }
                        attempts++;
                    }
                    newMesh.position.copy(spawnPosition);
                    updateItemTransform(item.uuid, spawnPosition.toArray(), [0, 0, 0], [1, 1, 1]);
                } else {
                    newMesh.position.fromArray(item.position);
                    if (item.rotation) newMesh.rotation.fromArray(item.rotation);
                    if (item.scale) newMesh.scale.fromArray(item.scale);
                }
                scene.add(newMesh);
                objectsRef.current.push(newMesh);
                objectStateRef.current.set(newMesh.name, { lastSafePos: newMesh.position.clone() });
            }
        }); 

        // 3. Update selection based on the store. 
        const selectedObjectInScene = objectsRef.current.find(obj => obj.name === selectedItemId); 

        if (selectedObjectInScene) { 
            transformControls.attach(selectedObjectInScene); 
            outlinePass.selectedObjects = [selectedObjectInScene]; 
        } else { 
            if (transformControls.object) { 
                transformControls.detach(); 
                outlinePass.selectedObjects = []; 
            } 
        } 

    }, [sceneItems, selectedItemId]);

    useEffect(() => {
        const transformControls = transformControlsRef.current;
        if (transformControls) {
            transformControls.setMode(transformMode)
        }
    }, [transformMode])

    useEffect(() => { 
        const scene = sceneRef.current; 
        if (!scene) return; 

        // If blueprint is requested and not yet loaded 
        if (showBlueprint && !blueprintRef.current) { 
            const loader = new GLTFLoader(); 
            loader.load(bicycleModelUrl, (gltf) => { 
                const blueprintGroup = new Three.Group(); 
                const blueprintMaterial = new Three.LineBasicMaterial({ color: 0xffff, transparent: true, opacity: 0.5 }); 

                gltf.scene.traverse((child) => { 
                    if (child instanceof Three.Mesh) { 
                        const edges = new Three.EdgesGeometry(child.geometry); 
                        const line = new Three.LineSegments(edges, blueprintMaterial); 
                        line.position.copy(child.position); 
                        line.rotation.copy(child.rotation); 
                        line.scale.copy(child.scale); 
                        blueprintGroup.add(line); 
                    } 
                }); 

                const box = new Three.Box3().setFromObject(blueprintGroup); 
                const center = box.getCenter(new Three.Vector3()); 
                blueprintGroup.position.sub(center).add(new Three.Vector3(0, box.getSize(new Three.Vector3()).y / 2, 0)); 
                
                scene.add(blueprintGroup); 
                blueprintRef.current = blueprintGroup; 
            }); 
        } else if (blueprintRef.current) { 
            // If blueprint is already loaded, just toggle its visibility 
            blueprintRef.current.visible = showBlueprint; 
        } 
    }, [showBlueprint]);

    return (
        <div>
            <canvas ref={canvasRef} id="bg">
            </canvas>
        </div>
    )
})