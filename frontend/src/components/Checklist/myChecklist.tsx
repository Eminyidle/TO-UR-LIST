import { useEffect, useState } from "react";
import MyButton from "../../components/Buttons/myButton";

// import Checklist from "../../dummy-data/get_checklist.json";
import { Item, ItemApi } from "../../types/types";
import PayTypeIcon from "../../assets/svg/payTypeIcon";
import { checkItem, getChecklist } from "../../util/api/checklist";
import { HttpStatusCode } from "axios";
import ActivityBadge from "./activityBadge";

interface PropType {
    tourId: string;
}

interface CountItem {
    [key: string]: number;
}

export default function MyCheckList(props: PropType) {
    const [isUpdated, setIsUpdated] = useState<boolean>(false);
    const [checklist, setChecklist] = useState<Item[]>([]);
    const [filteredChecklist, setFilteredChecklist] = useState<Item[]>([]);
    const [filteredGroup, setFilteredGroup] = useState<CountItem>({});

    useEffect(() => {
        if (props.tourId != "") {
            getChecklist(props.tourId)
                .then((res) => {
                    if (res.status == HttpStatusCode.Ok) {
                        setChecklist(res.data);
                        // 중복 횟수 카운트
                        setFilteredGroup(prepareData(res.data));
                        // 중복 하나씩만 남김
                        setFilteredChecklist(filterUniqueItems(res.data));
                    }
                })
                .catch((err) => console.log(err));
        }
    }, [props, isUpdated]);

    // 같은 체크리스트 아이템 처리
    const prepareData = (checklist: Item[]) => {
        const itemGroups: CountItem = {};

        checklist.forEach((item) => {
            const itemName = item.item;
            if (!itemGroups[itemName]) {
                itemGroups[itemName] = 0;
            }
            if (item.activity != "") {
                itemGroups[itemName]++;
            }
        });

        return itemGroups;
    };

    // 같은 항목 리스트에 여러 번 띄우지 않게 처리
    const filterUniqueItems = (checklist: Item[]): Item[] => {
        const seenItems = new Set<string>();
        let uniqueItems: Item[] = [];
        // let uncheck: Item[] = [];
        // let check: Item[] = [];

        checklist.forEach((item) => {
            const itemName = item.item;
            if (itemName && !seenItems.has(itemName)) {
                seenItems.add(itemName);
                uniqueItems.push(item);
                // item.isChecked ? check.push(item) : uncheck.push(item);
            }
        });
        // uniqueItems = [...uncheck, ...check];

        return uniqueItems;
    };

    const handleCheckbox = (target: Item) => {
        // 전체에서 체크 시 해당 아이템 모두 체킹
        const targetItems: ItemApi[] = [];

        checklist.forEach((checkItem) => {
            if (target.item == checkItem.item) {
                const { activity, isChecked, item, placeId, tourDay, tourId } =
                    checkItem;
                targetItems.push({
                    activity: activity,
                    isChecked: !isChecked,
                    item: item,
                    placeId: placeId,
                    tourDay: tourDay,
                    tourId: tourId,
                });
            }
        });

        if (targetItems.length > 0) {
            targetItems.forEach((targetItem) => {
                checkItem(targetItem)
                    .then((res) => {
                        if (res.status == HttpStatusCode.Ok) {
                            setIsUpdated(!isUpdated);
                        }
                    })
                    .catch((err) => console.log(err));
            });
        }
    };

    return (
        <>
            <div className="w-full  justify-between items-end p-5 bak">
                <div>
                    <div className=" border-2 border-blue-200 rounded-2xl p-3">
                        <div className="flex w-full justify-end mb-2">
                            <MyButton
                                type="small"
                                className="text-white font-medium"
                                text="편집"
                                isSelected={true}
                                onClick={() => {
                                    window.location.href = `/tour/${props.tourId}/checklist/all`;
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            {filteredChecklist.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-3 justify-end m-1"
                                >
                                    <div className="flex items-center col-span-2">
                                        <input
                                            id="default-checkbox"
                                            type="checkbox"
                                            onChange={() =>
                                                handleCheckbox(item)
                                            }
                                            checked={item.isChecked}
                                            className="w-6 h-6 bg-gray-100 border-gray-300 rounded "
                                        />
                                        <div className="ml-2">
                                            <PayTypeIcon
                                                isPublic={item.isPublic}
                                            />
                                        </div>
                                        <label className="text-lg ms-2 w-[70%] overflow-ellipsis overflow-hidden whitespace-nowrap">
                                            {item.item}
                                        </label>
                                    </div>

                                    <div className="relative text-end mr-3">
                                        <ActivityBadge
                                            checklist={checklist}
                                            hadNoContent={false}
                                            item={item}
                                            filteredChecklist={
                                                filteredChecklist
                                            }
                                            filteredGroup={filteredGroup}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
