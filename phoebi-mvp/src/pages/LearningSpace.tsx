import * as Three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import React, { useRef, useEffect, useImperativeHandle } from 'react';
import type { MaterialId, TransformMode } from '../types/domain';

import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { useDesignStore, type SceneGroup, type SceneItem, type SceneObject } from '../state/DesignStore';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import bicycleModelUrl from '../assets/blueprint/bicycle.glb';
import { metalMaterial, newCardboardMaterial, plasticMaterial, recycledCardboardMaterial, woodMaterial } from '../data/materials';
import skyboxNx from "../assets/skybox/clouds horizon/jettelly_blue_sky_BACK.png"
import skyboxNy from "../assets/skybox/clouds horizon/jettelly_blue_sky_DOWN.png"
import skyboxNz from "../assets/skybox/clouds horizon/jettelly_blue_sky_LEFT.png"
import skyboxPx from "../assets/skybox/clouds horizon/jettelly_blue_sky_FRONT.png"
import skyboxPy from "../assets/skybox/clouds horizon/jettelly_blue_sky_UP.png"
import skyboxPz from "../assets/skybox/clouds horizon/jettelly_blue_sky_RIGHT.png"
import { getCachedModel } from '../logic/loadmodel';
import { newUuid } from '../logic/util';


interface LearningSpaceProps {
    transformMode: TransformMode
    lightIntensity: number
    showBlueprint: boolean;
    collisionEnabled: boolean;
}

export interface LearningSpaceHandle {
    deleteSelectedObject: () => void;
    glueObjects: (uuid1: string, uuid2: string) => void;
    findTouchingObjectUuid: (selectedUuid: string) => string | null;
    deglueObject: (groupUuid: string) => void;
    duplicateObject: () => void;
}

function extractObjects(item: SceneItem): SceneObject[] {
    if (item.type === "object") return [item];
    return item.children.flatMap(extractObjects);
}

function setCubeSkybox(
    scene: Three.Scene,
    renderer: Three.WebGLRenderer,
    urls: {
        px: string;
        nx: string;
        py: string;
        ny: string;
        pz: string;
        nz: string;
    }
) {
    const loader = new Three.CubeTextureLoader();

    const cube = loader.load([
        urls.px,
        urls.nx,
        urls.py,
        urls.ny,
        urls.pz,
        urls.nz,
    ]);

    cube.colorSpace = Three.SRGBColorSpace;

    // background (what you see)
    scene.background = cube;

    // environment (what lights/reflections use) -> blur/filter via PMREM
    const pmrem = new Three.PMREMGenerator(renderer);
    pmrem.compileCubemapShader();

    const envMap = pmrem.fromCubemap(cube).texture;

    // Dispose previous env map if you ever re-call this
    const prevEnv = scene.environment as Three.Texture | null;
    scene.environment = envMap;

    // tune this (start low)
    scene.environmentIntensity = 0.15;

    // cleanup
    if (prevEnv) prevEnv.dispose();
    pmrem.dispose();
}


function cloneSceneItemWithNewUuids(item: SceneItem): SceneItem {
    if (item.type === "object") {
        return {
            ...item,
            uuid: newUuid("obj"),
        };
    }

    // group
    const newGroupUuid = newUuid("group");

    const clonedChildren = item.children.map((c) => {
        if (c.type === "object") {
            return { ...c, uuid: newUuid("obj") };
        }
        // if you ever allow nested groups, recurse:
        return cloneSceneItemWithNewUuids(c) as any;
    });

    return {
        ...item,
        uuid: newGroupUuid,
        children: clonedChildren as any,
    };
}

const getMaterialForComponent = (id: MaterialId) => {
    switch (id) {
        case "metal":
            return metalMaterial;

        case "plastic":
            return plasticMaterial;

        case "recycled_plastic":
            return plasticMaterial; // later you can swap to a real recycled texture

        case "wood":
            return woodMaterial;

        case "cardboard":
            return recycledCardboardMaterial; // or newCardboardMaterial if you prefer

        default:
            return newCardboardMaterial;
    }
};


