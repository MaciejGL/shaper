import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { emailValidation } from '@/utils/validation';

interface EmailFormProps {
	email: string;
	isLoading: boolean;
	onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: () => void;
}

export const EmailForm: React.FC<EmailFormProps> = ({
	email,
	isLoading,
	onEmailChange,
	onSubmit,
}) => {
	return (
		<form className="flex flex-col gap-2">
			<label htmlFor="email" className="text-sm font-medium">
				Email
				<Input id="email" value={email} onChange={onEmailChange} autoFocus />
			</label>
			<Button
				type="submit"
				loading={isLoading}
				onClick={e => {
					e.preventDefault();
					onSubmit();
				}}
				disabled={!emailValidation(email)}
			>
				Send code
			</Button>
		</form>
	);
};
