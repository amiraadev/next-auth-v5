/** @format */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { ResetSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CardWrapper from "@/components/auth/CardWrapper";
import FormError from "@/components/FormError";
import FormSuccess from "../FormSuccess";
import { signIn, useSession, getSession } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const ResetForm = () => {
	const session = useSession();
	const [showPassword, setShowPassword] = useState(true);
	const [error, setError] = useState<string | undefined>("");
	const [success, setSuccess] = useState<string | undefined>("");
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const form = useForm<z.infer<typeof ResetSchema>>({
		resolver: zodResolver(ResetSchema),
		defaultValues: {
			email: "",
		},
	});
	const handleSubmit = async (data: z.infer<typeof ResetSchema>) => {
		setError("");
		setSuccess("");
		const validatedFields = ResetSchema.safeParse(data);
		if (!validatedFields) {
			return { error: "Invalid email!" };
		}
		console.log(data);

		startTransition(async () => {
			try {
				const response = await axios.post(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/send-email-reset-password`,
					{ email: data.email },
					{
						headers: {
							"Content-Type": "application/json",
						},
					}
				);
				console.log({response});
				
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
			headerLabel='Forgot your password?'
			backButtonLabel='Back to login'
			backButtonHref='/auth/login'
			// showSocial
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
					<div className='space-y-4'>
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
					</div>

					<FormError message={error} />
					<FormSuccess message={success} />
					<Button
						variant='system'
						type='submit'
						className='w-full'
						disabled={isPending}>
						Send Reset Email
					</Button>
				</form>
			</Form>
		</CardWrapper>
	);
};

export default ResetForm;
