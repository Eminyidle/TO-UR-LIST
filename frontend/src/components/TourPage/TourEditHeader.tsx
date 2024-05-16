import { BaseSyntheticEvent, useEffect, useState, useRef } from "react";
import {
    TourInfoDetail,
    MemberInfo,
    City,
    CountryMapping,
} from "../../types/types";
import MyButton from "../Buttons/myButton";
import CheckModal from "../CheckModal";
import MemberAddModal from "../TourPage/AddMemberModal";
import SearchBar from "../SearchBar/mySearchBar";

import MapIcon from "../../assets/svg/mapIcon";

import GhostHandleModal from "./GhostHandleModal";
import HostHandleModal from "./HostHandleModal";
import EditMemberList from "./EditMemberList";
import SearchResult from "./SearchResult";
import {
    deleteMemberApi,
    editCity,
    editPeriod,
    editTitle,
    getCity,
    getCountry,
} from "../../util/api/tour";
import { GetCountryList } from "../../util/api/country";
import { HttpStatusCode } from "axios";

interface PropType {
    tourId: string;
    tourInfo: TourInfoDetail;
    onChange: (type: string) => void;
    onUpdate: (flag: boolean) => void;
}

export default function TourEditHeader(props: PropType) {
    const [data, setData] = useState<TourInfoDetail>({
        tourTitle: "",
        cityList: [],
        startDate: "",
        endDate: "",
        memberList: [],
    });
    const [hostHandleModal, setHostHandleModal] = useState<boolean>(false);
    const [addModalClicked, setAddModalClicked] = useState<boolean>(false);
    const [memberDeleteModal, setMemberDeleteModal] = useState<boolean>(false);
    const [ghostHandleModal, setGhostHandleModal] = useState<boolean>(false);

    const [memberList, setMemberList] = useState<MemberInfo[]>([]);
    const [deleteMember, setDeleteMember] = useState<MemberInfo>({
        userId: "",
        userNickname: "",
        userName: "",
        memberType: "",
    });
    const [selectedGhostMember, setSelectedGhostMember] = useState<MemberInfo>({
        userId: "",
        userNickname: "",
        userName: "",
        memberType: "",
    });
    const [selectedHostMember, setSelectedHostMember] = useState<MemberInfo>({
        userId: "",
        userNickname: "",
        userName: "",
        memberType: "",
    });

    const [searchbarClick, setSearchbarClick] = useState<boolean>(false);
    const [title, setTitle] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [query, setQuery] = useState<string>("");
    const [searchList, setSearchList] = useState<City[]>([]); // 실제 검색 결과
    const [resultList, setResultList] = useState<City[]>([]); // 화면에 보여줄 검색 결과
    const [selectedCity, setSelectedCity] = useState<City[]>([]); // 선택된 도시

    const [countryList, setCountryList] = useState<CountryMapping[]>([]);

    const addMemberModalRef = useRef(null);

    useEffect(() => {
        setData(props.tourInfo);
        setTitle(data ? data.tourTitle : "");
        setMemberList(data.memberList);
        setStartDate(data.startDate);
        setEndDate(data.endDate);
        setSelectedCity(data.cityList);
    }, [data]);

    useEffect(() => {
        // 컴포넌트가 마운트될 때 전체 document에 클릭 이벤트 리스너 추가
        document.addEventListener("click", handleClickOutside);

        return () => {
            // 컴포넌트가 언마운트될 때 클릭 이벤트 리스너 제거
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        getCountry()
            .then((res) => {
                setCountryList(res.data);
            })
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        // 검색 결과를 업데이트
        const updatedResultList = resultList.filter(
            (res) =>
                !selectedCity.some(
                    (selected) =>
                        JSON.stringify(selected) === JSON.stringify(res)
                )
        );
        setResultList(updatedResultList);
        if (updatedResultList.length > 0) {
            setIsVaildCityList(true);
        }
        // 결과에 있었던 거면 다시 들어가 (재검색)
        handleQuery(query);
    }, [selectedCity]);

    /**
     * 검증 로직 추가
     * @param type
     */

    const [isVaildTitle, setIsVaildTitle] = useState<boolean>(true);
    const [isVaildDate, setIsVaildDate] = useState<boolean>(true);
    const [isVaildCityList, setIsVaildCityList] = useState<boolean>(true);
    function areDatesInOrder(startDateString: string, endDateString: string) {
        // Date 객체를 생성
        const date1 = new Date(startDateString);
        const date2 = new Date(endDateString);

        // 유효한 날짜인지 확인
        if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
            throw new Error("Invalid date format");
        }

        // 비교 결과 반환
        return date1.getTime() <= date2.getTime();
    }
    const handleTypeChange = (type: string) => {
        const updatedTourInfo: TourInfoDetail = {
            tourTitle: title,
            startDate: startDate,
            endDate: endDate,
            memberList: memberList,
            cityList: selectedCity,
        };

        if (data.tourTitle != title) {
            //title이 없으면 에러
            if (title.trim() === "") {
                setIsVaildTitle(false);
                return;
            }

            editTitle({ tourId: props.tourId, tourTitle: title })
                .then((res) => {
                    if (res.status == HttpStatusCode.Ok) {
                        props.onUpdate(true); // 변화 알려
                    }
                })
                .catch((err) => console.log(err));
        }

        if (data.startDate != startDate || data.endDate != endDate) {
            //startDate <= endDate여야함
            if (!areDatesInOrder(startDate, endDate)) {
                setIsVaildDate(false);
                return;
            }

            editPeriod({
                tourId: props.tourId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            })
                .then((res) => {
                    if (res.status == HttpStatusCode.Ok) {
                        props.onUpdate(true);
                    }
                })
                .catch((err) => console.log(err));
        }

        if (data.cityList != selectedCity) {
            //city 1개 이상
            if (selectedCity.length === 0) {
                setIsVaildCityList(false);
                return;
            }

            editCity({ tourId: props.tourId, cityList: selectedCity })
                .then((res) => {
                    if (res.status == HttpStatusCode.Ok) {
                        props.onUpdate(true);
                    }
                })
                .catch((err) => console.log(err));
        }

        if (data.memberList != memberList) {
            props.onUpdate(true);
        }

        props.onChange(type);
    };

    const handleInputChange = (event: BaseSyntheticEvent) => {
        setTitle(event.target.value);
        if (title.length > 0) {
            setIsVaildTitle(true);
        }
    };

    const handleHost = () => {
        setHostHandleModal(true);
    };

    // searchBar로부터 데이터 받아서 검색 수행
    const handleQuery = (data: string) => {
        setQuery(data);
        setSearchbarClick(true);

        // 나라 -> 도시 로직인 경우 검색어를 나라 코드로 치환
        GetCountryList().then((res) => {
            if (res.status == HttpStatusCode.Ok) {
                setCountryList(res.data);
            }
        });

        const foundCountry = countryList.find(
            (country) => country.countryName === data
        );

        if (foundCountry) {
            // 코드로 도시 검색 및 결과 포맷팅
            const search: City[] = [];

            const targetCountry = countryList.find(
                (country) => country.countryCode === foundCountry.countryCode
            );

            if (targetCountry) {
                getCity(targetCountry.countryCode)
                    .then((res) => {
                        const data: string[] = res.data;
                        let search: City[] = [];
                        data.forEach((cityName: string) => {
                            search.push({
                                countryCode: targetCountry.countryCode,
                                cityName: cityName,
                            });
                        });
                        setSearchList(search);
                    })
                    .catch((err) => console.log(err));
            }

            // 선택된 도시가 있을 때 결과를 업데이트
            const updatedResultList = searchList.filter(
                (city) =>
                    !selectedCity.some(
                        (selected) =>
                            JSON.stringify(selected) === JSON.stringify(city)
                    )
            );
            setResultList(updatedResultList);
        }
    };

    // 여행할 도시 선택 또는 해제
    const handleCitySelect = (city: City) => {
        let idx = -1;

        selectedCity.forEach((selected, index) => {
            if (selected == city) {
                idx = index;
            }
        });

        if (idx === -1) {
            // 선택되지 않은 도시라면 추가
            setSelectedCity([...selectedCity, city]);
        } else {
            // 이미 선택된 도시라면 제거
            const updatedCities = selectedCity.filter(
                (selected) => selected !== city
            );
            setSelectedCity(updatedCities);
        }
    };

    const handleGhostModal = (member: MemberInfo) => {
        setSelectedGhostMember(member);
        setGhostHandleModal(true);
    };

    const handleClickOutside = (event: Event) => {
        if (addMemberModalRef.current) {
            const addMemberModalElement =
                addMemberModalRef.current as HTMLElement;
            if (
                addModalClicked &&
                addMemberModalElement &&
                !addMemberModalElement.contains(event.target as Node)
            ) {
                // 모달 영역 외부를 클릭했을 때 모달 닫기
                setAddModalClicked(false);
            }
        }
    };

    const closeMemberModal = () => {
        setAddModalClicked(false);
    };

    const handleMemberDelete = () => {
        if (deleteMember.userId != "") {
            const target = {
                tourId: props.tourId,
                userId: deleteMember.userId,
                userNickname: deleteMember.userNickname,
                memberType: deleteMember.memberType,
            };
            deleteMemberApi(target)
                .then((res) => {
                    if (res.status == HttpStatusCode.Ok) {
                        const updatedList = memberList.filter(
                            (mem) => mem !== deleteMember
                        );
                        setMemberList(updatedList);
                        setMemberDeleteModal(false);
                    }
                })
                .catch((err) => console.log(err));
        }
    };

    const handleMemberAdd = (member: MemberInfo) => {
        setMemberList([...memberList, member]);
    };

    const handleMemberDeleteModal = (
        member: MemberInfo,
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        event.stopPropagation(); // 이벤트 버블링 중단
        setDeleteMember(member);
        setMemberDeleteModal(true);
    };

    const closeMemberDeleteModal = () => {
        setMemberDeleteModal(false);
    };

    const closeGhostHandleModal = () => {
        setGhostHandleModal(false);
    };

    const closeHostHandleModal = () => {
        setHostHandleModal(false);
    };

    const handleStartDate = (event: BaseSyntheticEvent) => {
        setStartDate(event.target.value);
        console.log(startDate, endDate);
        if (areDatesInOrder(startDate, endDate)) {
            setIsVaildDate(true);
        }
    };

    const handleEndDate = (event: BaseSyntheticEvent) => {
        setEndDate(event.target.value);
        if (areDatesInOrder(startDate, endDate)) {
            setIsVaildDate(true);
        }
    };

    // 고스트 업데이트
    const onUpdate = (updatedMember: MemberInfo, ghostId?: string) => {
        const updateList: MemberInfo[] = [];
        if (!ghostId) {
            memberList.map((member) => {
                member.userId == updatedMember.userId
                    ? updateList.push(updatedMember)
                    : updateList.push(member);
            });
        } else {
            memberList.map((member) => {
                member.userId == ghostId
                    ? updateList.push(updatedMember)
                    : updateList.push(member);
            });
        }
        setMemberList(updateList);
    };

    return (
        <div>
            {addModalClicked ? (
                <div ref={addMemberModalRef} className="h-fit">
                    <MemberAddModal
                        tourId={props.tourId}
                        data={data}
                        handleMemberAdd={handleMemberAdd}
                        handleMemberDelete={handleMemberDelete}
                        closeMemberModal={closeMemberModal}
                    />
                </div>
            ) : (
                <></>
            )}

            {memberDeleteModal ? (
                <CheckModal
                    mainText="해당 멤버를 추방하시겠습니까?"
                    subText=""
                    OKText="확인"
                    CancelText="취소"
                    clickOK={handleMemberDelete}
                    clickCancel={closeMemberDeleteModal}
                />
            ) : (
                <></>
            )}

            {ghostHandleModal ? (
                <GhostHandleModal
                    selectedGhostMember={selectedGhostMember}
                    memberList={memberList}
                    tourId={props.tourId}
                    onUpdate={onUpdate}
                    closeGhostHandleModal={closeGhostHandleModal}
                />
            ) : (
                <></>
            )}

            {hostHandleModal ? (
                <HostHandleModal
                    selectedHostMember={selectedHostMember}
                    data={data}
                    closeHostHandleModal={closeHostHandleModal}
                />
            ) : (
                <></>
            )}

            <div className="w-full justify-between items-end p-5">
                <div className="flex flex-col">
                    <div className="w-full rounded-lg border border-solid border-neutral-300 text-3xl font-bold pl-5">
                        <input
                            value={title}
                            onChange={handleInputChange}
                            className="relative m-0 -mr-0.5 w-[90%] flex-auto bg-clip-padding py-1 outline-none"
                            aria-label="Title"
                            aria-describedby="button-addon1"
                        />
                    </div>
                    {!isVaildTitle ? (
                        <div
                            className={`animate-bounce w-full flex items-center justify-center p-4 text-sm text-gray-800 border-gray-300 rounded-lg bg-gray-50`}
                            role="alert"
                        >
                            <div className="font-medium">
                                ⚠️ 제목을 입력해주세요!
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                    <div className="grid grid-cols-2 gap-2 my-3 justify-center">
                        <input
                            className="px-[2vw] py-1 border border-neutral-300 rounded-lg"
                            type="date"
                            value={startDate}
                            onChange={handleStartDate}
                        ></input>
                        <input
                            className="px-[2vw] py-1 border border-neutral-300 rounded-lg"
                            type="date"
                            value={endDate}
                            onChange={handleEndDate}
                        ></input>
                    </div>
                    {!isVaildDate ? (
                        <div
                            className={`animate-bounce w-full flex items-center justify-center p-4 text-sm text-gray-800 border border-gray-300 rounded-lg bg-gray-50`}
                            role="alert"
                        >
                            <div className="font-medium">
                                ⚠️ 여행 날짜를 올바르게 설정해주세요!
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                    <div className="flex items-center px-3 w-[90vw] overflow-x-scroll gap-1">
                        <EditMemberList
                            memberList={memberList}
                            handleGhostModal={handleGhostModal}
                            handleMemberDeleteModal={handleMemberDeleteModal}
                            handleHost={handleHost}
                            setAddModalClicked={setAddModalClicked}
                        />
                    </div>

                    <div className="text-[5vw] flex flex-col items-center mt-3">
                        <div className="grid grid-cols-10 w-full">
                            <div className="relative col-span-1 top-[3px]">
                                <MapIcon />
                            </div>
                            <div
                                id="search-container"
                                className="col-span-7 justify-center shadow-md rounded-lg"
                            >
                                <div
                                    className="text-base"
                                    onClick={() =>
                                        setSearchbarClick(!searchbarClick)
                                    }
                                >
                                    <SearchBar onChange={handleQuery} />
                                </div>
                                <SearchResult
                                    handleCitySelect={handleCitySelect}
                                    query={query}
                                    resultList={resultList}
                                    searchList={searchList}
                                    searchbarClick={searchbarClick}
                                    selectedCity={selectedCity}
                                />
                            </div>
                            <div className="col-span-2 pl-3 pt-1 justify-center">
                                <MyButton
                                    isSelected={true}
                                    text="적용"
                                    type="full"
                                    className="py-1 font-medium text-white"
                                    onClick={() => handleTypeChange("default")}
                                />
                            </div>
                        </div>
                    </div>
                    {!isVaildCityList ? (
                        <div
                            className={`animate-bounce w-full flex items-center justify-center p-4 text-sm text-gray-800 border border-gray-300 rounded-lg bg-gray-50`}
                            role="alert"
                        >
                            <div className="font-medium">
                                ⚠️ 도시를 하나 이상 선택해주세요!
                            </div>
                        </div>
                    ) : (
                        ""
                    )}
                </div>
            </div>
        </div>
    );
}
