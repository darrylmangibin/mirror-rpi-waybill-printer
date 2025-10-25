import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PrimaryButton = ({ children, onClick, className }: { children: React.ReactNode, onClick: () => void, className?: string }) => {
  return (
		<Button
			size='sm'
			onClick={onClick}
			className={cn('bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 hover:from-purple-950 hover:via-purple-750 hover:to-purple-550 text-white active:scale-95 focus:outline-none focus:ring-0', className)}>
			{children}
		</Button>
	);
}

export default PrimaryButton