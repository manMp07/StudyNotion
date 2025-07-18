import React, { useState } from "react";
import { HomePageExplore } from "../../../data/homepage-explore";
import HighlightText from "./Highlight";
import CourseCard from "./CourseCard";

const tabName = [
    "Free",
    "New to coding",
    "Most popular",
    "Skills paths",
    "Career paths",
];

const ExploreMore = () => {
    const [currentTab, setCurrentTab] = useState(tabName[0]);
    const [courses, setCourses] = useState(HomePageExplore[0].courses);
    const [currentCard, setCurrentCard] = useState(
        HomePageExplore[0].courses[0].heading
    );

    const changeTab = (newTab) => {
        setCurrentTab(newTab);
        const result = HomePageExplore.filter(
            (course) => course.tag === newTab
        );
        setCourses(result[0].courses);
        setCurrentCard(result[0].courses[0].heading);
    };

    return (
        <>
            <div className="text-4xl font-semibold text-center my-10">
                <div className="container" style={{ display: "block" }}>
                    Unlock the
                    <HighlightText
                        style={{ display: "inline" }}
                        text={"Power of Code"}
                    />
                </div>
                <p className="text-center text-richblack-300 text-sm font-semibold mt-1">
                    Learn to Build Anything You Can Imagine
                </p>
            </div>

            {/* Tabs Section */}
            <div className="hidden lg:flex gap-5 -mt-5 mx-auto w-max bg-richblack-800 text-richblack-200 p-1 rounded-full font-medium drop-shadow-[0_1.5px_rgba(255,255,255,0.25)]">
                {tabName.map((element, index) => {
                    return (
                        <div
                            className={`text-[16px] flex flex-row items-center gap-2 ${
                                currentTab === element
                                    ? "bg-richblack-900 text-richblack-5 font-medium"
                                    : "text-richblack-200"
                            } px-7 py-[7px] rounded-full transition-all duration-200 cursor-pointer hover:drop-shadow-[0_1.5px_rgba(255,255,255,0.25)]`}
                            key={index}
                            onClick={() => changeTab(element)}
                        >
                            {element}
                        </div>
                    );
                })}
            </div>

            <div className="hidden lg:block lg:h-[200px]"></div>

            {/* Cards Group */}
            <div className="lg:absolute gap-10 justify-center lg:gap-0 flex lg:justify-between flex-wrap w-full lg:bottom-[0] lg:left-[50%] lg:translate-x-[-50%] lg:translate-y-[50%] text-black lg:mb-0 mb-7 lg:px-0 px-3">
                {courses.map((element, index) => {
                    return (
                        <CourseCard
                            key={index}
                            cardData={element}
                            currentCard={currentCard}
                            setCurrentCard={setCurrentCard}
                        />
                    );
                })}
            </div>
        </>
    );
};

export default ExploreMore;
