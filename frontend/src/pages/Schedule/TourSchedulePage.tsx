import TabBarTour from '../../components/TabBar/TabBarTour';
import DaySelectBar from '../../components/SchedulePage/DaySelectBar';
import { useState, useEffect } from 'react';
import TourHeader from '../../components/TourPage/TourHeader';
import ScheduleBar from '../../components/SchedulePage/ScheduleBar';
import Maps from '../../components/SchedulePage/Maps';
import { Wrapper } from '@googlemaps/react-wrapper';
import { TourInfoDetail, TourPlaceItem } from '../../types/types';

//dummy data
// import tourInfo from '../../dummy-data/get_tour_tourId.json';
// import tourSchedule from '../../dummy-data/get_tour_place_tourId.json';
import { getTourDetail } from '../../util/api/tour';
import { getPlaceList } from '../../util/api/place';

export default function TourSchedulePage() {
    const [period, setPeriod] = useState<number>(0);

    //헤더 타입
    const [type, setType] = useState<string>('');

    //스케줄 저장 배열 schedule[i]는 i일째 일정(0은 일정 없음)
    const [schedule, setSchedule] = useState<TourPlaceItem[][]>([[]]);

    //여행 정보
    const [tourInfo, setTourInfo] = useState<TourInfoDetail>({
        tourTitle: '',
        startDate: '',
        endDate: '',
        memberList: [],
        cityList: [],
    });

    // 투어 아이디 불러오기
    const address: string[] = window.location.href.split('/');
    const tourId: string = address[address.length - 2];

    /**여행 정보 불러오기 */
    useEffect(() => {
        getTourDetail(tourId)
            .then((res) => {
                console.log(res);
                setTourInfo(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    /**기간 계산 */
    useEffect(() => {
        if (tourInfo.startDate && tourInfo.endDate) {
            const startDate = new Date(tourInfo.startDate);
            const endDate = new Date(tourInfo.endDate);

            const calculated = endDate.getDate() - startDate.getDate() + 1;
            setPeriod(calculated);

            //스케줄 배열 초기화
            const tempSchedule = new Array(calculated + 1);
            for (let i = 0; i < tempSchedule.length; i++) {
                tempSchedule[i] = [];
            }

            //일정 정보 불러오기
            getPlaceList(tourId)
                .then((res) => {
                    console.log(res);
                    const tourSchedule = res.data;

                    for (let i = 0; i < tourSchedule.length; i++) {
                        const day = tourSchedule[i].tourDay;

                        tempSchedule[day].push(tourSchedule[i]);
                    }
                    setSchedule(tempSchedule);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [tourInfo]);

    //-1 nothing, 0:d+0, 1:d+1...
    const [selectedDate, setSelectedDate] = useState<number>(-1);

    //헤더 타입 변환
    const onChange = (type: string) => {
        setType(type);
    };

    return (
        <>
            <section className="w-full h-full">
                <div className="w-full h-[25%]">
                    <TourHeader tourInfo={tourInfo} onChange={onChange} />
                </div>
                <div className="w-full h-[65%] relative overflow-hidden">
                    <Wrapper
                        apiKey={`${
                            import.meta.env.VITE_REACT_GOOGLE_MAPS_API_KEY
                        }`}
                        libraries={['marker', 'places']}
                    >
                        <Maps
                            schedule={schedule}
                            selectedDate={selectedDate}
                            tourId={tourId}
                        />
                    </Wrapper>
                    <ScheduleBar
                        schedule={schedule}
                        startDate={tourInfo.startDate}
                        selectedDate={selectedDate}
                        tourId={tourId}
                    />
                    <DaySelectBar
                        startDate={tourInfo.startDate}
                        endDate={tourInfo.endDate}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        period={period}
                    />
                </div>
                <TabBarTour tourMode={2} tourId={tourId} />
            </section>
        </>
    );
}
