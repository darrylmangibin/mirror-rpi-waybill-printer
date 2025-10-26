import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PrimaryButton = ({ children, onClick, className, type = "button" }: { children: React.ReactNode, onClick: () => void, className?: string, type?: 'button' | 'submit' | 'reset' }) => {
  return (
		<Button
			size='sm'
			type={type}
			onClick={onClick}
			className={cn('bg-linear-to-br from-purple-900 via-purple-700 to-purple-500 hover:from-purple-950 hover:via-purple-750 hover:to-purple-550 text-white active:scale-95 focus:outline-none focus:ring-0 rounded-xl', className)}>
			{children}
		</Button>
	);
}

export default PrimaryButton