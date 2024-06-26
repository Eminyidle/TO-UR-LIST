import { BaseSyntheticEvent, useRef, useEffect, useState } from "react";
import MyButton from "../Buttons/myButton";
import UserSearch from "../TourPage/UserSearch";
import { MemberInfo, TourInfoDetail, UserInfo } from "../../types/types";
import { ghostInviteTour, userInviteTour } from "../../util/api/tour";
import { HttpStatusCode } from "axios";
import CalcelIcon from "../../assets/svg/cancelIcon";

interface Proptype {
    tourId: string;
    data: TourInfoDetail;
    handleMemberAdd: (member: MemberInfo) => void;
    handleMemberDelete: (member: MemberInfo) => void;
    closeMemberModal: () => void;
}

export default function AddMemberModal(props: Proptype) {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [topOffset, setTopOffset] = useState<number>(0);
    const [addGhostState, setAddGhostState] = useState<boolean>(false);
    const [ghostNickname, setGhostNickname] = useState<string>("");
    const [memberList, setMemberList] = useState<MemberInfo[]>([]);
    const [updatedMemberList, setUpdatedMemberList] = useState<MemberInfo[]>(
        []
    );
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMemberList(props.data.memberList);

        if (divRef.current) {
            const height = divRef.current.clientHeight;
            const windowHeight = window.innerHeight;
            const calculatedTopOffset = (windowHeight - height) / 2;

            setTopOffset(calculatedTopOffset);
        }
    }, []);

    const onChange = (updatedMember: MemberInfo) => {
        // updatedMemberList에서 updatedMember의 id와 동일한 요소를 찾기
        const existingMember = updatedMemberList.find(
            (member) => member.userId === updatedMember.userId
        );

        // existingMember가 존재하면 기존 멤버를 업데이트하고, 존재하지 않으면 새로운 멤버 추가
        const newMembers = existingMember
            ? updatedMemberList.map((member) =>
                  member.userId === updatedMember.userId
                      ? updatedMember
                      : member
              )
            : [...updatedMemberList, updatedMember];

        setUpdatedMemberList(newMembers);
        newMembers.map((newMember) => {
            if (newMember.memberType != "ghost") {
                const itemApi = {
                    tourId: props.tourId,
                    userId: newMember.userId,
                    userNickname: newMember.userNickname,
                };

                userInviteTour(itemApi)
                    .then((res) => {
                        if (res.status == HttpStatusCode.Ok) {
                            props.handleMemberAdd(newMember);
                        }
                    })
                    .catch((err) => console.log(err));
            }
        });
    };

    const handleInputChange = (event: BaseSyntheticEvent) => {
        setGhostNickname(event.target.value);
    };

    const handleAddGhost = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            const existingMember = updatedMemberList.find(
                (member) =>
                    member.memberType == "ghost" &&
                    member.userNickname === ghostNickname
            );

            if (existingMember && ghostNickname.trim() == "") {
                event.preventDefault(); // 이미 있는 아이템이면 제출 막기
            } else if (!event.nativeEvent.isComposing) {
                // 고스트 멤버 추가
                const itemApi = {
                    tourId: props.tourId,
                    ghostNickname: ghostNickname,
                };

                ghostInviteTour(itemApi)
                    .then((res) => {
                        if (res.status == HttpStatusCode.Ok) {
                            const newGhostMember = {
                                userId: res.data.ghostId,
                                userNickname: res.data.ghostNickname,
                                userName: res.data.ghostNickname,
                                memberType: "ghost",
                            };

                            props.handleMemberAdd(newGhostMember);

                            setUpdatedMemberList([
                                ...updatedMemberList,
                                newGhostMember,
                            ]);
                            setGhostNickname("");
                        }
                    })
                    .catch((err) => console.log(err));
            }
        }
    };

    const handleDelete = (target: MemberInfo) => {
        const filteredMemberList = updatedMemberList.filter(
            (member) => member !== target
        );
        setUpdatedMemberList(filteredMemberList);
    };

    const handleDone = () => {
        props.closeMemberModal();
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (divRef.current && !divRef.current.contains(event.target as Node)) {
            props.closeMemberModal();
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <>
            <div className="absolute w-full h-full top-0 left-0 z-20 bg-black opacity-50"></div>
            <div
                ref={divRef}
                className={`absolute rounded-lg gap-2 p-5 w-[80%] left-[10%]  z-30 bg-white flex flex-col justify-evenly items-center `}
                style={{ top: `${topOffset}px` }}
            >
                <div className="w-full flex flex-col justify-center text-xl font-bold">
                    멤버 추가하기
                </div>
                <div className="w-full">
                    <UserSearch onChange={onChange} memberList={memberList} />
                </div>
                <div className="flex gap-2 w-full px-2 flex-wrap max-h-[15vh] overflow-auto">
                    {updatedMemberList.map((member: MemberInfo) => (
                        <div
                            key={member.userId}
                            className={`flex px-3 py-1 gap-3 items-center ${
                                member.memberType == "ghost"
                                    ? "bg-gray-300"
                                    : "color-bg-blue-3"
                            } rounded-full`}
                        >
                            <div onClick={() => handleDelete(member)}>
                                <CalcelIcon />
                            </div>
                            <div className="whitespace-nowrap">
                                {member.memberType == "ghost" ? (
                                    <div>{member.userNickname}</div>
                                ) : (
                                    <div>
                                        {member.userNickname} ({member.userName}
                                        )
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {!addGhostState ? (
                    <div
                        onClick={() => setAddGhostState(true)}
                        className="border-dashed border-black border-2 w-[90%] text-center py-3"
                    >
                        + 고스트멤버 추가하기 👻
                    </div>
                ) : (
                    <div className="border-dashed border-black border-2 w-[90%] flex flex-col items-center justify-evenly gap-2 py-3">
                        + 고스트멤버 추가하기 👻
                        <input
                            value={ghostNickname}
                            onChange={handleInputChange}
                            onKeyDown={handleAddGhost}
                            className="border-neutral-400 border w-[80%] px-2 flex-auto bg-clip-padding outline-none"
                            aria-label="GhostNickname"
                            aria-describedby="button-addon1"
                            placeholder="고스트 닉네임을 입력하세요"
                        />
                    </div>
                )}

                <div className="w-[90%]">
                    <div className="font-bold">*고스트멤버란?</div>
                    <div className="whitespace-pre-line">
                        {`TO-UR-LIST 회원은 아니지만, 정확한 정산을 위해 임시로 넣어놓은 멤버를 말해요!\n추후 실제 회원으로 전환이 가능해요. `}
                    </div>
                </div>
                <div className="w-full">
                    <MyButton
                        isSelected={true}
                        onClick={() => handleDone()}
                        text="추가완료"
                        type="full"
                        className="font-medium py-2 text-white"
                    />
                </div>
            </div>
        </>
    );
}
