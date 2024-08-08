/** @format */

import React from "react";
import Navbar from "./_components/Navbar";
import Sidebar from "./_components/Sidebar";
import LogoutModal from "@/components/modals/LogoutModal";

interface ProtectedLayoutProps {
	children: React.ReactNode;
}
const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
	return (
		<>
		   <LogoutModal />
			<Navbar />
			<div className='flex'>
				<div className='hidden md:block h-[100vh] w-[300px]'>
					<Sidebar />
				</div>
				<div className='p-5 w-full md:max-w-[1140px]'>{children}</div>
			</div>
		</>
	);
};

export default ProtectedLayout;
