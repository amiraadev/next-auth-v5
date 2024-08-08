/** @format */

"use client";
import LogoutButton from "@/components/auth/Logout";
import { useSession } from "next-auth/react";
// import { getServerSession } from 'next-auth'
import React from "react";

const SettingsPage = () => {
	// const session = await getServerSession(authOptions)
	const session = useSession();
	return (
		<div >
			{/* {JSON.stringify(session)} */}
			<LogoutButton />
		</div>
	);
};

export default SettingsPage;
