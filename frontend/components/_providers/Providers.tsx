/** @format */

"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/_providers/ThemeProvider";
interface Props {
	children: ReactNode;
}

const Providers = ({ children }: Props) => {
	return (
		<SessionProvider>
			<ThemeProvider
				attribute='class'
				defaultTheme='light'
				enableSystem={true}
				storageKey='auto-glass-theme'>
				{children}
			</ThemeProvider>
		</SessionProvider>
	);
};

export default Providers;
