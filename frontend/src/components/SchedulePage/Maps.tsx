import { useEffect, useRef, useState } from 'react';
import { TourPlaceItem } from '../../types/types';
import { Position } from '../../types/types';

interface PropType {
    schedule: TourPlaceItem[][];
    selectedDate: number;
    tourId: string;
}

export default function Maps(props: PropType) {
    const googleMapRef = useRef<HTMLDivElement>(null);
    const [googleMap, setGoogleMap] = useState<google.maps.Map>();
    const [markers, setMarkers] = useState<google.maps.Marker[][]>([[]]);
    const [placesService, setPlacesService] =
        useState<google.maps.places.PlacesService>();
    const [placeList, setPlaceList] = useState<Position[][]>([[]]);

    useEffect(() => {
        if (googleMapRef.current) {
            const initMap = new window.google.maps.Map(googleMapRef.current, {
                center: { lat: 37.5, lng: 127 },
                zoom: 13,
                mapId: props.tourId,
            });

            const marker = new google.maps.Marker({
                position: { lat: 37.5, lng: 127 },
                map: initMap,
                title: 'Seoul',
                label: '0일차 서울',
            });

            const arr = [marker];
            setMarkers([arr]);

            const googleService = new google.maps.places.PlacesService(initMap);
            setPlacesService(googleService);

            setGoogleMap(initMap);
        }
    }, []);

    useEffect(() => {
        if (googleMap) {
            //마커 초기화
            for (let i = 0; i < markers.length; i++) {
                for (let j = 0; j < markers[i].length; i++) {
                    markers[i][j].setMap(null);
                }
            }

            //마커, 위치 정보 초기화
            const newMarkers: google.maps.Marker[][] = [];
            const newPlaces: Position[][] = [];
            for (let i = 0; i < props.schedule.length; i++) {
                const arr1: google.maps.Marker[] = [];
                const arr2: Position[] = [];
                newMarkers.push(arr1);
                newPlaces.push(arr2);
            }

            setMarkers(newMarkers);
            setPlaceList(newPlaces);

            //id 찾기
            props.schedule.map((daily) => {
                daily.map((place) => {
                    //정보가 없으면 api 호출

                    placesService?.getDetails(
                        { placeId: place.placeId },
                        (results, status) => {
                            console.log('api 호출');
                            const lat = results.geometry?.location.lat();
                            const lng = results.geometry?.location.lng();
                            if (lat && lng) {
                                const pos = { lat, lng };

                                const marker = new google.maps.Marker({
                                    position: { lat, lng },
                                    map: googleMap,
                                    title: place.placeName,
                                    label:
                                        place.tourDay +
                                        '일차 ' +
                                        place.placeName,
                                });
                                newMarkers[place.tourDay - 1].push(marker);
                                newPlaces[place.tourDay - 1].push(pos);
                                googleMap.setCenter(pos);
                            }
                        }
                    );
                });
            });
        }
    }, [googleMap, props.schedule]);

    useEffect(() => {
        for (let i = 0; i < markers.length; i++) {
            if (props.selectedDate === -1 || i === props.selectedDate) {
                //마커 표시
                if (googleMap) {
                    markers[i].map((marker) => {
                        marker.setMap(googleMap);
                    });
                }
            } else {
                //마커 삭제
                if (googleMap) {
                    markers[i].map((marker) => {
                        marker.setMap(null);
                    });
                }
            }
        }
        if (placeList[props.selectedDate] && googleMap) {
            googleMap.setCenter(placeList[props.selectedDate][0]);
        }
    }, [props.selectedDate, googleMap, props.schedule]);

    return <div ref={googleMapRef} id="map" className="w-full h-[80%]"></div>;
}
