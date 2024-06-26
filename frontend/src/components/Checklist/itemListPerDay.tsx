import { useNavigate } from "react-router-dom";
import PayTypeIcon from "../../assets/svg/payTypeIcon";
import TrashIcon from "../../assets/svg/trashIcon";
import { Item, PlaceMapping, TourInfoDetail } from "../../types/types";
import ChecklistInput from "./checklistInput";
import ColorMapping from "../../assets/colorMapping";

interface ItemPerPlace {
    [placeId: string]: Item[];
}

interface ItemPerDayAndPlace {
    [day: number]: ItemPerPlace;
}

interface PropType {
    tourId: string;
    checklist: Item[];
    data: TourInfoDetail;
    daysList: number[];
    placeData: PlaceMapping;
    groupedItems: ItemPerDayAndPlace;
    isAddState: boolean[];
    handleDeleteModal: (item: Item) => void;
    handleAddState: (day: number) => void;
    onUpdate: (item: Item) => void;
}

export default function ItemListPerDay(props: PropType) {
    const navigate = useNavigate();

    // 활동 id 별 색상 부여
    const setColor = (activity: string): string => {
        if (ColorMapping()[activity]) {
            return ColorMapping()[activity];
        }
        return "color-bg-green-1";
    };

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

    const handleEditChecklist = (item: Item) => {
        // state로 데이터 전달하며 페이지 이동
        navigate(`/tour/${props.tourId}/checklist/edit`, {
            state: { item: item },
        });
    };

    const getActivity = (target: Item): string => {
        const itemActivity = props.checklist.find(
            (item) => item.item === target.item && item.activity != ""
        );

        return itemActivity ? itemActivity.activity : "";
    };

    return (
        <>
            {props.daysList.map((day) => (
                <div key={day}>
                    <div className="font-bold text-xl">
                        Day{formatNumberToTwoDigits(day)}{" "}
                        {day !== 0 ? `| ${calcDate(day)}` : "| 날짜 없음"}
                    </div>
                    <div className="border-t-2 border-black mt-2 mb-2 ">
                        {props.groupedItems[day] ? (
                            <div className="">
                                {props.groupedItems[day] &&
                                    Object.keys(props.groupedItems[day]).map(
                                        (placeId, index) => (
                                            <div
                                                className="ml-5 mt-3"
                                                key={index}
                                            >
                                                <div className="text-lg font-semibold">
                                                    {placeId != "" ? (
                                                        <div>
                                                            {
                                                                props.placeData[
                                                                    placeId
                                                                ]
                                                            }
                                                        </div>
                                                    ) : (
                                                        ""
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {props.groupedItems[day][
                                                        placeId
                                                    ].map((item, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => {
                                                                handleEditChecklist(
                                                                    item
                                                                );
                                                            }}
                                                            className=" grid grid-cols-2 justify-center m-1"
                                                        >
                                                            <div className="flex items-center">
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
                                                            <div className="flex justify-between">
                                                                <div className="flex justify-end pr-3 w-full">
                                                                    {item.activity ? (
                                                                        <span
                                                                            className={`${setColor(
                                                                                item.activity
                                                                            )} text-white drop-shadow-md px-3 rounded overflow-hidden overflow-ellipsis`}
                                                                        >
                                                                            {
                                                                                item.activity
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <span
                                                                            className={` text-gray-400 border-2 border-dashed px-2 rounded`}
                                                                        >
                                                                            +
                                                                            활동없음
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div
                                                                    onClick={() => {
                                                                        props.handleDeleteModal(
                                                                            item
                                                                        );
                                                                    }}
                                                                    className="flex justify-end mr-2 items-center"
                                                                >
                                                                    <TrashIcon />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {props.isAddState[day] ? (
                                                    <ChecklistInput
                                                        className="px-[3%]"
                                                        tourId={props.tourId}
                                                        checklistPerDay={
                                                            props.groupedItems
                                                        }
                                                        tourDay={day}
                                                        placeId={placeId}
                                                        onUpdate={
                                                            props.onUpdate
                                                        }
                                                    />
                                                ) : (
                                                    <div
                                                        onClick={() =>
                                                            props.handleAddState(
                                                                day
                                                            )
                                                        }
                                                        className="ml-3 mt-1 underline text-neutral-400"
                                                    >
                                                        + 항목추가
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-[5vh]">
                                해당 날짜의 체크리스트가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </>
    );
}
