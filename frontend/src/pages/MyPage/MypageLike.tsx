import { useEffect, useState } from 'react';
import HeaderBar from '../../components/HeaderBar/HeaderBar';
import TabBarMain from '../../components/TabBar/TabBarMain';
import { Feed } from '../../types/types';
import { useLocation } from 'react-router';
import FeedCard from '../../components/FeedPage/FeedCard';

export default function MypageLike() {
    const [myLikedList, setMyLikedList] = useState<Feed[]>([]);
    const { state } = useLocation();

    useEffect(() => {
        //넘어온 리스트 있으면 그걸로, 아니면 새로 api호출
        if (state.length !== 0) {
            setMyLikedList(state);
        } else {
            //api호출
        }
    }, []);

    return (
        <>
            <section className="w-full h-[90%] py-[1vw] overflow-y-scroll flex flex-col items-center flex-grow-0 flex-shrink-0">
                <HeaderBar />
                <h1 className="text-[7vw] my-[2vw] w-[90%] weight-text-semibold">
                    내가 좋아요한 여행
                </h1>
                {myLikedList.map((feed) => {
                    return <FeedCard feedInfo={feed} key={feed.feedId} />;
                })}
            </section>
            <TabBarMain tabMode={2} />
        </>
    );
}