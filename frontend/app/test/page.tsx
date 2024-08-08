/** @format */
"use client"
import { useSession } from "next-auth/react";
import React from "react";

const TestPage = () => {
	const { data: session } = useSession();
    
	if (session && session.user) return <h1>{session.user.email}</h1>;
	return <div>TestPage</div>;
};

export default TestPage;
