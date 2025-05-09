import React from "react";
import Logout from "./buttons/Logout";

interface UserGreetingProps {
  username: string;
  ens?: string;
}

export default function UserGreeting({ username, ens }: UserGreetingProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-[55rem] px-4 sm:px-6 mb-2 lg:mb-0">
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
          {username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="text-gray-500 text-sm">Welcome back,</div>
          <div className="font-bold text-xl">
            {ens ? ens : username}
          </div>
        </div>
      </div>
      <Logout />
    </div>
  );
} 