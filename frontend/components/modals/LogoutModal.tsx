/** @format */

// /** @format */

"use client";

import { useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import useLogoutModal from "@/components/hooks/useLogoutModal";
import Modal from "./Modal";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const LogoutModal = () => {
	const router = useRouter();

	const logoutModal = useLogoutModal();

	const [isLoading, setIsLoading] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FieldValues>({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit: SubmitHandler<FieldValues> = (data) => {
		setIsLoading(true);
		signIn("credentials", { ...data, redirect: false })
			.then((callback) => {
				console.log(callback);
				setIsLoading(false);
				if (callback?.ok) {
					router.refresh();
					logoutModal.onClose();
				}
				if (callback?.error) {
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const Toggle = useCallback(() => {
		logoutModal.onClose();
	}, [logoutModal]);

	const bodyContent = (
		<div className='flex flex-col gap-4'>
			Your session has timed out. Please log in again.
		</div>
	);

	const footerContent = (
		<div className='flex flex-col gap-4 mt-3'>
			<hr className='border-b-[2px] border-slate-700' />

			<div className='justify-center text-center text-slate-300  mt-4 font-light'>
				<div className='flex flex-row items-center gap-2'>
					<div>First Time here?</div>
					<div
						onClick={Toggle}
						className='text-slate-500 cursor-pointer hover:underline'>
						Create an account
					</div>
				</div>
			</div>
		</div>
	);
	return (
		<Modal
			disabled={isLoading}
			isOpen={logoutModal.isOpen}
			// isOpen={true}
			title='Login'
			actionLabel='Continue'
			onClose={logoutModal.onClose}
			onSubmit={handleSubmit(onSubmit)}
			body={bodyContent}
			footer={footerContent}
		/>
	);
};

export default LogoutModal;
