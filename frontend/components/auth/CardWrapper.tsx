/** @format */

"use client";

import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import Header from "@/components/auth/Header";
import Social from "@/components/auth/Social";
import BackButton from "./BackButton";

interface CardWrapperProps {
	children: React.ReactNode;
	headerLabel?: string;
	headerTitle?: string;
	backButtonLabel: string;
	backButtonHref: string;
	showSocial?: boolean;
}
const CardWrapper = ({
	children,
	headerLabel,
	headerTitle,
	backButtonLabel,
	backButtonHref,
	showSocial,
}: CardWrapperProps) => {
	return (
		<Card className='w-[400px] shadow-md'>
			<CardHeader>
				<Header label={headerLabel} title={headerTitle} />
			</CardHeader>
			<CardContent>{children}</CardContent>
			{showSocial && (
				<CardFooter>
					<Social />
				</CardFooter>
			)}
			<CardFooter>
				<BackButton label={backButtonLabel} href={backButtonHref} />
			</CardFooter>
		</Card>
	);
};

export default CardWrapper;
