/** @format */
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { NewPasswordSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CardWrapper from "@/components/auth/CardWrapper";
import FormError from "@/components/FormError";
import FormSuccess from "@/components/FormSuccess";
import { signIn, useSession, getSession } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const NewPasswordForm = () => {
	const session = useSession();
	const [showPassword, setShowPassword] = useState(true);
	const [error, setError] = useState<string | undefined>("");
	const [success, setSuccess] = useState<string | undefined>("");
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const form = useForm<z.infer<typeof NewPasswordSchema>>({
		resolver: zodResolver(NewPasswordSchema),
		defaultValues: {
			password: "",
		},
	});
	const handleSubmit = async (data: z.infer<typeof NewPasswordSchema>) => {
		setError("");
		setSuccess("");
		const validatedFields = NewPasswordSchema.safeParse(data);
		if (!validatedFields) {
			return { error: "Invalid email!" };
		}
		console.log(data);

		startTransition(async () => {
			try {
				const response = await axios.post(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password?token=${token}`,
					{ password: data.password },
					{
						headers: {
							"Content-Type": "application/json",
						},
					}
				);
				console.log({ response });

				if (response.data.success) {
					setSuccess(response.data.success);
				} else {
					setError(response.data.error);
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
			headerLabel='Set your new password'
			backButtonLabel='Back to login'
			backButtonHref='/auth/login'
			// showSocial
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
					<div className='space-y-4'>
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
												placeholder='New password'
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
						Reset password
					</Button>
				</form>
			</Form>
		</CardWrapper>
	);
};

export default NewPasswordForm;
