//dummyData
// import tourInfo from '../../dummy-data/get_tour_tourId.json';
// import tokyoTemporal from '../../dummy-data/tokyo_temporal.json';

import { useCallback, useEffect, useState } from "react";
import HeaderBar from "../../components/HeaderBar/HeaderBar";
import TabBarTour from "../../components/TabBar/TabBarTour";
import { useLocation } from "react-router-dom";
import { Wrapper } from "@googlemaps/react-wrapper";
import WebSocket from "../../components/TabBar/WebSocket";

import {
    PlaceInfo,
    PlaceInfoDetail,
    TourInfoDetail,
    WebSockPlace,
} from "../../types/types";
import SearchMaps from "../../components/SchedulePage/SearchMaps";
import SearchSlideBar from "../../components/SchedulePage/SearchSlideBar";
import SearchBar from "../../components/SchedulePage/SearchBar";
import { getPlaceList, searchPlace } from "../../util/api/place";
import { httpStatusCode } from "../../util/api/http-status";
import { getTour } from "../../util/api/tour";
import { Client } from "@stomp/stompjs";
import Loading from "../../components/Loading";

export default function PlaceAddPage() {
    const [selectedDate, setSelectedDate] = useState<number>(-1);
    const [searchedPlaces, setSearchedPlaces] = useState<PlaceInfo[]>([]);
    const [period, setPeriod] = useState<number>(0);

    const [map, setMap] = useState<google.maps.Map | undefined>();

    //웹소켓
    const [wsClient, setWsClient] = useState<Client>(new Client());

    const [tourInfo, setTourInfo] = useState<TourInfoDetail>({
        tourTitle: "",
        startDate: "",
        endDate: "",
        memberList: [],
        cityList: [],
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);

    // 투어 아이디 불러오기
    const address: string[] = window.location.href.split("/");
    const tourId: string = address[address.length - 3];

    //이번 날짜에 방문한 장소 캐시
    //이번 날짜에 방문한 장소의 placeid를 저장해 놓음.
    const [visitedCache, setVisitedCache] = useState<Set<string>>(new Set());

    //useLocation
    //state 불러오기
    const location = useLocation();
    useEffect(() => {
        if (location.state) {
            //선택 날짜
            setSelectedDate(location.state.selectedDate);
            setPeriod(location.state.period);
        }
        setIsLoading(true);
        //초기 여행 정보 불러오기
        getTour(tourId)
            .then((res) => {
                if (res.status === httpStatusCode.OK) {
                    setTourInfo(res.data);
                } else {
                    // console.log("Error");
                }
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setIsLoading(false);
            });

        //전체 일정 불러오기 및 날짜 기반으로 캐시 생성
        getPlaceList(tourId)
            .then((res) => {
                if (res.status === httpStatusCode.OK) {
                    const schedule: WebSockPlace[] = res.data;
                    const newCache: Set<string> = new Set();
                    schedule.map((place) => {
                        //넘어온 선택 날짜는 +1 해주어야 함.
                        if (place.tourDay === location.state.selectedDate + 1) {
                            newCache.add(place.placeId);
                        }
                    });
                    //새 캐시 인식
                    setVisitedCache(newCache);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (tourInfo.cityList.length > 0) {
            setIsLoading(true);
            let lat = 37.5;
            let lng = 127;
            if (map) {
                lat = map.getCenter().lat();
                lng = map.getCenter().lng();
            }
            //일단 api로 여행 정보 불러오기
            searchPlace(tourInfo.cityList[0].cityName, lat, lng)
                .then((res) => {
                    const placeInfo: PlaceInfoDetail[] = res.data;
                    setSearchedPlaces(placeInfo);
                    if (placeInfo.length > 0 && map) {
                        map.setCenter({
                            lat: placeInfo[0].placeLatitude,
                            lng: placeInfo[0].placeLongitude,
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [tourInfo.cityList]);

    const dateToString = useCallback(() => {
        const date = new Date(tourInfo.startDate);
        date.setDate(date.getDate() + selectedDate);

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}.${month >= 10 ? month : "0" + month}.${
            day >= 10 ? day : "0" + day
        }`;
    }, [tourInfo.startDate]);

    const searchEvent = (
        e: React.KeyboardEvent<HTMLInputElement>,
        searchValue: string
    ) => {
        if (e.key === "Enter") {
            setIsLoading(true);
            let lat = 37.5;
            let lng = 127;
            if (map) {
                lat = map.getCenter().lat();
                lng = map.getCenter().lng();
            }
            searchPlace(searchValue, lat, lng)
                .then((res) => {
                    if (res.status === httpStatusCode.OK) {
                        console.log(res);
                        setSearchedPlaces(res.data);
                    } else {
                        // console.log(res);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    /**버튼 누를 시 검색 */
    const clickSearch = (searchValue: string) => {
        setIsLoading(true);
        let lat = 37.5;
        let lng = 127;
        if (map) {
            lat = map.getCenter().lat();
            lng = map.getCenter().lng();
        }
        searchPlace(searchValue, lat, lng)
            .then((res) => {
                if (res.status === httpStatusCode.OK) {
                    console.log(res);
                    setSearchedPlaces(res.data);
                } else {
                    // console.log(res);
                }
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    /**웹소켓으로 업데이트 된 정보가 오면? */
    const update = (newSchedule: WebSockPlace[]) => {
        setIsLoading(true);
        //캐시 업데이트
        const newCache: Set<string> = new Set();
        newSchedule.map((place) => {
            //넘어온 선택 날짜는 +1 해주어야 함.
            if (place.tourDay === location.state.selectedDate + 1) {
                newCache.add(place.placeId);
            }
        });

        //새 캐시 업데이트
        setVisitedCache(newCache);

        setIsLoading(false);
    };

    return (
        <>
            <section className="w-full h-full overflow-y-hidden flex flex-col items-center justify-between">
                {isLoading ? <Loading /> : <></>}
                <HeaderBar />
                <SearchBar
                    searchEvent={searchEvent}
                    clickSearch={clickSearch}
                />
                <div className="w-full h-full flex flex-col overflow-y-hidden">
                    {/* 현재 날짜 보여주기 */}
                    {selectedDate !== -1 ? (
                        <div className="w-full h-6vw text-4vw px-2vw flex items-center">
                            Day {selectedDate + 1} | {dateToString()}
                        </div>
                    ) : (
                        <div className="w-full h-6vw text-4vw px-2vw flex items-center">
                            날짜 미정
                        </div>
                    )}
                    <Wrapper
                        apiKey={`${
                            import.meta.env.VITE_REACT_GOOGLE_MAPS_API_KEY
                        }`}
                        libraries={["marker", "places"]}
                    >
                        <SearchMaps
                            searchedPlaces={searchedPlaces}
                            setMap={setMap}
                        />
                    </Wrapper>
                    <SearchSlideBar
                        searchedPlaces={searchedPlaces}
                        tourId={tourId}
                        selectedDate={selectedDate}
                        period={period}
                        visitedCache={visitedCache}
                        wsClient={wsClient}
                        setIsLoading={setIsLoading}
                    />
                </div>
                <TabBarTour tourMode={2} tourId={tourId} type="schedule" />
                <WebSocket
                    setWsClient={setWsClient}
                    tourId={tourId}
                    update={update}
                />
            </section>
        </>
    );
}
