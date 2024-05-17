import { useState } from "react";

interface MyButtonProps {
    className?: string; // 추가 커스텀 사항
    type: string; // 버튼 크기 타입
    text: string; // 버튼에 표시할 텍스트
    isSelected: boolean; // 상태
    onClick: () => void;
}

const MyButton: React.FC<MyButtonProps> = ({
    className,
    type,
    text,
    isSelected,
    onClick,
}) => {
    // const [buttonColor, setButtonColor] = useState<String>(isSelected ? 'color-bg-blue-1 text-white text-bold' : 'color-bg-blue-5 text-white');
    const buttonColor = isSelected
        ? "color-bg-blue-1"
        : "box-border border-[#5faad9] border-2";
    return (
        <div className="">
            {type === "full" ? (
                <button
                    className={`rounded-lg w-full text-lg ${buttonColor} ${className} `}
                    onClick={onClick}
                >
                    {text}
                </button>
            ) : (
                <button
                    className={`rounded-xl px-6 py-1 ${buttonColor} ${className}`}
                    onClick={onClick}
                >
                    {text}
                </button>
            )}
        </div>
    );
};

export default MyButton;
