import { useState } from "react";

interface RangeSliderInterface {
    onChange: (value: number) => void;
}

const RangeSlider: React.FC<RangeSliderInterface> = ({onChange}) => {

    const [slider] = useState({
        max: 100, 
        min: 0, 
        value: 0, 
        label: ''
    });

    const onSlide = () => {
        onChange(slider.value);
    } 

    return (
        <div className="range-slider">
            <p>{slider.label}</p>
            <input type="range" min={slider.min} max={slider.max} value={slider.value} 
             onChange={() => onSlide()} className="slider" id="myRange"></input>
        </div>
    );
}
export default RangeSlider;
