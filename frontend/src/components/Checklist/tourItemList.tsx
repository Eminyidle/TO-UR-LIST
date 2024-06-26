import { useEffect, useState } from "react";
import PayTypeIcon from "../../assets/svg/payTypeIcon";
import { Item, TourInfoDetail } from "../../types/types";
import { act } from "react-dom/test-utils";
import ColorMapping from "../../assets/colorMapping";
import { getChecklist } from "../../util/api/checklist";
import { HttpStatusCode } from "axios";

interface ItemPerPlace {
    [placeId: string]: Item[];
}

interface ItemPerDayAndPlace {
    [day: number]: ItemPerPlace;
}

interface PlaceMapping {
    [placeId: string]: string;
}

interface PropType {
    tourId: string;
    data: TourInfoDetail;
    daysList: number[];
    placeData: PlaceMapping;
    groupedItems: ItemPerDayAndPlace;
    handleCheckbox: (item: Item) => void;
}

export default function ItemList(props: PropType) {
    const [checklist, setChecklist] = useState<Item[]>([]);
    useEffect(() => {
        if (props.tourId) {
            getChecklist(props.tourId)
                .then((res) => {
                    if (res.status == HttpStatusCode.Ok) {
                        setChecklist(res.data);
                    }
                })
                .catch((err) => console.log(err));
        }
    }, [props]);
    const formatNumberToTwoDigits = (num: number): string => {
        return `${num < 10 && num > 0 ? "0" : ""}${num}`;
    };

    const calcDate = (day: number): string => {
        const startDate = new Date(props.data.startDate);
        const startDay = startDate.getDate();
        startDate.setDate(startDay + day - 1);

        return `${startDate.getFullYear()}.${
            startDate.getMonth() + 1
        }.${startDate.getDate()}`;
    };

    // 활동 id 별 색상 부여
    const setColor = (activity: string): string => {
        if (ColorMapping()[activity]) {
            return ColorMapping()[activity];
        }
        return "color-bg-blue-3";
    };

    const getActivity = (target: Item): string => {
        const itemActivity = checklist.find(
            (item) => item.item === target.item && item.activity != ""
        );

        return itemActivity ? itemActivity.activity : "";
    };

    return (
        <div className="">
            {props.daysList.map((day) => (
                <div key={day}>
                    <div className="font-bold text-xl">
                        Day{formatNumberToTwoDigits(day)}{" "}
                        {day !== 0 ? `| ${calcDate(day)}` : "| 날짜 없음"}
                    </div>
                    <div className="border-t-2 border-black mt-2 mb-2">
                        {props.groupedItems[day] ? (
                            Object.keys(props.groupedItems[day]).map(
                                (placeId, index) => (
                                    <div className="ml-5 mt-2" key={index}>
                                        <div className="text-lg font-semibold">
                                            {placeId != "" ? (
                                                <div>
                                                    {props.placeData[placeId]}{" "}
                                                </div>
                                            ) : (
                                                ""
                                            )}
                                        </div>
                                        <div className=" flex flex-col gap-1">
                                            {props.groupedItems[day][
                                                placeId
                                            ].map((item, index) => (
                                                <div
                                                    key={index}
                                                    className=" grid grid-cols-3 justify-center m-1"
                                                >
                                                    <div className="flex items-center col-span-2">
                                                        <input
                                                            id={`checkbox-${index}`}
                                                            type="checkbox"
                                                            onChange={() =>
                                                                props.handleCheckbox(
                                                                    item
                                                                )
                                                            }
                                                            checked={
                                                                item.isChecked
                                                            }
                                                            className="w-6 h-6 bg-gray-100 border-gray-300 rounded "
                                                        />
                                                        <div className="ml-2">
                                                            <PayTypeIcon
                                                                isPublic={
                                                                    item.isPublic
                                                                }
                                                            />
                                                        </div>
                                                        <label className="ms-2 text-lg w-[70%] overflow-ellipsis overflow-hidden whitespace-nowrap">
                                                            {item.item}
                                                        </label>
                                                    </div>
                                                    <div className="relative w-full flex justify-end pr-3">
                                                        {item.activity && (
                                                            <span
                                                                className={`${setColor(
                                                                    item.activity
                                                                )} text-white drop-shadow-md px-3 py-0.5 rounded`}
                                                            >
                                                                {item.activity}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="flex justify-center items-center h-[7vh]">
                                해당 날짜의 체크리스트가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
