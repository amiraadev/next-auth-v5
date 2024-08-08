/** @format */
"use client"
import React from "react";
import { Button } from "../ui/button";
import { signOut } from "next-auth/react";

const LogoutButton = () => {
	return (
		// <form action='/api/auth/signout' method='POST'>

		// 	<Button type='submit' variant='system' size='lg'>
		// 		Sign Out
		// 	</Button>
			
		// </form>
		<Button type='submit' variant='system' size='lg' onClick={() => signOut({ callbackUrl: '/auth/login' })}>
				Sign Out
			</Button>
	);
};

export default LogoutButton;
