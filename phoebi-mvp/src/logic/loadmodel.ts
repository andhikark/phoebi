import * as Three from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import type { ComponentId } from '../types/domain';
import legoBricksUrl from '../assets/blueprint/lego_bricks.glb';
import wheelsUrl from '../assets/blueprint/wheel.glb';
import seat from '../assets/blueprint/bike_seat_concept.glb';
import car_wheel from '../assets/blueprint/car_wheels_and_tire.glb';
import frame from '../assets/blueprint/mountain_bike_frame.glb';
import frame2 from '../assets/blueprint/dh_bike_frame.glb';
const TARGET_NORMALIZED_SIZE = 10.0;
const gltfLoader = new GLTFLoader();

const dracoLoader = new DRACOLoader();

dracoLoader.setDecoderPath('/draco/'); 
gltfLoader.setDRACOLoader(dracoLoader);

const modelCache = new Map<ComponentId, Three.Group>();
const geometryCache = new Map<string, Three.BufferGeometry>();

export function preloadModels(): Promise<void[]> {
    const modelsToLoad: { id: ComponentId; url: string }[] = [
        { id: 'lego', url: legoBricksUrl },
        { id: 'bicycle_wheel', url: wheelsUrl},
        { id: 'seat', url: seat},
        { id: 'car_wheel', url: car_wheel},
        { id: 'frame', url: frame2},
    ];

    const promises = modelsToLoad.map(({ id, url }) => 
        new Promise<void>((resolve, reject) => {
            gltfLoader.load(
                url,
                (gltf) => {
                    modelCache.set(id, gltf.scene);
                    gltf.scene.traverse((child) => {
                        if (child instanceof Three.Mesh) {
                            const geometryId = `${id}_${child.uuid}`;
                            geometryCache.set(geometryId, child.geometry);
                            (child as any).userData.geometryId = geometryId;
                        }
                    });
                    resolve();
                },
                undefined, 
                (error) => {
                    console.error(`Failed to load model for ${id}:`, error);
                    reject(error);
                }
            );
        })
    );

    return Promise.all(promises);
}

export function getCachedGeometry(id: string): Three.BufferGeometry | undefined {
    return geometryCache.get(id)?.clone();
}

export function getCachedModel(id: ComponentId): Three.Group | undefined {
    const originalModel = modelCache.get(id);
    if (!originalModel) {
        console.error(`Model for component ID "${id}" could not be found in cache.`);
        return undefined;
    }
    return originalModel.clone();
}
