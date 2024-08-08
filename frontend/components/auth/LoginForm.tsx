/** @format */
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { LoginSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CardWrapper from "@/components/auth/CardWrapper";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";

import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";

import { signIn, useSession, getSession } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { cn } from "@/lib/utils";

const LoginForm = () => {
	const searchParams = useSearchParams();
	const urlError = searchParams.get("error");
	const session = useSession();
	const [showPassword, setShowPassword] = useState(true);
	const [showTwoFactor, setShowTwoFactor] = useState(false);
	const [error, setError] = useState<string | undefined>("");
	const [codeError, setCodeError] = useState<string | undefined>("");
	const [success, setSuccess] = useState<string | undefined>("");
	const [code, setCode] = useState("");

	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const form = useForm<z.infer<typeof LoginSchema>>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
			code: "",
		},
	});
	const email = form.watch("email");
	const handleSubmit = async (data: z.infer<typeof LoginSchema>) => {
		setError("");
		setCodeError("");
		setSuccess("");
		if (showTwoFactor) {
			if (code.length !== 6) {
				setCodeError("Code must be exactly 6 digits long.");
				return;
			}
		}
		startTransition(async () => {
			try {
				const response = await signIn("credentials", {
					email: data.email,
					password: data.password,
					code: code,
					redirect: false,
					//  redirectTo: DEFAULT_LOGIN_REDIRECT,
				});

				if (response?.ok && response?.error) {
					// form.reset();
					if (
						response?.error ==
						"2FA code has been successfully sent to your email."
					) {
						setShowTwoFactor(true);
					} else {
						setSuccess(response?.error);
					}
				} else if (response?.error) {
					// form.reset();
					setError(response?.error);
				} else if (response?.ok) {
					router.push("/");
				}
				form.reset({
					...form.getValues(),
					code: "",
				});
				// if (response?.ok) {

				// 	if (response.error) {
				// 		setError(response?.error || "Unexpected error occurred");
				// 	} else {
				// 		router.push("/");
				// 	}
				// 	// const updatedSession = await getSession();
				// 	// if (updatedSession) setSuccess(JSON.stringify(updatedSession));
				// } else {
				// 	console.log(response);
				// 	if (response?.status === 403) {
				// 		setSuccess("An email verification has been sent" || "");
				// 	} else {
				// 		setError(response?.error || "Unexpected error occurred");
				// 		console.error("Login error:", response?.error);
				// 	}
				// }
			} catch (error) {
				if (axios.isAxiosError(error)) {
					console.error("Axios error:", error.response?.data || error.message);
					setError(error.response?.data.message);
				} else {
					console.error("Unexpected error:", error);
					setError("Unexpected error occurred");
				}
			}
		});
	};

	const Resend = async (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const data = form.getValues();
		// console.log({ResendData:data});
		setError("");
		setSuccess("");
		setCodeError("");
		setCode("")
		startTransition(async () => {
			try {
				const response = await signIn("credentials", {
					email: data.email,
					password: data.password,
					redirect: false,
				});

				
				if (response?.ok && response?.error) {
					if (
						response?.error ==
						"2FA code has been successfully sent to your email."
					) {
						setSuccess(response?.error);
						form.reset({
							...form.getValues(),
							code: "",
						});
					}
				} else if (response?.error) {
					setError(response?.error);
				}
			} catch (error) {
				if (axios.isAxiosError(error)) {
					console.error("Axios error:", error.response?.data || error.message);
					setError(error.response?.data.message);
				} else {
					console.error("Unexpected error:", error);
					setError("Unexpected error occurred");
				}
			}
		});
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};
	return (
		<CardWrapper
			// headerTitle='🔐 Login'
			headerTitle={showTwoFactor ? "" : "Login"}
			// headerLabel='Welcome Back'
			backButtonLabel={showTwoFactor ? "" : "Don't have an account ?"}
			backButtonHref='/auth/register'
			// showSocial
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
					<div className='space-y-4'>
						{showTwoFactor && (
							<>
								<div className='flex flex-col items-center justify-center text-center space-y-5 p-4'>
									<Image
										src='/notification1.png'
										alt='notification'
										width={100}
										height={100}
									/>
									<div className='flex flex-col text-center gap-y-3 p-4'>
										<h1 className='font-bold text-lg'>Two-step Verification</h1>
										<div className='text-gray-800 text-center text-xs'>
											<p>Enter the OTP code you just got on your email</p>
											<span>{email}</span>
										</div>
									</div>
								</div>
								<div>
									<InputOTP
										maxLength={6}
										value={code}
										onChange={(value) => setCode(value)}>
										<InputOTPGroup className='shad-otp   justify-center'>
											<InputOTPSlot
												className='shad-otp-slot mr-4 bg-slate-200 dark:bg-slate-500'
												index={0}
											/>
											<InputOTPSlot
												className='shad-otp-slot mx-3 bg-slate-200 dark:bg-slate-500'
												index={1}
											/>
											<InputOTPSlot
												className='shad-otp-slot mx-3 bg-slate-200 dark:bg-slate-500'
												index={2}
											/>
											<InputOTPSlot
												className='shad-otp-slot mx-3 bg-slate-200 dark:bg-slate-500'
												index={3}
											/>
											<InputOTPSlot
												className='shad-otp-slot mx-3 bg-slate-200 dark:bg-slate-500'
												index={4}
											/>
											<InputOTPSlot
												className='shad-otp-slot ml-4 bg-slate-200 dark:bg-slate-500'
												index={5}
											/>
										</InputOTPGroup>
									</InputOTP>

									{codeError && (
										<p className='shad-error text-red-500 text-14-regular mt-4 flex justify-center'>
											{codeError}
										</p>
									)}
								</div>
							</>
						)}
						{!showTwoFactor && (
							<>
								<FormField
									control={form.control}
									name='email'
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													className='bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible: ring-offset-0'
													placeholder='Email'
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
											<Button
												size='sm'
												variant='link'
												asChild
												className='px-0 font-normal'>
												<Link href='/auth/reset'>Forgot password ?</Link>
											</Button>
											<FormMessage />
										</FormItem>
									)}
								/>
							</>
						)}
					</div>

					<FormError message={error} />
					<FormSuccess message={success} />
					<div className='flex flex-col gap-y-2'>
						<Button
							variant='system'
							type='submit'
							className='w-full'
							disabled={isPending}>
							{showTwoFactor ? "Confirm" : "Login"}
						</Button>
						{showTwoFactor && (
							<Button
								variant='link'
								className='w-full'
								onClick={Resend}
								disabled={isPending}>
								Resend
							</Button>
						)}
					</div>
				</form>
			</Form>
		</CardWrapper>
	);
};

export default LoginForm;
