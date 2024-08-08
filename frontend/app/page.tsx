/** @format */

import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import LoginButton from "@/components/auth/LoginButton";

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LogoutButton from "@/components/auth/Logout";

const font = Poppins({
	subsets: ["latin"],
	weight: ["600"],
});
export default async function Home() {
	const session = await getServerSession(authOptions);

	return (
		<>
			<main
				className='flex 
      h-full 
      flex-col 
      items-center 
      justify-center 
      bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800'>
				<div className='space-y-6 text-center'>
					<h1
						className={cn(
							"text-6xl font-semibold text-white drop-shadow-sm",
							font.className
						)}>
						🔐 Auth
					</h1>
					<h2 className='text-white text-lg'>
						hello {session?.user.firstName}
					</h2>
					<p className='text-white text-lg'> A simple Authentication service</p>
					{session && session.user ? (
						// <form action='/api/auth/signout' method='POST'>
						// 	<Button type='submit' variant='secondary' size='lg'>
						// 		Sign Out
						// 	</Button>
						// </form>
						<LogoutButton />
					) : (
						<LoginButton>
							<Button variant='secondary' size='lg'>
								Sign In
							</Button>
						</LoginButton>
					)}
				</div>
			</main>
		</>
	);
}
