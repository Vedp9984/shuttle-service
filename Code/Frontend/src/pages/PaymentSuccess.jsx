import { useNavigate } from "react-router-dom";
import React from "react";
const PaymentSuccess = () => {
  const navigate = useNavigate();
  return (
    <>
      <div
        id="_1_229__Payment_Success"
        className="absolute overflow-hidden bg-[linear-gradient(180.0deg,rgba(0,0,0,1.00)_62.01943755149841%,rgba(102,102,102,1.00)_100.0%)] h-[736.0px] w-[414.0px]"
      >
        <span
          id="_1_230__Your_order_has_been_"
          className="flex justify-start text-left items-start h-[58.00px] w-[236.00px] absolute left-[calc(50%-118.00px)] top-[377.00px]"
        >
          <span
            className="bg-[rgba(234,198,0,1.00)] bg-clip-text text-transparent not-italic text-[24.0px] font-bold"
            style={{
              fontFamily: "Inter",
            }}
          >
            Your order has been
            <br />
            placed successfully
          </span>
        </span>
        <span
          id="_1_231__Thank_you_for_Bookin"
          className="flex justify-center text-center items-start h-[19.00px] w-[230.00px] absolute left-[calc(50%-115.00px)] top-[456.00px]"
        >
          <span
            className="whitespace-nowrap bg-[rgba(0,163,163,1.00)] bg-clip-text text-transparent not-italic text-[16.0px] font-light"
            style={{
              fontFamily: "Inter",
            }}
          >
            Thank you for Booking with us!
          </span>
        </span>
        <div
          id="_1_232__Image"
          className="absolute h-[32.61%] w-[57.97%] left-[calc(100%_*_0.21)] top-[calc(100%_*_0.19)]"
          style={{
            background: "url(assets/images/image.png) 100% / cover no-repeat",
          }}
        ></div>

        <div
          id="_1_233__Rectangle_1"
          onClick={() => navigate("/HomePageUser")}
          className="absolute bg-[rgba(0,163,163,1.00)] h-[50.00px] w-[223.00px] left-[calc(50%-112.00px)] cursor-pointer rounded-[60px] top-[549.00px]"
        ></div>

        <span
          id="_1_234__Back_to_Homepage"
          onClick={() => navigate("/HomePageUser")}
          className="flex justify-center text-center items-start h-[19.00px] w-[145.00px] absolute left-[calc(50%-73.00px)] cursor-pointer top-[565.00px]"
        >
          <span
            className="whitespace-nowrap bg-white bg-clip-text text-transparent not-italic text-[16.0px] font-medium"
            style={{
              fontFamily: "Inter",
            }}
          >
            Back to Homepage
          </span>
        </span>
      </div>
    </>
  );
};
export default PaymentSuccess;
