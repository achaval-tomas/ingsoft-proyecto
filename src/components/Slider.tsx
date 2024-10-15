import Input from "./Input";

type SliderProps = {
    value: string | number;
    onChange: (value: string | number) => void;
};

function Slider ({ value, onChange }: SliderProps) {

    return <div className="self-end mr-4">
                <Input className="mb-0"
                    value={value}
                    onChange={onChange}
                    type="range"
                    min={1}
                    max={3}
                    list="players"
                    />
                <div className="flex justify-between mx-4 mt-0">
                    {[1, 2, 3].map((amount) => (
                        <span key={amount}>{amount}</span>          
                    ))}
                </div>
            </div>
}

export default Slider