export const LearningSpace = React.forwardRef<LearningSpaceHandle, LearningSpaceProps>(({ transformMode, lightIntensity, showBlueprint, collisionEnabled }, ref) => {

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
    const hemisphereLightRef = useRef<Three.HemisphereLight | null>(null);
    const objectStateRef = useRef<Map<string, { lastSafePos: Three.Vector3 }>>(new Map());
    const blueprintRef = useRef<Three.Group | null>(null);
    const collisionEnabledRef = useRef(true);

    const { sceneItems, selectedItemId, setSelectedItemId, updateItemTransform, glueObjects, deglueObject } = useDesignStore();

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
            const store = useDesignStore.getState();

            const item1 = store.sceneItems.find(i => i.uuid === uuid1);
            const item2 = store.sceneItems.find(i => i.uuid === uuid2);
            if (!item1 || !item2) return;

            // Flatten into leaf SceneObjects
            const leaves: SceneObject[] = [
                ...extractObjects(item1),
                ...extractObjects(item2),
            ];

            const scene = sceneRef.current!;
            if (!scene) return;

            // --- 1) Build a world-space bounding box over all leaf objects ---
            const box = new Three.Box3();
            let hasAny = false;

            for (const leaf of leaves) {
                const obj = scene.getObjectByName(leaf.uuid);
                if (!obj) continue;
                obj.updateWorldMatrix(true, true);
                box.union(new Three.Box3().setFromObject(obj));
                hasAny = true;
            }

            if (!hasAny) return;

            const center = box.getCenter(new Three.Vector3());

            // --- 2) group inverse (world->group local). group has only translation for now ---
            const groupWorld = new Three.Matrix4().makeTranslation(center.x, center.y, center.z);
            const groupInv = groupWorld.clone().invert();

            // --- 3) Convert every leaf’s WORLD transform into GROUP-LOCAL transform ---
            const localChildren: SceneObject[] = leaves.map((leaf) => {
                const obj = scene.getObjectByName(leaf.uuid);
                if (!obj) return leaf; // fallback (shouldn't happen normally)

                obj.updateWorldMatrix(true, true);

                const localM = groupInv.clone().multiply(obj.matrixWorld);

                const p = new Three.Vector3();
                const q = new Three.Quaternion();
                const s = new Three.Vector3();
                localM.decompose(p, q, s);

                const e = new Three.Euler().setFromQuaternion(q, "XYZ");

                return {
                    ...leaf,
                    position: p.toArray() as [number, number, number],
                    rotation: [e.x, e.y, e.z] as [number, number, number],
                    scale: s.toArray() as [number, number, number],
                };
            });

            // --- 4) Create group ---
            const newGroup: SceneGroup = {
                type: "group",
                uuid: `group-${crypto.randomUUID()}`,
                children: localChildren,
                position: center.toArray(),
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
            };

            // IMPORTANT: remove the *top-level* items you glued (uuid1, uuid2)
            glueObjects(newGroup, [uuid1, uuid2]);
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

            return null;
        },
        deglueObject: (groupUuid: string) => {
            const scene = sceneRef.current;
            if (!scene) return;

            const groupObj = scene.getObjectByName(groupUuid);
            if (!groupObj) return;

            groupObj.updateWorldMatrix(true, true);

            const store = useDesignStore.getState();
            const groupItem = store.sceneItems.find(
                (i) => i.type === "group" && i.uuid === groupUuid
            ) as SceneGroup | undefined;
            if (!groupItem) return;

            const childrenWorld: SceneObject[] = [];

            for (const child of groupItem.children.flatMap(extractObjects)) {
                const childObj = scene.getObjectByName(child.uuid);
                if (!childObj) continue;

                childObj.updateWorldMatrix(true, false);

                const pos = new Three.Vector3();
                const quat = new Three.Quaternion();
                const scl = new Three.Vector3();
                childObj.matrixWorld.decompose(pos, quat, scl);

                const eul = new Three.Euler().setFromQuaternion(quat, "XYZ");

                childrenWorld.push({
                    ...child,
                    type: "object",
                    position: pos.toArray() as [number, number, number],
                    rotation: [eul.x, eul.y, eul.z] as [number, number, number],
                    scale: scl.toArray() as [number, number, number],
                });
            }

            deglueObject(groupUuid, childrenWorld);
        },
        duplicateObject: () => {
            const store = useDesignStore.getState();
            const { sceneItems, selectedItemId, addObject, addGroup } = store;

            if (!selectedItemId) return;

            const src = sceneItems.find((i) => i.uuid === selectedItemId);
            if (!src) return;

            // 1) clone with new uuids (supports group + children)
            const copy = cloneSceneItemWithNewUuids(src);

            // 2) base offset so it’s not exactly on top
            const baseOffset: [number, number, number] = [2, 0, 2];
            const p = (copy.position ?? [0, 0, 0]) as [number, number, number];
            copy.position = [p[0] + baseOffset[0], p[1] + baseOffset[1], p[2] + baseOffset[2]];

            // 3) optional: collision-free placement (your existing logic, but DO NOT mutate 'off.y')
            const scene = sceneRef.current;
            if (scene) {
                const floorY = 0;
                const padding = 0.15;
                const step = 2.0;
                const rings = 25;

                const tempBox = new Three.Box3();
                const tempOther = new Three.Box3();

                const buildBox = (obj: Three.Object3D, out: Three.Box3) => {
                    obj.updateWorldMatrix(true, true);
                    out.setFromObject(obj);
                    return out;
                };

                const snapToFloor = (obj: Three.Object3D) => {
                    buildBox(obj, tempBox);
                    if (tempBox.min.y < floorY) obj.position.y += (floorY - tempBox.min.y);
                };

                function* spiralOffsets() {
                    yield new Three.Vector3(0, 0, 0);
                    for (let r = 1; r <= rings; r++) {
                        const min = -r, max = r;
                        for (let x = min; x <= max; x++) yield new Three.Vector3(x * step, 0, max * step);
                        for (let z = max - 1; z >= min; z--) yield new Three.Vector3(max * step, 0, z * step);
                        for (let x = max - 1; x >= min; x--) yield new Three.Vector3(x * step, 0, min * step);
                        for (let z = min + 1; z <= max - 1; z++) yield new Three.Vector3(min * step, 0, z * step);
                    }
                }

                const buildTempThreeObject = (it: SceneItem): Three.Object3D | null => {
                    if (it.type === "object") {
                        const model = getCachedModel(it.componentId);
                        if (!model) return null;
                        const obj = model.clone(true);
                        obj.position.fromArray(it.position ?? [0, 0, 0]);
                        obj.rotation.fromArray((it.rotation ?? [0, 0, 0]) as any);
                        obj.scale.fromArray(it.scale ?? [1, 1, 1]);
                        return obj;
                    }

                    const group = new Three.Group();
                    group.position.fromArray(it.position ?? [0, 0, 0]);
                    group.rotation.fromArray((it.rotation ?? [0, 0, 0]) as any);
                    group.scale.fromArray(it.scale ?? [1, 1, 1]);

                    for (const child of it.children) {
                        const temp = buildTempThreeObject(child);
                        if (temp) group.add(temp);
                    }
                    return group;
                };

                const tempObj = buildTempThreeObject(copy);
                if (tempObj) {
                    // existing boxes in scene
                    const existingBoxes: Three.Box3[] = [];
                    for (const o of objectsRef.current) {
                        buildBox(o, tempOther);
                        existingBoxes.push(tempOther.clone().expandByScalar(padding));
                    }

                    // start from copy.position (important)
                    tempObj.position.fromArray(copy.position ?? [0, 0, 0]);
                    snapToFloor(tempObj);

                    buildBox(tempObj, tempBox);
                    const baseBox = tempBox.clone().expandByScalar(padding);
                    const basePos = tempObj.position.clone();

                    let chosen = basePos;
                    for (const off of spiralOffsets()) {
                        const test = baseBox.clone().translate(off);

                        // do NOT mutate `off.y`; use a local yOff only
                        if (test.min.y < floorY) {
                            const yOff = floorY - test.min.y;
                            test.translate(new Three.Vector3(0, yOff, 0));
                        }

                        let blocked = false;
                        for (const b of existingBoxes) {
                            if (test.intersectsBox(b)) { blocked = true; break; }
                        }
                        if (!blocked) {
                            chosen = basePos.clone().add(off);
                            // floor snap for chosen
                            chosen.y += Math.max(0, floorY - test.min.y);
                            break;
                        }
                    }

                    copy.position = [chosen.x, chosen.y, chosen.z];
                }
            }

            // 4) commit ONE way
            if (copy.type === "object") {
                addObject(copy.componentId, copy.materialId, {
                    position: copy.position,
                    rotation: copy.rotation,
                    scale: copy.scale,
                });
            } else {
                addGroup(copy); // addGroup should also set selectedItemId = copy.uuid
            }
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
            color: 0xded6cb,
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

                const minScale = 0.1;
                const maxScale = 10;

                object.scale.x = Three.MathUtils.clamp(object.scale.x, minScale, maxScale);
                object.scale.y = Three.MathUtils.clamp(object.scale.y, minScale, maxScale);
                object.scale.z = Three.MathUtils.clamp(object.scale.z, minScale, maxScale);

                const s = object.scale.x;
                object.scale.set(s, s, s);

                if (boundingBox.min.y < floorLevel) {
                    const offset = floorLevel - boundingBox.min.y;
                    object.position.y += offset;
                }
                if (!collisionEnabledRef.current) return;
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

        renderer.toneMappingExposure = 0.8;
        scene.environmentIntensity = 0.7; // r152+

        setCubeSkybox(scene, renderer, {
            px: skyboxPx,
            nx: skyboxNx,
            py: skyboxPy,
            ny: skyboxNy,
            pz: skyboxPz,
            nz: skyboxNz,
        });

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
        const renderer = rendererRef.current;
        if (!renderer) return;
        const scene = sceneRef.current;
        if (!scene) return;
        if (!lightRef.current || !hemisphereLightRef.current) return;
        const t = (lightIntensity - 1) / 99;


        const minDirectionalIntensity = 0.1;
        const maxDirectionalIntensity = 4.0;

        const minHemisphereIntensity = 0.0;
        const maxHemisphereIntensity = 1.5;

        const minExposure = 0.6;
        const maxExposure = 1.4;

        lightRef.current.intensity = Three.MathUtils.lerp(minDirectionalIntensity, maxDirectionalIntensity, t);
        hemisphereLightRef.current.intensity = Three.MathUtils.lerp(minHemisphereIntensity, maxHemisphereIntensity, t);

        if (lightHelperRef.current) {
            lightHelperRef.current.update();
        }
        renderer.toneMappingExposure = Three.MathUtils.lerp(
            minExposure,
            maxExposure,
            t
        );
        scene.environmentIntensity = Three.MathUtils.lerp(0.3, 1.2, t);
    }, [lightIntensity])

    useEffect(() => {
        const scene = sceneRef.current;
        const transformControls = transformControlsRef.current;
        const outlinePass = outlinePassRef.current;
        const camera = cameraRef.current;

        if (!scene || !transformControls || !outlinePass || !camera) return;

        // Clear old objects
        objectsRef.current.forEach(obj => scene.remove(obj));
        objectsRef.current = [];
        objectStateRef.current.clear();

        const floorY = 0;
        const padding = 0.15;     // spacing between objects
        const step = 2.0;         // search step in XZ
        const rings = 25;         // how far to search

        const tempBox = new Three.Box3();
        const tempOtherBox = new Three.Box3();

        function buildWorldBox(obj: Three.Object3D, out: Three.Box3) {
            obj.updateWorldMatrix(true, true);
            out.setFromObject(obj);
            return out;
        }

        function snapToFloor(obj: Three.Object3D) {
            buildWorldBox(obj, tempBox);
            if (tempBox.min.y < floorY) {
                obj.position.y += (floorY - tempBox.min.y);
            }
        }

        function isBlocked(testBox: Three.Box3, existingBoxes: Three.Box3[]) {
            for (const b of existingBoxes) {
                if (testBox.intersectsBox(b)) return true;
            }
            return false;
        }

        // generate a simple square spiral offsets list (0, then ring by ring)
        function* spiralOffsets() {
            yield new Three.Vector3(0, 0, 0);

            for (let r = 1; r <= rings; r++) {
                const min = -r, max = r;

                for (let x = min; x <= max; x++) yield new Three.Vector3(x * step, 0, max * step);
                for (let z = max - 1; z >= min; z--) yield new Three.Vector3(max * step, 0, z * step);
                for (let x = max - 1; x >= min; x--) yield new Three.Vector3(x * step, 0, min * step);
                for (let z = min + 1; z <= max - 1; z++) yield new Three.Vector3(min * step, 0, z * step);
            }
        }

        // While we rebuild, keep boxes of already-added objects so new ones can avoid them
        const placedBoxes: Three.Box3[] = [];

        // optional: a decent default desired spawn position (in front of camera)
        function getRaycastDesiredPos(): {
            point: Three.Vector3;
            normal: Three.Vector3;
        } {
            const raycaster = new Three.Raycaster();

            if (!camera) {
                return {
                    point: new Three.Vector3(0, 0, 0),
                    normal: new Three.Vector3(0, 1, 0),
                };
            }

            // cast from camera center
            raycaster.setFromCamera(new Three.Vector2(0, 0), camera);

            // raycast against existing objects
            const hits = raycaster.intersectObjects(objectsRef.current, true);

            if (hits.length > 0) {
                const hit = hits[0];

                const normal = hit.face
                    ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
                    : new Three.Vector3(0, 1, 0);

                return {
                    point: hit.point.clone(),
                    normal,
                };
            }

            // fallback: infinite floor plane
            const plane = new Three.Plane(new Three.Vector3(0, 1, 0), -floorY);
            const point = new Three.Vector3();
            raycaster.ray.intersectPlane(plane, point);

            return {
                point,
                normal: new Three.Vector3(0, 1, 0),
            };
        }


        sceneItems.forEach((item) => {
            let newObject: Three.Object3D | null = null;

            if (item.type === "group") {
                const group = new Three.Group();
                group.name = item.uuid;

                if (item.position) group.position.fromArray(item.position);
                if (item.rotation) group.rotation.fromArray(item.rotation as any);
                if (item.scale) group.scale.fromArray(item.scale);

                item.children.forEach((child) => {
                    if (child.type !== "object") return;

                    const model = getCachedModel(child.componentId);
                    if (!model) return;

                    const childObj = model.clone(true);
                    childObj.name = child.uuid;

                    const mat = getMaterialForComponent(child.materialId);
                    childObj.traverse((m) => {
                        if (m instanceof Three.Mesh) m.material = mat;
                    });

                    if (child.position) childObj.position.fromArray(child.position);
                    if (child.rotation) childObj.rotation.fromArray(child.rotation as any);
                    if (child.scale) childObj.scale.fromArray(child.scale);

                    group.add(childObj);
                });

                newObject = group;
            }

            if (item.type === "object") {
                const model = getCachedModel(item.componentId);
                if (!model) return;

                const obj = model.clone(true);
                obj.name = item.uuid;

                const mat = getMaterialForComponent(item.materialId);
                obj.traverse((m) => {
                    if (m instanceof Three.Mesh) m.material = mat;
                });

                if (item.position) obj.position.fromArray(item.position);
                if (item.rotation) obj.rotation.fromArray(item.rotation as any);
                if (item.scale) obj.scale.fromArray(item.scale);

                newObject = obj;
            }

            if (!newObject) return;
            const isNew = !item.position;

            if (isNew) {
                const { point, normal } = getRaycastDesiredPos();

                // offset along surface normal so we don’t spawn inside geometry
                const surfaceOffset = 0.5;
                newObject.position.copy(
                    point.clone().add(normal.normalize().multiplyScalar(surfaceOffset))
                );

                snapToFloor(newObject);

                // 2) build base box (expanded for spacing)
                buildWorldBox(newObject, tempBox);
                const baseBox = tempBox.clone().expandByScalar(padding);

                // 3) search nearby positions until no intersection
                const basePos = newObject.position.clone();
                let chosenPos = basePos;

                for (const off of spiralOffsets()) {
                    const testBox = baseBox.clone();
                    testBox.translate(off);

                    // ensure not below floor
                    if (testBox.min.y < floorY) {
                        const yOff = floorY - testBox.min.y;
                        testBox.translate(new Three.Vector3(0, yOff, 0));
                        off.y += yOff;
                    }

                    if (!isBlocked(testBox, placedBoxes)) {
                        chosenPos = basePos.clone().add(off);
                        break;
                    }
                }

                newObject.position.copy(chosenPos);

                // 4) final snap (safe)
                snapToFloor(newObject);

                // 5) persist into store so it won't re-spawn differently next render
                updateItemTransform(
                    item.uuid,
                    newObject.position.toArray() as [number, number, number],
                    newObject.rotation.toArray().slice(0, 3) as [number, number, number],
                    newObject.scale.toArray() as [number, number, number]
                );
            } else {
                // Existing objects: just ensure they aren't under floor
                snapToFloor(newObject);
            }

            // Add to scene and tracking
            scene.add(newObject);
            objectsRef.current.push(newObject);
            objectStateRef.current.set(newObject.name, { lastSafePos: newObject.position.clone() });

            // Update placedBoxes for subsequent spawns
            buildWorldBox(newObject, tempOtherBox);
            placedBoxes.push(tempOtherBox.clone().expandByScalar(padding));
        });

        // selection
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
        if (!transformControls) return;

        transformControls.setMode(transformMode)
        if (transformMode === "scale") {
            transformControls.setSize(0.5);   // slower scale
        } else {
            transformControls.setSize(1.0);   // normal move/rotate
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

    useEffect(() => {
        collisionEnabledRef.current = collisionEnabled;
    }, [collisionEnabled]);

    return (
        <div>
            <canvas ref={canvasRef} id="bg">
            </canvas>
        </div>
    )
})