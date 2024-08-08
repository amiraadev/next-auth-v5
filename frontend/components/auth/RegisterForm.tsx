/** @format */
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import "react-phone-number-input/style.css";
import PhoneInputWithCountry from "react-phone-number-input/react-hook-form";

import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { RegisterSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CardWrapper from "@/components/auth/CardWrapper";
import FormError from "@/components/FormError";
import FormSuccess from "../FormSuccess";

const RegisterForm = () => {
	const [showPassword, setShowPassword] = useState(true);
	const [error, setError] = useState<string | undefined>("");
	const [success, setSuccess] = useState<string | undefined>("");
	const [value, setValue] = useState();
	const [isPending, startTransition] = useTransition();

	const router = useRouter();

	const form = useForm<z.infer<typeof RegisterSchema>>({
		resolver: zodResolver(RegisterSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleSubmit = async (data: z.infer<typeof RegisterSchema>) => {
		setError("");
		setSuccess("");

		startTransition(async () => {
			try {
				const response = await axios.post(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
					{ ...data, role: "CLIENT" }
				);
				console.log(response);
				setSuccess(response.data.message);
				// router.push("/");
			} catch (error) {
				if (axios.isAxiosError(error)) {
					console.error("Axios error:", error.response?.data || error.message);
					setError(error.response?.data.message);
				} else {
					console.error("Unexpected error:", error);
				}
			}
		});
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const CustomInput = React.forwardRef<
		HTMLInputElement,
		React.ComponentProps<"input">
	>((props, ref) => (
		<input
			{...props}
			ref={ref}
			className='flex h-9 w-full rounded-md border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-slate-200 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0'
		/>
	));
	CustomInput.displayName = "CustomInput";

	return (
		<CardWrapper
			headerTitle='Create your account'
			backButtonLabel='Already have an account? Login'
			backButtonHref='/auth/login'>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
					<div className='space-y-3'>
						<div className='flex flex-row justify-center gap-2'>
							<FormField
								control={form.control}
								name='firstName'
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												className='bg-slate-200 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0'
												placeholder='First name*'
												disabled={isPending}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='familyName'
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												className='bg-slate-200 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0'
												placeholder='Family name*'
												disabled={isPending}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name='phoneNumber'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<>
											<PhoneInputWithCountry
												placeholder='Enter phone number'
												// defaultCountry="US"
												disabled={isPending}
												{...field}
												inputComponent={CustomInput}
												className=' rounded-sm bg-slate-200 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0'
											/>
										</>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='email'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											className='bg-slate-200 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0'
											placeholder='Email*'
											disabled={isPending}
											type='email'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='storeName'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											className='bg-slate-200 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0'
											placeholder='Store name*'
											disabled={isPending}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='storeAddress'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											className='bg-slate-200 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0'
											placeholder='Store address'
											disabled={isPending}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='storeWebsite'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											className='bg-slate-200 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0'
											placeholder='Store website'
											disabled={isPending}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<div className='relative  '>
											<Input
												type={showPassword ? "text" : "password"}
												className='bg-slate-200 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0'
												placeholder='password'
												disabled={isPending}
												{...field}
											/>
											<span
												className='absolute inset-y-0 right-0 flex items-center px-4 text-gray-600  cursor-pointer'
												onClick={togglePasswordVisibility}>
												{showPassword ? <FaEyeSlash /> : <FaEye />}
											</span>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormError message={error} />
					<FormSuccess message={success} />
					<Button
						variant='system'
						type='submit'
						className='w-full'
						disabled={isPending}>
						Register
					</Button>
				</form>
			</Form>
		</CardWrapper>
	);
};

export default RegisterForm;
