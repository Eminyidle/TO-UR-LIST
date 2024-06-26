import Slider from "react-slick";

import { CountryInfo } from "../../types/types";

interface PropType {
    countryInfoList: CountryInfo[];
}

export default function MySlider(props: PropType) {
    var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
    };

    return (
        <Slider {...settings}>
            {props.countryInfoList.length > 0 &&
                props.countryInfoList.map((countryInfo, index: number) => (
                    <div
                        key={index}
                        className="border-2 color-border-blue-1 rounded-2xl p-3"
                    >
                        <div className="grid grid-cols-3 mb-3">
                            <div className="flex flex-col items-center">
                                <div className="text-gray-600">언어</div>
                                <div className="text-lg whitespace-pre-line text-center">
                                    {countryInfo.language
                                        .split(",")
                                        .join(" / ")}
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-gray-600">전압</div>
                                <div className="text-lg whitespace-pre text-center">
                                    {countryInfo.voltage.split(",").join(" / ")}
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-gray-600">
                                    시차(한국기준)
                                </div>
                                <div className="text-lg">
                                    {countryInfo.kst}시간
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-col items-center  border-t color-border-blue-1 pt-3">
                                <div className="text-lg text-wrap">
                                    {countryInfo.climate}
                                </div>
                            </div>
                        </div>
                        <div></div>
                    </div>
                ))}
        </Slider>
    );
}
