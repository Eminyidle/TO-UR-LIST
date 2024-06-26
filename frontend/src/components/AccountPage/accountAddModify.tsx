import { BaseSyntheticEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import MyButton from "../../components/Buttons/myButton";

import CategoryToImg from "../../components/AccountPage/categoryToImg";
import {
    AccountInfo,
    MemberInfo,
    PayMember,
    TourInfoDetail,
    UserInfo,
} from "../../types/types";

import { useSelector } from "react-redux";
import { addAccount, editAccount, getCurrency } from "../../util/api/pay";
import { httpStatusCode } from "../../util/api/http-status";
import DropdownIcon from "../../assets/svg/dropdownIcon";
import MemberList from "./memberList";
import ButtonGroup from "./buttonGroup";
import GetISOStringKor from "./getISOStringKor";
import { combineSlices } from "@reduxjs/toolkit";

interface PropType {
    tourId: string;
    tourData: TourInfoDetail;
    isModify: boolean;
    data?: AccountInfo;
}

interface Currency {
    unit: string;
    currencyCode: string;
    currencyRate: number;
}

export default function AccountAddModify(props: PropType) {
    const [wonDropdownClick, setWonDropdownClick] = useState<boolean>(false);
    const [typeDropdownClick, setTypeDropdownClick] = useState<boolean>(false);
    const [typeDropdownPosition, setTypeDropdownPosition] =
        useState<string>("");
    const [payerDropdownClick, setPayerDropdownClick] =
        useState<boolean>(false);
    const [currency, setCurrency] = useState<Currency>({
        unit: "",
        currencyCode: "",
        currencyRate: 0,
    });
    const [unit, setUnit] = useState<string>("");
    const [exchangeRate, setExchangeRate] = useState<number>(0);
    const [type, setType] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const [category, setCategory] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [date, setDate] = useState<string>("");
    const [payerId, setPayerId] = useState<string>("");
    const [payId, setPayId] = useState<string>("");
    const [payMember, setPayMember] = useState<PayMember[]>([]);

    const userInfo: UserInfo = useSelector((state: any) => state.userSlice);

    const navigate = useNavigate();

    // 경고창 위치로 이동
    const amountAlert = useRef<HTMLDivElement | null>(null);
    const payTypeAlert = useRef<HTMLDivElement | null>(null);
    const payContentAlert = useRef<HTMLDivElement | null>(null);
    const payCategoryAlert = useRef<HTMLDivElement | null>(null);
    const payMemberAlert = useRef<HTMLDivElement | null>(null);

    const idToName = (memberId: string): string => {
        const member = props.tourData.memberList.find(
            (member) => member.userId === memberId
        );

        if (member) {
            return member.userName;
        } else {
            return "";
        }
    };

    const calcCurrency = (currencyRate: number) => {
        return Number((1 / currencyRate).toFixed(2));
    };

    useEffect(() => {
        // payId 불러오기
        const address: string[] = window.location.href.split("/");
        setPayId(address[address.length - 1]);

        if (props.tourData.cityList[0]) {
            getCurrency(
                props.tourData.cityList[0].countryCode,
                GetISOStringKor().split("T")[0]
            )
                .then((res) => {
                    setCurrency({
                        unit: res.data.unit,
                        currencyCode: res.data.currencyCode,
                        currencyRate: calcCurrency(res.data.currencyRate),
                    });
                })
                .catch((err) => console.log(err));
        }
    }, [payId, props]);

    useEffect(() => {
        if (!props.isModify && userInfo) {
            // payer 디폴트는 현재 가계부 작성하는 사람
            setPayerId(userInfo.userId);
            setUnit(currency.unit);
            setExchangeRate(currency.currencyRate);
            setPayMember([]);
            setDate(GetISOStringKor());
        } else {
            if (props.data && props.data.payId != "") {
                setAmount(props.data.payAmount);
                setDate(props.data.payDatetime);
                setIsPublic(props.data.payType == "public" ? true : false);
                setPayerId(props.data.payerId);
                setPayMember(props.data.payMemberList);
                setCategory(props.data.payCategory);
                setContent(props.data.payContent);
                setType(props.data.payMethod);
                setUnit(props.data.unit);
                setExchangeRate(props.data.exchangeRate);
            }
        }
    }, [currency]);

    useEffect(() => {
        const dropdown = document.querySelector("#type-dropdown"); // 드롭다운 요소 선택
        const input = document.querySelector("#type-input"); // 인풋 요소 선택

        if (dropdown && input) {
            const inputRect = input.getBoundingClientRect();
            const topPosition = inputRect.top + inputRect.height;
            setTypeDropdownPosition(`${topPosition}px`);
        }
    }, [isPublic]);

    const handleUnit = (unit: string) => {
        unit == "₩"
            ? setExchangeRate(1)
            : setExchangeRate(currency.currencyRate);
        setUnit(unit);
        setWonDropdownClick(false);
    };

    const handleAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = parseInt(event.target.value);
        if (!isNaN(inputValue) && inputValue > 0) {
            setAmount(inputValue);
        } else {
            setAmount(0);
        }
        setIsVaildPayAmount(true);
    };

    const handleCurrencyRate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = parseInt(event.target.value);
        if (!isNaN(inputValue)) {
            setExchangeRate(inputValue);
        } else {
            setExchangeRate(0);
        }
    };

    const handleTypeChange = (type: string) => {
        setType(type);
        setIsVaildPayType(true);
        setTypeDropdownClick(false);
    };

    const categories = ["숙소", "교통", "식비", "쇼핑", "기타"];

    const setButtonProp = (input: string) => {
        if (
            (input == "public" && !isPublic) ||
            (input == "private" && isPublic)
        ) {
            return "color-text-blue-1 border-neutral-400";
        }
        return "text-white";
    };

    const handleDateChange = (event: BaseSyntheticEvent) => {
        setDate(new Date(event.target.value).toISOString());
    };

    const handlePayerChange = (payer: string) => {
        setPayerId(payer);
        setPayerDropdownClick(false);
    };

    const handleContent = (event: BaseSyntheticEvent) => {
        setContent(event.target.value);
        setIsVaildPayContent(true);
    };

    const handlePayMember = (memberId: string) => {
        let updatedMember: PayMember[] = [];
        const payMemberIds = payMember.map((member) => member.userId);
        if (payMemberIds.includes(memberId)) {
            updatedMember = payMember.filter((item) => item.userId != memberId);
        } else {
            updatedMember = [...payMember, { userId: memberId, payAmount: 0 }];
        }
        setPayMember(updatedMember);
    };

    /**
     * 빈 값 검증 로직
     */

    const [isVaildPayAmount, setIsVaildPayAmount] = useState<boolean>(true);
    const [isVaildPayContent, setIsVaildPayContent] = useState<boolean>(true);
    const [isVaildPayCategory, setIsVaildPayCategory] = useState<boolean>(true);
    const [isVaildPayMember, setIsVaildPayMember] = useState<boolean>(true);
    const [isVaildPayType, setIsVaildPayType] = useState<boolean>(true);

    const handleSave = () => {
        let updatedMember: PayMember[] = [];
        if (isPublic) {
            // N빵 후 보내
            payMember.map((member: PayMember) => {
                const value = Math.ceil(amount / payMember.length);
                updatedMember.push({ userId: member.userId, payAmount: value });
            });
            setPayMember(updatedMember);
        }

        const newAccountItem: AccountInfo = {
            payType: isPublic ? "public" : "private",
            tourId: props.tourId,
            payAmount: amount,
            exchangeRate: exchangeRate,
            unit: unit,
            currencyCode: unit == "₩" ? "KRW" : currency.currencyCode,
            payMethod: type,
            payDatetime: date,
            payContent: content,
            payCategory: category,
            payerId: payerId,
            payMemberList: updatedMember,
        };

        if (newAccountItem.payAmount == 0) {
            setIsVaildPayAmount(false);
            if (amountAlert.current) {
                amountAlert.current.scrollIntoView({ behavior: "smooth" });
            }
            return;
        }
        if (
            newAccountItem.payType == "public" &&
            newAccountItem.payMemberList.length == 0
        ) {
            setIsVaildPayMember(false);
            if (payMemberAlert.current) {
                payMemberAlert.current.scrollIntoView({ behavior: "smooth" });
            }
            return;
        }
        if (!categories.includes(newAccountItem.payCategory)) {
            setIsVaildPayCategory(false);
            if (payCategoryAlert.current) {
                payCategoryAlert.current.scrollIntoView({ behavior: "smooth" });
            }
            return;
        }
        if (!newAccountItem.payContent) {
            setIsVaildPayContent(false);
            if (payContentAlert.current) {
                payContentAlert.current.scrollIntoView({ behavior: "smooth" });
            }
            return;
        }
        if (
            newAccountItem.payMethod != "카드" &&
            newAccountItem.payMethod != "현금"
        ) {
            setIsVaildPayType(false);
            if (payTypeAlert.current) {
                payTypeAlert.current.scrollIntoView({ behavior: "smooth" });
            }
            return;
        }
        if (props.isModify) {
            editAccount(payId, newAccountItem)
                .then((res) => {
                    if (res.status === httpStatusCode.OK) {
                        navigate(-1);
                    }
                })
                .catch((err) => console.log(err));
        } else {
            addAccount(newAccountItem)
                .then((res) => {
                    if (res.status === httpStatusCode.OK) {
                        // payId 돌아옴
                        navigate(-1);
                    }
                })
                .catch((err) => console.log(err));
        }
    };

    return (
        <>
            <div className="w-full flex flex-col items-center h-[70vh] overflow-y-auto mt-8 justify-between">
                <div className="w-[70%]">
                    <div>
                        <div className="flex border border-black rounded-lg items-center">
                            <div className="relative w-full">
                                <input
                                    value={amount == 0 ? "" : amount}
                                    onChange={handleAmount}
                                    type="number"
                                    className="block p-2.5 w-full z-20 text-sm text-gray-900 rounded-l-lg"
                                    placeholder="금액을 입력하세요"
                                />
                            </div>
                            <div className="w-0.5 h-7 bg-neutral-200"></div>
                            <button
                                id="dropdown-button"
                                className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 "
                                type="button"
                                onClick={() =>
                                    setWonDropdownClick(!wonDropdownClick)
                                }
                            >
                                {unit}
                                <DropdownIcon isClicked={wonDropdownClick} />
                            </button>
                            <div
                                className={`${
                                    wonDropdownClick ? "" : "hidden"
                                } absolute top-[14%] right-[15%] z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-16`}
                            >
                                <ul
                                    className="py-2 text-center text-sm text-gray-700"
                                    aria-labelledby="dropdown-button"
                                >
                                    {[currency.unit, "₩"].map((unit) => (
                                        <li
                                            key={unit}
                                            onClick={() => handleUnit(unit)}
                                        >
                                            <div className="block px-4 py-2">
                                                {unit}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    {!isVaildPayAmount ? (
                        <div
                            className={`animate-bounce w-full pt-2 pl-2 text-sm text-gray-800`}
                            role="alert"
                        >
                            <div
                                ref={amountAlert}
                                className="font-medium text-red-500"
                            >
                                ⚠️ 결제 금액을 입력해주세요!
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                </div>
                <div className="w-[70%] flex flex-col gap-5 justify-start h-full mx-10 my-5">
                    <div className="grid grid-cols-3">
                        <div className="col-span-1">적용환율</div>
                        <div className="col-span-2 flex gap-2 items-center">
                            <div>
                                <div>
                                    <input
                                        value={
                                            exchangeRate == 0
                                                ? ""
                                                : exchangeRate
                                        }
                                        onChange={handleCurrencyRate}
                                        disabled={unit == "₩"}
                                        type="number"
                                        className="block w-20 px-2 text-sm text-gray-900 border"
                                    />
                                </div>
                            </div>
                            <div>원 / 1 {currency.unit}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="col-span-1">환산금액</div>
                        <div className="col-span-2 flex gap-2 items-center">
                            <div>
                                {unit != "₩"
                                    ? `${Math.round(
                                          exchangeRate * amount
                                      ).toLocaleString()}`
                                    : amount}{" "}
                                원
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="col-span-1">결제날짜</div>
                        <div className="col-span-2">
                            <input
                                value={date.split("T")[0]}
                                onChange={handleDateChange}
                                type="date"
                                className="w-full text-sm text-gray-900 border py-1 px-2 rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 items-center">
                        <div className="col-span-1">분류</div>
                        <div className="col-span-2 flex gap-1">
                            <MyButton
                                className={`${setButtonProp(
                                    "private"
                                )} rounded-[8px] h-full`}
                                isSelected={!isPublic}
                                type="small"
                                onClick={() => setIsPublic(false)}
                                text="개인"
                            ></MyButton>
                            <MyButton
                                className={`${setButtonProp(
                                    "public"
                                )} rounded-[8px]  h-full`}
                                isSelected={isPublic}
                                type="small"
                                onClick={() => setIsPublic(true)}
                                text="공동"
                            ></MyButton>
                        </div>
                    </div>
                    {isPublic ? (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-3 items-center">
                                <div className="col-span-1">결제자</div>
                                <div className="col-span-2 grid grid-cols-4 gap-1 items-center">
                                    <div className="text-white col-span-1 color-bg-blue-2 w-7 h-7 flex justify-center shadow-lg items-center rounded-full">
                                        {idToName(payerId)[0]}
                                    </div>
                                    <button
                                        onClick={() =>
                                            setPayerDropdownClick(
                                                !payerDropdownClick
                                            )
                                        }
                                        id="dropdown-button"
                                        className="flex col-span-3 items-center p-3 text-sm text-gray-900 border py-1 px-2 rounded-lg justify-between"
                                        type="button"
                                    >
                                        {idToName(payerId)}{" "}
                                        {payerId == userInfo.userId
                                            ? " (나)"
                                            : ""}
                                        <DropdownIcon
                                            isClicked={payerDropdownClick}
                                        />
                                    </button>
                                    <div
                                        className={`${
                                            payerDropdownClick ? "" : "hidden"
                                        } absolute z-10 right-16 bg-white divide-y divide-gray-100 rounded-lg shadow w-32`}
                                    >
                                        <ul
                                            className="flex flex-col gap-2 py-2 text-sm text-gray-700 max-h-[30vh] overflow-y-auto"
                                            aria-labelledby="dropdown-button"
                                        >
                                            {props.tourData.memberList.map(
                                                (member, index) => (
                                                    <li
                                                        className=""
                                                        key={index}
                                                        onClick={() =>
                                                            handlePayerChange(
                                                                member.userId
                                                            )
                                                        }
                                                    >
                                                        <div className="block px-4">
                                                            {member.userName}
                                                            {userInfo.userId ==
                                                            member.userId
                                                                ? " (나)"
                                                                : ""}
                                                        </div>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3">
                                <div className="col-span-1">정산멤버</div>
                                <div className="col-span-2 flex max-h-[11vh] gap-2 overflow-y-auto flex-col">
                                    <MemberList
                                        handlePayMember={handlePayMember}
                                        memberList={props.tourData.memberList}
                                        payMember={payMember}
                                        userId={userInfo.userId}
                                    />
                                    {!isVaildPayMember ? (
                                        <div
                                            className={`animate-bounce w-full pt-2 pl-2 text-sm text-gray-800`}
                                            role="alert"
                                        >
                                            <div
                                                ref={payMemberAlert}
                                                className="font-medium text-red-500"
                                            >
                                                ⚠️ 정산 멤버를 추가해주세요!
                                            </div>
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        ""
                    )}

                    <div className="grid grid-cols-3 items-center">
                        <div className="col-span-1">카테고리</div>
                        <div className="grid grid-cols-5 col-span-2">
                            {categories.map((cat, index) => (
                                <div
                                    key={index}
                                    className="text-center"
                                    onClick={() => {
                                        setCategory(cat);
                                        setIsVaildPayCategory(true);
                                    }}
                                >
                                    <div
                                        className={`${
                                            category !== cat
                                                ? "bg-gray-200"
                                                : "color-bg-blue-4 color-border-blue-1 border"
                                        } w-9 h-9 bg-gray-200 justify-center items-center rounded-full flex flex-col`}
                                    >
                                        {CategoryToImg(cat)}
                                    </div>
                                    <div className="text-sm">{cat}</div>
                                </div>
                            ))}
                            {!isVaildPayCategory ? (
                                <div
                                    className={`col-span-full animate-bounce w-full pt-2 pl-2 text-sm text-gray-800`}
                                    role="alert"
                                >
                                    <div
                                        ref={payCategoryAlert}
                                        className="font-medium text-red-500"
                                    >
                                        ⚠️ 카테고리를 추가해주세요!
                                    </div>
                                </div>
                            ) : (
                                ""
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3">
                        <div className="col-span-1">내용</div>
                        <div className="w-full col-span-2">
                            <input
                                value={content}
                                onChange={handleContent}
                                type="text"
                                className="w-full text-sm text-gray-900 border py-1 px-2 rounded-lg"
                            />
                            {!isVaildPayContent ? (
                                <div
                                    className={`animate-bounce w-full pt-2 pl-2 text-sm text-gray-800`}
                                    role="alert"
                                >
                                    <div
                                        ref={payContentAlert}
                                        className="font-medium text-red-500"
                                    >
                                        ⚠️ 결제 내용을 입력해주세요!
                                    </div>
                                </div>
                            ) : (
                                ""
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="col-span-1">결제수단</div>
                        <div className="flex flex-col col-span-2">
                            <button
                                onClick={() =>
                                    setTypeDropdownClick(!typeDropdownClick)
                                }
                                id="type-input"
                                className={` flex items-center p-3 text-sm text-gray-900 border py-1 px-2 rounded-lg w-full justify-between`}
                                type="button"
                            >
                                {type || "선택하세요"}
                                <DropdownIcon isClicked={typeDropdownClick} />
                            </button>
                            <div
                                id="type-dropdown"
                                style={{ top: `${typeDropdownPosition}` }}
                                className={`${
                                    typeDropdownClick ? "" : "hidden"
                                } absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44`}
                            >
                                <ul
                                    className="py-2 text-sm text-gray-700 dark:text-gray-200"
                                    aria-labelledby="dropdown-button"
                                >
                                    <li
                                        onClick={() => handleTypeChange("카드")}
                                    >
                                        <div className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                            카드
                                        </div>
                                    </li>
                                    <li
                                        onClick={() => handleTypeChange("현금")}
                                    >
                                        <div className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                            현금
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            {!isVaildPayType ? (
                                <div
                                    className={`animate-bounce w-full pt-2 pl-2 text-sm text-gray-800`}
                                    role="alert"
                                >
                                    <div
                                        ref={payTypeAlert}
                                        className="font-medium text-red-500"
                                    >
                                        ⚠️ 결제 수단을 선택해주세요!
                                    </div>
                                </div>
                            ) : (
                                ""
                            )}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-20 grid grid-cols-2 w-[90%] gap-2">
                    <ButtonGroup handleSave={handleSave} />
                </div>
            </div>
        </>
    );
}
