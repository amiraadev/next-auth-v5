/** @format */

import React from "react";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import Header from "./Header";
import BackButton from "./BackButton";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

const font = Poppins({
	subsets: ["latin"],
	weight: ["600"],
});

const ErrorCard = () => {
	return (
		<Card className='w-[400px] shadow-md'>
			<CardHeader>
				<div className='w-full flex flex-col gap-y-5 items-center justify-center'>
					<h1 className={cn("text-3xl font-semibold", font.className)}>
          ❌ Error
					</h1>
				<Header label='Oops! Something went wrong' />
        {/* <ExclamationTriangleIcon className="text-destructive"/> */}
				</div>
			</CardHeader>
			<CardFooter>
				<BackButton label='Back to Login page' href='/auth/login' />
			</CardFooter>
		</Card>
	);
};

export default ErrorCard;
