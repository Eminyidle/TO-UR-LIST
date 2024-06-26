//
import TabBarTour from "../../components/TabBar/TabBarTour";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DayList from "../../components/SchedulePage/DayList";
import { TourInfoDetail, WebSockPlace } from "../../types/types";
import HeaderBar from "../../components/HeaderBar/HeaderBar";
import WebSocket from "../../components/TabBar/WebSocket";
import { Client } from "@stomp/stompjs";
import { getTour } from "../../util/api/tour";
import { getPlaceList } from "../../util/api/place";
import Loading from "../../components/Loading";

export default function TourScheduleEditPage() {
    const [selectedDate, setSelectedDate] = useState<number>(-1);
    const [period, setPeriod] = useState<number>(0);

    const [wsClient, setWsClient] = useState<Client>(new Client());

    const [isLoading, setIsLoading] = useState<boolean>(false);

    //여행 정보
    const [tourInfo, setTourInfo] = useState<TourInfoDetail>({
        tourTitle: "",
        startDate: "",
        endDate: "",
        memberList: [],
        cityList: [],
    });
    //스케줄 저장 배열 schedule[i]는 i일째 일정(0은 일정 없음)
    const [schedule, setSchedule] = useState<WebSockPlace[][]>([[]]);

    const [newSchedule, setNewSchedule] = useState<WebSockPlace[]>([]);

    //장소 포커스
    const [selectedSchedule, setSelectedSchedule] = useState<WebSockPlace>();

    // 투어 아이디 불러오기
    const address: string[] = window.location.href.split("/");
    const tourId: string = address[address.length - 3];

    //state로 넘어온게 n이면 n+1일차만 띄우기
    //-1이면 전체 띄우기
    const location = useLocation();
    useEffect(() => {
        if (location.state) {
            setSelectedDate(location.state.selectedDate);
        }
    }, []);

    /**여행 정보 불러오기 */
    useEffect(() => {
        setIsLoading(true);
        getTour(tourId)
            .then((res) => {
                // console.log(res);
                setTourInfo(res.data);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    /**기간 계산 */
    useEffect(() => {
        if (tourInfo.startDate && tourInfo.endDate) {
            setIsLoading(true);
            const startDate = new Date(tourInfo.startDate);
            const endDate = new Date(tourInfo.endDate);

            const calculated = (endDate.getTime() - startDate.getTime())/ (1000 * 60 * 60 * 24) + 1;;
            setPeriod(calculated);

            //스케줄 배열 초기화
            const tempSchedule = new Array(calculated + 1);
            for (let i = 0; i < tempSchedule.length; i++) {
                tempSchedule[i] = [];
            }

            //일정 정보 불러오기
            getPlaceList(tourId)
                .then((res) => {
                    const tourSchedule = res.data;

                    for (let i = 0; i < tourSchedule.length; i++) {
                        const day = tourSchedule[i].tourDay;

                        tempSchedule[day].push(tourSchedule[i]);
                    }
                    setSchedule(tempSchedule);
                })
                .catch((err) => {
                    console.log(err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [newSchedule, tourInfo]);

    /**일별 보여주기 */
    const dayInfo = () => {
        const date = new Date(tourInfo.startDate);
        date.setDate(date.getDate() + location.state.selectedDate);
        return (
            <DayList
                dayNumber={selectedDate + 1}
                date={date}
                dailySchedule={schedule[selectedDate + 1]}
                isEditable={true}
                tourId={tourId}
                wsClient={wsClient}
                period={period}
                setIsLoading={setIsLoading}
                selectedSchedule={selectedSchedule}
                setSelectedSchedule={setSelectedSchedule}
            />
        );
    };

    /**웹소켓 업데이트 정보 도착 */
    const update = (newSchedule: WebSockPlace[]) => {
        setNewSchedule(newSchedule);
    };

    return (
        <>
            <section className="w-full h-full">
                {isLoading ? <Loading /> : <></>}
                <HeaderBar />
                <div className="w-full h-[calc(100vh-70px)] px-2vw relative flex flex-col">
                    <div className="w-full h-[8%] flex justify-between items-center px-2vw">
                        <p className="text-2xl">일정 편집</p>
                        <div
                            className="w-[15%] h-6vw border-rad-3vw color-bg-blue-6 text-white flex justify-center items-center"
                            onClick={() => {
                                window.location.href = `/tour/${tourId}/schedule`;
                            }}
                        >
                            완료
                        </div>
                    </div>
                    <div className="w-full h-[85%] flex flex-col justify-between items-center overflow-y-auto ">
                        {selectedDate === -1
                            ? schedule.map((dailySchedule, index) => {
                                  const date = new Date(tourInfo.startDate);
                                  date.setDate(date.getDate() + index - 1);
                                  return (
                                      <DayList
                                          key={date.getTime() + index}
                                          dayNumber={index}
                                          date={date}
                                          dailySchedule={dailySchedule}
                                          isEditable={true}
                                          tourId={tourId}
                                          wsClient={wsClient}
                                          period={period}
                                          setIsLoading={setIsLoading}
                                          selectedSchedule={selectedSchedule}
                                          setSelectedSchedule={
                                              setSelectedSchedule
                                          }
                                      />
                                  );
                              })
                            : dayInfo()}
                    </div>
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
