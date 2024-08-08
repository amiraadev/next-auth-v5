/** @format */
"use client";
import { useSearchParams } from "next/navigation";
import { BeatLoader } from "react-spinners";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import CardWrapper from "@/components/auth/CardWrapper";
import FormSuccess from "@/components/FormSuccess";
import FormError from "@/components/FormError";

const NewVerificationForm = () => {
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | undefined>("");
	const [success, setSuccess] = useState<string | undefined>("");
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const onSubmit = useCallback(async () => {
		if (success || error) return;
		if (!token) {
			setMessage("No token provided.");
			setLoading(false);
			return;
		}

		try {
			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/auth/new-verification?token=${token}`
			);

				if (response.data.success) {
					setSuccess(response.data.success);
				} else {
					setError(response.data.error);
				}
		} catch (error) {
			setMessage(
				error.response?.data?.message || "An unexpected error occurred."
			);
		} finally {
			setLoading(false);
		}
	}, [token, success, error]);

	useEffect(() => {
		onSubmit();
	}, [onSubmit]);
	return (
		<CardWrapper
			headerTitle='Confirming your verification'
			backButtonLabel='Back to login'
			backButtonHref='/auth/login'>
			{!success && !error ? (
				<div className='flex items-center w-full justify-center'>
					<BeatLoader />
				</div>
			) : (
				<>
					<FormSuccess message={success} />
					{!success && <FormError message={error} />}
				</>
			)}
		</CardWrapper>
	);
};

export default NewVerificationForm;
