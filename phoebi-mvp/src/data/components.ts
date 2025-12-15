// src/data/components.ts
// src/data/components.ts
import type { ComponentDef } from "../types/domain";
import frameIcon from "../assets/components/frame.png";
import wheelIcon from "../assets/components/wheel.png";
import seatIcon from "../assets/components/seat.png";
import handlebarIcon from "../assets/components/handlebar.png";
import legoIcon from "../assets/components/piece.png";
import carWheelIcon from "../assets/components/car.png";


export const COMPONENTS: ComponentDef[] = [
  {
    id: "frame",
    name: "Frame",
    icon: frameIcon,
    volumeFactor: 3,
    allowedMaterials: ["wood", "cardboard", "plastic", "metal", "recycled_plastic"],
  },
  {
    id: "bicycle_wheel",
    name: "Wheels",
    icon: wheelIcon,
    volumeFactor: 2,
    allowedMaterials: ["plastic", "metal", "recycled_plastic"],
  },
  {
    id: "seat",
    name: "Seat",
    icon: seatIcon,
    volumeFactor: 1,
    allowedMaterials: ["wood", "cardboard", "plastic", "recycled_plastic"],
  },
  {
    id: "handlebar",
    name: "Handlebar",
    icon: handlebarIcon,
    volumeFactor: 1,
    allowedMaterials: ["wood", "plastic", "metal", "recycled_plastic"],
  },
  {
    id: "lego",
    name: "Lego",
    icon: legoIcon,
    volumeFactor: 1,
    allowedMaterials: ["plastic"],
  },
  {
    id: "car_wheel",
    name: "Car wheel",
    icon: carWheelIcon,
    volumeFactor: 1,
    allowedMaterials: ["plastic"],
  },
];
