import {
	InputOTP,
	InputOTPSeparator,
	InputOTPSlot,
} from '@/components/ui/input-otp';

interface OtpFormProps {
	otp: string;
	onOtpChange: (value: string) => void;
	handleLogin: () => void;
}

export const OtpForm: React.FC<OtpFormProps> = ({
	otp,
	onOtpChange,
	handleLogin,
}) => (
	<form
		className="flex flex-col items-center gap-2"
		onSubmit={e => {
			e.preventDefault();
			handleLogin();
		}}
	>
		<label htmlFor="otp" className="text-sm font-medium">
			<InputOTP maxLength={6} size={80} value={otp} onChange={onOtpChange}>
				{[...Array(6)].map((_, index) => (
					<>
						<InputOTPSlot key={index} index={index} />
						{index === 2 && <InputOTPSeparator />}
					</>
				))}
			</InputOTP>
		</label>
	</form>
);
