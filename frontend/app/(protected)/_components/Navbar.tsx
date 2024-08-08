/** @format */

"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggler from "@/components/ThemeToggler";
import useLogoutModal from "@/components/hooks/useLogoutModal";

import Image from "next/image";
import { useEffect } from "react";

const Navbar = () => {
	const session = useSession();
	const logoutModal = useLogoutModal();

	const sessionError = session.data?.error;
	const user = session.data?.user;

	useEffect(() => {
		console.log({ session: session });
		if (sessionError) {
			logoutModal.onOpen();
		}
	}, [session]);

	return (
		<div className='bg-primary dark:bg-primary items-center text-white py-2 px-5 flex justify-between'>
			<Link href='/'>
				<Image
					src='/autoglassLogo.png'
					alt='Dashboard'
					width={120}
					height={180}
				/>
			</Link>
			<div className='flex items-center'>
				<ThemeToggler />
				<p className='px-2'>{user?.firstName}  {user?.familyName}</p>
				<DropdownMenu>
					<DropdownMenuTrigger className='focus:outline-none'>
						<Avatar>
							<AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
							<AvatarFallback className='text-black'>BT</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<Link href='/profile'>Profile</Link>
						</DropdownMenuItem>
						<DropdownMenuItem>
							<Link href='/api/auth/signout'>Logout</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
};

export default Navbar;
