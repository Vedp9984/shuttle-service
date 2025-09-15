import { useNavigate } from "react-router-dom";
import React from "react";
const WelcomeScreen = () => {
  const navigate = useNavigate();
  return (
    <>
      <div
        id="_1_1073__Welcome_Screen"
        className="absolute overflow-hidden bg-[linear-gradient(180.0deg,rgba(0,0,0,1.00)_0.0%,rgba(21,21,21,1.00)_65.3848648071289%,rgba(102,102,102,1.00)_100.0%)] h-[736.0px] w-[414.0px]"
      >
        <div
          id="_1_1074__Art"
          className="absolute h-[614.00px] w-[1100.00px] left-[-226.00px] top-[220.00px]"
        ></div>

        <span
          id="_1_1076__Welcome_to_the_app"
          className="flex justify-start text-left items-start h-[29.00px] w-[234.00px] absolute left-[90.00px] top-[352.00px]"
        >
          <span
            className="whitespace-nowrap bg-[rgba(0,163,163,1.00)] bg-clip-text text-transparent not-italic text-[24.0px] font-bold"
            style={{
              fontFamily: "Inter",
            }}
          >
            Welcome to the app
          </span>
        </span>
        <span
          id="_1_1077__An_app_for_convenien"
          className="flex justify-center text-center items-start h-[36.00px] w-[352.00px] absolute left-[calc(50%-177.00px)] top-[398.00px]"
        >
          <span
            className="bg-[rgba(233,220,147,1.00)] bg-clip-text text-transparent not-italic text-[15.0px] font-light"
            style={{
              fontFamily: "Inter",
            }}
          >
            An app for convenient bus seat booking,
            <br />
            tracking,schedules, payments, and travel updates.
          </span>
        </span>
        <div
          id="_1_1079__Rectangle_1"
          className="absolute bg-[rgba(255,219,21,1.00)] h-[50.00px] w-[223.00px] rounded-[60px] left-[96.00px] top-[527.00px]"
        ></div>

        <span
          id="_1_1080__Get_Started"
          className="flex justify-center text-center items-start h-[19.00px] w-[89.00px] absolute left-[calc(50%-45.00px)] top-[543.00px]"
        >
          <span
            className="whitespace-nowrap bg-black bg-clip-text text-transparent not-italic text-[16.0px] font-medium"
            style={{
              fontFamily: "Inter",
            }}
          >
            Get Started
          </span>
        </span>

        <span
          id="_1_1081__Create_an_account"
          className="flex justify-center text-center items-start h-[18.00px] w-[132.00px] absolute left-[141.00px] top-[601.00px]"
        >
          <span
            className="whitespace-nowrap bg-[rgba(0,163,163,1.00)] bg-clip-text text-transparent not-italic text-[15.0px] font-medium"
            style={{
              fontFamily: "Inter",
            }}
          >
            Create an account
          </span>
        </span>

        <div
          id="_1_1082__Red_Yellow_Simple_To"
          className="absolute h-[281.00px] w-[281.00px] left-[76.00px] top-[57.00px]"
          style={{
            background:
              "url(assets/images/red_yellow_simple_tour_bus_rental_travel_logo_1_1.png) 100% / cover no-repeat",
          }}
        ></div>
      </div>
    </>
  );
};
export default WelcomeScreen;
