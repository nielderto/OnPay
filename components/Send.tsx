import Image from "next/image";

export default function Send(){
    return (
        <button className=" text-black px-2 py-1.5 rounded-lg flex flex-col items-center 
                          transition-all duration-200 hover:scale-105 active:scale-95
                          text-xs sm:text-sm font-medium
                          h-[56px] w-[56px] sm:w-auto sm:min-w-[80px]
                          justify-center gap-0.5 shadow-sm hover:shadow-md hover:bg-blue-600 active:bg-blue-700">
            <Image
                src="/paper-plane-tilt.svg"
                alt="Send logo"
                width={20}
                height={20}
                className="w-5 h-5"
            />
            <span>Send</span>
        </button>
    )
}
