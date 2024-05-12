import { useEffect, useState } from "react";
import HeaderBar from "../components/HeaderBar/HeaderBar";
import TourHeader from "../components/TourPage/TourHeader";
import TourBasicInfo from "../components/TourPage/TourBasicInfo";
import TourCheckList from "../components/TourPage/TourChecklist";

import { TourInfoDetail } from "../types/types";
// import TourDetail from '../dummy-data/get_tour_detail.json';
import TabBarTour from "../components/TabBar/TabBarTour";
import TourEditHeader from "../components/TourPage/TourEditHeader";
import { getTour } from "../util/api/tour";

export default function TourPage() {
  const [type, setType] = useState<string>("");
  const [data, setData] = useState<TourInfoDetail>({
    tourId: "",
    tourTitle: "",
    cityList: [],
    startDate: "",
    endDate: "",
    memberList: [],
  });

  useEffect(() => {
    // 투어 아이디 불러오기
    const address: string[] = window.location.href.split("/");
    const tourId: string = address[address.length - 1];

    // 투어 아이디로 더미데이터에서 데이터 찾기 (임시)
    // const tourData = TourDetail.find((tour) => tour.tourId === tourId);
    // if (tourData) {
    //     setData(tourData);
    // }

    // 데이터 불러오기
    getTour(tourId)
      .then((res) => {
        console.log(res.data);
        setData({
          tourTitle: res.data.tourTitle,
          cityList: res.data.cityList,
          startDate: res.data.startDate.split("T")[0],
          endDate: res.data.endDate.split("T")[0],
          memberList: res.data.memberList,
        });
      })
      .catch((err) => {
        console.log(err);
      });

    setType("default");
  }, []);

  const onChange = (type: string) => {
    setType(type);
  };

  return (
    <>
      <header>
        <HeaderBar />
      </header>
      <div className="h-[85vh] overflow-y-scroll">
        <div>
          {type == "default" ? (
            <TourHeader tourInfo={data} onChange={(type) => onChange(type)} />
          ) : (
            <TourEditHeader
              tourInfo={data}
              onChange={(type) => onChange(type)}
            />
          )}
        </div>
        <div>
          <TourBasicInfo tourInfo={data} />
        </div>
        <div>
          <TourCheckList tourId={data.tourId ? data.tourId : ""} />
        </div>
      </div>
      <footer>
        <TabBarTour tourMode={0} tourId={data.tourId ? data.tourId : ""} />
      </footer>
    </>
  );
}
