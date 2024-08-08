/** @format */

import * as z from "zod";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/;

export const LoginSchema = z.object({
	email: z
		.string()
		.min(1, {
			message: "Email is required",
		})
		.email({
			message: "Please enter a valid email",
		}),
	password: z.string().min(1, {
		message: "Password is required",
	}),
	code:z.optional(z.string())
});
export const RegisterSchema = z.object({
	firstName: z
		.string({
			message: "First name is required",
		})
		.min(1, {
			message: "First name is required",
		}),
	familyName: z
		.string({
			message: "Family name is required",
		})
		.min(1, {
			message: "Family name is required",
		}),
	phoneNumber: z
		.string()
		.optional()
		.nullable()
		.refine(
			(value) => {
				if (!value) return true;
				return isValidPhoneNumber(value);
			},
			{
				message: "Invalid phone number format",
			}
		),
	email: z
		.string()
		.min(1, {
			message: "Email is required",
		})
		.email({
			message: "Please enter a valid email",
		}),
	storeName: z
		.string({
			message: "Store name is required",
		})
		.min(1, {
			message: "Store name is required",
		}),
	storeAddress: z.string().optional(),
	storeWebsite: z.string().optional(),
	password: z
		.string({
			required_error: "Password is required",
		})
		.min(6, {
			message: "Password must be at least 6 characters long",
		}),
});

export const ResetSchema = z.object({
	email: z
		.string()
		.min(1, {
			message: "Email is required",
		})
		.email({
			message: "Please enter a valid email",
		})
});
export const NewPasswordSchema = z.object({
	password: z
		.string({
			required_error: "Password is required",
		})
		.min(6, {
			message: "Password must be at least 6 characters long",
		}),
});
